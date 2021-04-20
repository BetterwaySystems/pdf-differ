'use strict';

const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');
const PdfDocument = require('./PdfDocument');
const { Readable } = require('stream');

const comparePdfs = async (baselinePdf, actualPdf, { pageRange, getDiffImageFile } = {}) => {
  const baselinePdfDoc = new PdfDocument(baselinePdf);
  const actualPdfDoc = new PdfDocument(actualPdf);

  await baselinePdfDoc.load();
  await actualPdfDoc.load();

  const results = {
    baseline: {
      pageCount: baselinePdfDoc.pageCount
    },
    actual: {
      pageCount: actualPdfDoc.pageCount
    }
  };

  if (results.actual.pageCount !== results.baseline.pageCount) {
    return results;
  }

  const baselinePages = await baselinePdfDoc.convertPages({ pageRange });
  const actualPages = await actualPdfDoc.convertPages({ pageRange });

  results.diffs = baselinePages.map((baselinePage, index) => {
    const actualPage = actualPages[index];
    const { pageNumber } = baselinePage;

    const baselineImage = PNG.sync.read(baselinePage.output);
    const actualImage = PNG.sync.read(actualPage.output);

    const { width, height } = baselineImage;

    let diffImage;
    if (getDiffImageFile) {
      diffImage = new PNG({ width, height });
    }

    const numDiffPixels = pixelmatch(
      baselineImage.data,
      actualImage.data,
      diffImage ? diffImage.data : null,
      width,
      height
    );

    const result = {
      pageNumber,
      numDiffPixels,
      percentDiffPixels: numDiffPixels / (width * height)
    };

    if (diffImage) {
      const readable = new Readable({
        read() {
          this.push(PNG.sync.write(diffImage))
        }
      });

      result.diffImageFileBuffer = readable.read();      
    }
    return result;
  });

  return results;
};

module.exports = comparePdfs;
