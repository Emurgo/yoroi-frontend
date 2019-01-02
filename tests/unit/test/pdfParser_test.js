import { assert } from 'chai';
import mockData from './mockData/mockData.json';
import { getMockedFileBuffer } from './mockData/mockDataBuilder';

const pdfParser = require('../../../app/api/ada/lib/pdfParser');

describe('PDF parse test', () => {
  it('should parse PDF content', async () => {
    const fileBuffer = getMockedFileBuffer('regular.pdf');
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
      assert.notEqual(error.message, 'assert.fail()', 'Test failed');
    }
  });

  it('should fail parsing PDF content when an invalid file is passed', async () => {
    const fileBuffer = getMockedFileBuffer('regular.txt');
    try {
      await pdfParser.parsePDFFile(Buffer.from(fileBuffer));
      assert.fail();
    } catch (error) {
      assert.notEqual(error.message, 'assert.fail()', 'Test failed');
    }
  });
});

describe('PDF decrypt test', () => {
  it('should decrypt and read encrypted regular PDF content', async() => {
    const fileBuffer = getMockedFileBuffer('regular.pdf.enc');
    try {
      const decryptedFile = pdfParser.decryptFile(mockData.decryptPDF.passphrase,
        mockData.decryptPDF.regularTitle, fileBuffer);
      const result = await pdfParser.parsePDFFile(Buffer.from(decryptedFile));
      assert.equal(result, mockData.decryptPDF.regularPDFContent, 'PDF parser result does not equal content');
    } catch (error) {
      assert.fail(error.message);
    }
  });

  it('should decrypt and read encrypted force vended PDF content', async() => {
    const fileBuffer = getMockedFileBuffer('force-vended.pdf.enc');
    try {
      const decryptedFile = pdfParser.decryptFile(mockData.decryptPDF.data, 'forceVended', fileBuffer);
      const result = await pdfParser.parsePDFFile(Buffer.from(decryptedFile));
      assert.equal(result, mockData.decryptPDF.forceVendedPDFContent, 'PDF parser result does not equal content');
    } catch (error) {
      assert.fail(error.message);
    }
  });

  it('should fail at decrypting with no data', async() => {
    try {
      const decryptedFile = pdfParser.decryptFile();
      assert.equal(decryptedFile, undefined);
    } catch (error) {
      assert.notEqual(error.message, 'assert.fail()', 'Test failed');
    }
  });

  it('should fail at decrypting when only redemtion key is passed', async() => {
    try {
      pdfParser.decryptFile(mockData.decryptPDF.passphrase);
      assert.fail();
    } catch (error) {
      assert.notEqual(error.message, 'assert.fail()', 'Test failed');
    }
  });
});
