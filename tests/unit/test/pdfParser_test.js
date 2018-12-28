import { assert } from 'chai';

const fs = require('fs');
const path = require('path');
const pdfParser = require('../../../app/api/ada/lib/pdfParser');

it('should read PDF content', () => {
  const PDFContent = 'opqrmev edroxpwghg IS ELIGIBLE FOR 12345 TO BE REDEEMED WITH THE VENDING ADDRESS'
   + ' PcnwlQMQzjRtKvBCz38k-wMoIWZSBtzTT7rvfoARaF8= txboqa —————— TRANSACTION ID —————— '
   + 'llVRYvW7LAyqmDMnUOvrs5ih4OHfLiLZrz5NT+iRuTw= —————— REDEMPTION KEY —————— ';
  const PDFPath = path.resolve('./tests/unit/test/mockData/test.pdf');
  const file = fs.readFileSync(PDFPath);
  pdfParser.parsePDFFile(file)
    .then(result => assert.equal(result, PDFContent, 'PDF parser result does not equal content'))
    .catch(e => console.log(e));
});
