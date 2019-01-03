import { assert } from 'chai';
import mockData from './mockData/mockData.json';
import { getMockedFileBuffer } from './mockData/mockDataBuilder';

const pdfParser = require('../../../app/api/ada/lib/pdfParser');

describe('PDF get secret key tests', () => {
  it('should get the secret key from a parsed PDF', () => {
    const { parsePDF } = mockData;

    try {
      const secretKey = pdfParser.getSecretKey(parsePDF.PDFContent);

      assert.equal(secretKey, parsePDF.secretKey, 'Secret key does not equal content');
    } catch (error) {
      assert.fail(error.message);
    }
  });

  it('should fail if PDF is missing', () => {
    try {
      pdfParser.getSecretKey();

      assert(false, 'getSecretKey did not throw an exception');
    } catch (error) {
      assert(true);
    }
  });

  it('should fail if parsed PDF has no redemption key', () => {
    const { parsePDF } = mockData;

    try {
      pdfParser.getSecretKey(parsePDF.noKeyPDFContent);

      assert(false, 'getSecretKey did not throw an exception');
    } catch (error) {
      assert.equal(error.defaultMessage, '!!!Invalid certificate.');
    }
  });
});

describe('PDF parse test', () => {
  it('should parse PDF content', async () => {
    const fileBuffer = getMockedFileBuffer('test.pdf');
    try {
      const result = await pdfParser.parsePDFFile(fileBuffer);
      assert.equal(result, mockData.parsePDF.PDFContent, 'PDF parser result does not equal content');
    } catch (error) {
      assert.fail(error.message);
    }
  });

  it('should fail parsing PDF content when no file is passed', async () => {
    try {
      await pdfParser.parsePDFFile();
      assert.fail();
    } catch (error) {
      assert(true);
    }
  });

  it('should fail parsing PDF content when an invalid file is passed', async () => {
    const fileBuffer = getMockedFileBuffer('test.txt');
    try {
      await pdfParser.parsePDFFile(Buffer.from(fileBuffer));
      assert.fail();
    } catch (error) {
      assert(true);
    }
  });
});
