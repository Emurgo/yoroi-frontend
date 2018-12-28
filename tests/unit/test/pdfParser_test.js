import { assert } from 'chai';

const fs = require('fs');
const path = require('path');
const pdfParser = require('../../../app/api/ada/lib/pdfParser');

describe('PDF read test', () => {
  it('should read PDF content', async () => {
    const PDFContent = 'opqrmev edroxpwghg IS ELIGIBLE FOR 12345 TO BE REDEEMED WITH THE VENDING ADDRESS'
    + ' PcnwlQMQzjRtKvBCz38k-wMoIWZSBtzTT7rvfoARaF8= txboqa —————— TRANSACTION ID —————— '
    + 'llVRYvW7LAyqmDMnUOvrs5ih4OHfLiLZrz5NT+iRuTw= —————— REDEMPTION KEY —————— ';
    const PDFPath = path.resolve('./tests/unit/test/mockData/test.pdf');
    const file = fs.readFileSync(PDFPath);
    try {
      const result = await pdfParser.parsePDFFile(file);
      assert.equal(result, PDFContent, 'PDF parser result does not equal content');
    } catch (error) {
      assert.fail(error.message);
    }
  });

  it('should fail reading PDF content when no file is passed', async () => {
    try {
      await pdfParser.parsePDFFile();
      assert.fail();
    } catch (error) {
      assert(true);
    }
  });

  it('should fail reading PDF content when an invalid file is passed', async () => {
    const PDFPath = path.resolve('./tests/unit/test/mockData/test.txt');
    const file = fs.readFileSync(PDFPath);
    try {
      await pdfParser.parsePDFFile(Buffer.from(file));
      assert.fail();
    } catch (error) {
      assert(true);
    }
  });
});
