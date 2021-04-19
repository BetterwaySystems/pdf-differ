'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { multirange } = require('multi-integer-range');
const isStream = require('is-stream');

const pdfjsLib = require('pdfjs-dist/es5/build/pdf.js');
const NodeCanvasFactory = require('./NodeCanvasFactory');

const unbounded = (value) => multirange(value, { parseUnbounded: true });

const getPages = (pageCount, pageRange) => {
  const actualPages = [[1, pageCount]];
  const pages = unbounded(pageRange || `1-${pageCount}`).intersect(actualPages);
  return pages.toArray();
};

const streamToBuffer = (stream) => {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream
      .on('data', (chunk) => chunks.push(chunk))
      .on('error', reject)
      .on('end', () => resolve(Buffer.concat(chunks)));
  });
};

const allowedDestValues = ['buffer', 'file'];
const allowedDestFormatValues = ['png'];

class PdfDocument {
  constructor(pdfSource) {
    this.source = pdfSource;
    this.loaded = false;
  }

  get pageCount() {
    return this.document.numPages;
  }

  async load() {
    if (this.loaded === true) {
      throw new Error('load() may only be called once for a PdfDocument');
    }

    let buf = this.source;
    if (_.isString(buf)) {
      // Assume string is a file name
      buf = fs.readFileSync(buf);
    } else if (isStream(buf)) {
      buf = await streamToBuffer(buf);
    }

    const rawData = new Uint8Array(buf);
    this.document = await pdfjsLib.getDocument({ data: rawData, verbosity: 0 }).promise;

    this.loaded = true;
  }

  // eslint-disable-next-line object-curly-newline
  async convertPages({ pageRange, destFormat = 'png', dest = 'buffer', destBaseFileName = 'output.png' } = {}) {
    if (!this.loaded) {
      throw new Error('load() must be called before accessing members of a PdfDocument');
    }

    if (!allowedDestValues.includes(dest)) {
      throw new Error(`Invalid dest option: ${dest}. Accepted values: ${allowedDestValues.join(', ')}`);
    }

    if (!allowedDestFormatValues.includes(destFormat)) {
      throw new Error(`Invalid destFormat option: ${destFormat}. Accepted values: ${allowedDestFormatValues.join(', ')}`);
    }

    const pages = getPages(this.document.numPages, pageRange);
    return Promise.all(pages.map(async (pageNumber) => {
      const pdfPage = await this.document.getPage(pageNumber);

      // Render the page on a Node canvas with 100% scale
      const viewport = pdfPage.getViewport({ scale: 1.0 });
      const canvasFactory = new NodeCanvasFactory();
      const canvasAndContext = canvasFactory.create(
        viewport.width,
        viewport.height
      );
      const renderContext = {
        canvasContext: canvasAndContext.context,
        viewport,
        canvasFactory
      };

      await pdfPage.render(renderContext).promise;
      const imageBuffer = canvasAndContext.canvas.toBuffer();

      if (dest === 'buffer') {
        return {
          pageNumber,
          output: imageBuffer
        };
      }

      if (dest === 'file') {
        const basePath = path.resolve(destBaseFileName);
        const basePathNoExt = path.basename(basePath, path.extname(basePath));
        const pageFileName = `${basePathNoExt}_${pageNumber}.png`;
        fs.writeFileSync(pageFileName, imageBuffer);
        return {
          pageNumber,
          output: pageFileName
        };
      }
    }));
  }
}

module.exports = PdfDocument;
