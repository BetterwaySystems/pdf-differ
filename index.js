/* eslint-disable func-names */

'use strict';

const comparePdfs = require('./lib/comparePdfs');

module.exports = {
  compare: comparePdfs,
  chaiPlugin(chai) {
    const { Assertion } = chai;

    Assertion.addMethod('equalPdf', async function (baselinePdf, options) {
      // eslint-disable-next-line no-underscore-dangle
      const { _obj: actualPdf } = this;
      const results = await comparePdfs(baselinePdf, actualPdf, options);

      // Return assertion error for mismatched page counts
      new Assertion(
        results.actual.pageCount,
        `expected ${actualPdf} to have same page count as ${baselinePdf}`
      ).to.equal(results.baseline.pageCount);

      const pageDiffs = results.diffs.filter((diff) => diff.numDiffPixels > 0);

      this.assert(
        pageDiffs.length === 0,
        `expected #{this} to equal pdf #{exp}\n${JSON.stringify(pageDiffs, null, 2)}`,
        'expected #{this} to not equal pdf #{exp}',
        baselinePdf,
        actualPdf
      );
    });
  }
};
