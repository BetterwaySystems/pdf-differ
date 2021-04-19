# pdf-diff
> Carefully modified @exzeo/pdf-diff package. This package is meant to replace original @exzeo/pdf-diff, @exzeo/pdf-diff should be removed to avoid interference and unexpected behavior. Origin Package [https://www.npmjs.com/package/@exzeo/pdf-diff].

Q : What is Diff between this package and origin package? 
A : `assert` module remove strict for node 8 version.

Compares two PDFs and provides results on how they differ, including a diff image.

## Install

```bash
npm install exframe-pdf-diff
```

## Usage

### compare
`compare` function takes two PDFs as input and returns a `Promise` that is fulfilled with the difference results when the comparison is complete.


```javascript
const { compare } = require('exframe-pdf-diff');

(async () => {
  const result = await compare('./one.pdf', './two.pdf', {
    diffImageFileName: './diff.png'),
  });

  console.log(result);
})();


Output:
{
  baseline: { pageCount: 2 },
  actual: { pageCount: 2 },
  diffs: [
    {
      pageNumber: 1,
      numDiffPixels: 32563,
      percentDiffPixels: 0.06718120749983494,
      diffImageFileName: '/diff_1.png'
    },
    {
      pageNumber: 2,
      numDiffPixels: 0,
      percentDiffPixels: 0,
      diffImageFileName: '/diff_2.png'
    }
  ]
}
```

### chaiPlugin

`chaiPlugin` is a function that can be passed to [chai.use](https://www.chaijs.com/guide/plugins/) for convenient test assertions when verifying PDFs.

```javascript
const chai = require('chai');
const { expect } = chai;
chai.use(require('exframe-pdf-diff').chaiPlugin);

describe('generated PDF', () => {
  it('matches baseline', async () => {
    await expect('./new.pdf').to.equalPdf('./baseline.pdf', {
      diffImageFileName: './diff.png'),
    });
  });
});
```

## API

### compare(pdf1, pdf2, options?)

Returns a `Promise` that is either fulfilled with the difference results when the comparison is completed successfully, or rejected with an error.

#### pdf1|pdf2

Type: `Buffer` | `String` | `Stream`

PDF used in comparison. A provided `String` is assumed to be a file name. A `Buffer` and `Stream` is assumed to contain binary PDF data. ***Note:*** Stream input will be read into a memory buffer prior to loading the document.

#### options

Type: `object`

##### pageRange

Type: `String`\
Default: `'1-'` (all pages)

One or more pages to compare. Accepts a comma-separated list (i.e. `'1,3,7'`), a range (i.e. `'1-3'`), or combination (`'1,5,8-'`).

##### diffImageFileName

Type: `String`\
Default: (no diff image)

When present, enables diff image output for each page that is compared.

### chaiPlugin

All input and options for the chai plugin are the same as the `compare` function.
