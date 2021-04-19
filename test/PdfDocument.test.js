'use strict';

const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const PdfDocument = require('../lib/PdfDocument');

const documentsFolder = path.resolve(__dirname, './documents');

describe('PdfDocument class', () => {
  describe('constructor', () => {
    it('creates a new instance from a PDF file name string', () => {
      const doc = new PdfDocument(path.join(documentsFolder, 'test.pdf'));
      expect(doc).to.be.an.instanceof(PdfDocument);
    });

    it('creates a new instance from a PDF buffer', () => {
      const doc = new PdfDocument(fs.readFileSync(path.join(documentsFolder, 'test.pdf')));
      expect(doc).to.be.an.instanceof(PdfDocument);
    });

    it('creates a new instance from a stream', () => {
      const doc = new PdfDocument(fs.createReadStream(path.join(documentsFolder, 'test.pdf')));
      expect(doc).to.be.an.instanceof(PdfDocument);
    });
  });

  describe('load', () => {
    let doc;
    beforeEach(() => {
      doc = new PdfDocument(path.join(documentsFolder, 'test.pdf'));
    });

    it('returns a promise', (done) => {
      const val = doc.load();
      expect(val).to.be.a('promise');
      val.then(done).catch(done);
    });

    it('loads a valid PDF when called once', async () => {
      await doc.load();
      expect(doc.pageCount).to.equal(3);
    });

    it('rejects when called twice', (done) => {
      doc.load().then(() => {
        doc.load().then(() => {
          done(new Error('expected second load() call to reject!'));
        }).catch((err) => {
          try {
            expect(err.message).to.equal('load() may only be called once for a PdfDocument');
          } catch (assertErr) {
            done(assertErr);
            return;
          }
          done();
        });
      }).catch((err) => {
        done(new Error(`expected first load() call to resolve but rejected: ${err}`));
      });
    });
  });
});
