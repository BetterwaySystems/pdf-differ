'use strict';

const { expect } = require('chai');
const path = require('path');
const fs = require('fs');
const makeDir = require('make-dir');
const del = require('del');
const comparePdfs = require('../lib/comparePdfs');

const documentsDir = path.join(__dirname, 'documents');
const outputDir = path.join(__dirname, 'output');

describe('comparePdfs', async function () {
  this.timeout(30000);

  beforeEach(async () => {
    await makeDir(outputDir);
  });

  afterEach(async () => {
    await del(outputDir);
  });

  [{
    description: 'compares all pages of identical PDFs from file names',
    baselinePdf: path.join(documentsDir, 'test.pdf'),
    actualPdf: path.join(documentsDir, 'test.pdf'),
    expectedResult: {
      baseline: { pageCount: 3 },
      actual: { pageCount: 3 },
      diffs: [{
        pageNumber: 1,
        numDiffPixels: 0,
        percentDiffPixels: 0
      }, {
        pageNumber: 2,
        numDiffPixels: 0,
        percentDiffPixels: 0
      }, {
        pageNumber: 3,
        numDiffPixels: 0,
        percentDiffPixels: 0
      }]
    }
  }, {
    description: 'compares all pages of different PDFs from file names',
    baselinePdf: path.join(documentsDir, 'test.pdf'),
    actualPdf: path.join(documentsDir, 'test_diff.pdf'),
    diffImageFileName: path.join(outputDir, 'diff.png'),
    expectedResult: {
      baseline: { pageCount: 3 },
      actual: { pageCount: 3 },
      diffs: [{
        pageNumber: 1,
        numDiffPixels: 32563,
        percentDiffPixels: 0.06718120749983494,
        diffImageFileName: path.join(outputDir, 'diff_1.png')
      }, {
        pageNumber: 2,
        numDiffPixels: 0,
        percentDiffPixels: 0,
        diffImageFileName: path.join(outputDir, 'diff_2.png')
      }, {
        pageNumber: 3,
        numDiffPixels: 32558,
        percentDiffPixels: 0.06717089192579388,
        diffImageFileName: path.join(outputDir, 'diff_3.png')
      }]
    }
  }].forEach((testCase) => {
    it(`${testCase.description}`, async () => {
      const result = await comparePdfs(testCase.baselinePdf, testCase.actualPdf, { ...testCase });
      expect(result).to.deep.equal(testCase.expectedResult);
      result.diffs.forEach((res) => {
        if (res.diffImageFileName) {
          expect(fs.existsSync(res.diffImageFileName)).to.be.true;
        }
      });
    });
  });
});
