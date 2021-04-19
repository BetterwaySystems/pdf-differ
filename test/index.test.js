'use strict';

const chai = require('chai');
const path = require('path');
const fs = require('fs');
const del = require('del');
const mkdir = require('make-dir');

const { expect } = chai;
chai.use(require('..').chaiPlugin);

const documentsDir = path.join(__dirname, 'documents');
const outputDir = path.join(__dirname, 'output');

describe('chai-pdf-js', function () {
  this.timeout(30000);

  beforeEach(() => {
    mkdir(outputDir);
  });

  afterEach(() => {
    del.sync(outputDir);
  });

  describe('when both PDFs are specified from file names', () => {
    describe('and the PDFs are the same', () => {
      it('expect passes', async () => {
        const actualPdfFileName = path.join(documentsDir, 'test.pdf');
        const baselinePdfFileName = path.join(documentsDir, 'test.pdf');
        await expect(actualPdfFileName).to.equalPdf(baselinePdfFileName);
      });

      it('negative expect fails', async () => {
        const actualPdfFileName = path.join(documentsDir, 'test.pdf');
        const baselinePdfFileName = path.join(documentsDir, 'test.pdf');
        try {
          await expect(actualPdfFileName).to.not.equalPdf(baselinePdfFileName);
        } catch (err) {
          expect(err.message).to.match(/^expected '.*' to not equal pdf '.*'/);
        }
      });
    });

    describe('and the PDFs are different', () => {
      it('negative expect passes', async () => {
        const actualPdfFileName = path.join(documentsDir, 'test.pdf');
        const baselinePdfFileName = path.join(documentsDir, 'test_diff.pdf');
        await expect(actualPdfFileName).to.not.equalPdf(baselinePdfFileName, { diffImageFileName: path.join(outputDir, 'diff.png') });
      });

      it('expect fails', async () => {
        const actualPdfFileName = path.join(documentsDir, 'test.pdf');
        const baselinePdfFileName = path.join(documentsDir, 'test_diff.pdf');
        try {
          await expect(actualPdfFileName).to.equalPdf(baselinePdfFileName, { diffImageFileName: path.join(outputDir, 'diff.png') });
        } catch (err) {
          expect(err.message).to.match(/^expected '.*' to equal pdf '.*'/);
          expect(err.message).to.have.string('"pageNumber": 1');
          expect(err.message).to.not.have.string('"pageNumber": 2');
          expect(err.message).to.have.string('"pageNumber": 3');
          expect(err.message).to.have.string('"numDiffPixels"');
          expect(err.message).to.have.string('"percentDiffPixels"');
          expect(err.message).to.have.string('"diffImageFileName"');
        }
      });
    });
  });

  describe('when both PDFs are specified from buffers', () => {
    describe('and both PDFs are the same', () => {
      it('expect passes', async () => {
        const actualPdfBuffer = fs.readFileSync(path.join(documentsDir, 'test.pdf'));
        const baselinePdfBuffer = fs.readFileSync(path.join(documentsDir, 'test.pdf'));
        await expect(actualPdfBuffer).to.equalPdf(baselinePdfBuffer);
      });
    });
  });
});
