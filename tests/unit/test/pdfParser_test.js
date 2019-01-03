import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import mockData from './mockData/mockData.json';
import { getMockedFileBuffer } from './mockData/mockDataBuilder';

const pdfParser = require('../../../app/api/ada/lib/pdfParser');

chai.use(chaiAsPromised);
const should = chai.should(); // eslint-disable-line

describe('PDF parse test', () => {
  it('should parse PDF content', async () => {
    const fileBuffer = getMockedFileBuffer('regular.pdf');
    try {
      const result = await pdfParser.parsePDFFile(fileBuffer);
      assert.equal(result, mockData.parsePDF.PDFContent, 'PDF parser result should equal content');
    } catch (error) {
      assert.fail(error.message);
    }
  });

  it('should fail parsing PDF content when no file is passed', () => {
    return pdfParser.parsePDFFile().should.be.rejectedWith(mockData.parsePDF.parametersError);
  });

  it('should fail parsing PDF content when an invalid file is passed', async () => {
    const fileBuffer = getMockedFileBuffer('regular.txt');
    return pdfParser.parsePDFFile(Buffer.from(fileBuffer))
      .should.be.rejectedWith(mockData.parsePDF.structureError);
  });
});

describe('PDF decrypt test', () => {
  it('should decrypt and read encrypted regular PDF content', async() => {
    const fileBuffer = getMockedFileBuffer('regular.pdf.enc');
    const decryptedFileBuffer = getMockedFileBuffer('regular-decrypted.txt');
    try {
      const decryptedFile = pdfParser.decryptFile(mockData.decryptPDF.passphrase,
        mockData.decryptPDF.regularTitle, fileBuffer);
      assert(Buffer.from(decryptedFile).equals(decryptedFileBuffer), 'PDF decrypted content should equal specific content');
    } catch (error) {
      assert.fail(error.message);
    }
  });

  it('should decrypt and read encrypted force vended PDF content', async() => {
    const fileBuffer = getMockedFileBuffer('force-vended.pdf.enc');
    const decryptedFileBuffer = getMockedFileBuffer('force-vended-decrypted.txt');
    try {
      const decryptedFile = pdfParser.decryptFile(mockData.decryptPDF.data, 'forceVended', fileBuffer);
      assert(Buffer.from(decryptedFile).equals(decryptedFileBuffer), 'PDF decrypted content should equal specific content');
    } catch (error) {
      assert.fail(error.message);
    }
  });

  it('should fail at decrypting with no data', () => {
    assert.isUndefined(pdfParser.decryptFile(), 'No decrypted file defined');
  });

  it('should fail at decrypting when only redemtion key is passed', () => {
    assert.throws(
      () => pdfParser.decryptFile(mockData.decryptPDF.passphrase),
      mockData.decryptPDF.decryptionError
    );
  });
});
