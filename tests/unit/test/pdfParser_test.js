import { assert } from 'chai';
import mockData from './mockData/mockData.json';
import { getMockedFileBuffer } from './mockData/mockDataBuilder';

const pdfParser = require('../../../app/api/ada/lib/pdfParser');

describe('PDF parse test', () => {
  it('should parse PDF content', async () => {
    const fileBuffer = getMockedFileBuffer('test.pdf');
    try {
      const result = await pdfParser.parsePDFFile(fileBuffer);
      assert.equal(result, mockData.PDFContent, 'PDF parser result does not equal content');
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
