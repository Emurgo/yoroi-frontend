import chai, { assert } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import mockData from '../mockData/mockData.json';
import { getMockedFileBuffer } from '../mockData/mockDataBuilder';
import { ParsePDFKeyError, InvalidCertificateError } from '../../../app/api/ada/errors';

// This import will correctly initialize pdfjs worker:
// Reference to issue: https://github.com/mozilla/pdf.js/issues/9579
import 'pdfjs-dist/build/pdf.worker.entry';

chai.use(chaiAsPromised);
const should = chai.should(); // eslint-disable-line
const expect = chai.expect(); // eslint-disable-line

// URL.createObjectUrl is mocked since it is used in pdfParser, and it is not supported by Jest
// Reference to issue: https://stackoverflow.com/questions/52968969/jest-url-createobjecturl-is-not-a-function
global.URL.createObjectURL = () => {};

// The variable CONFIG is set as an environment variable before running the app.
// If its value is undefined, the Logger in pdfParser will break, so we have to mock it.
global.CONFIG = {
  network: {
    name: 'test'
  },
  app: {}
};

const pdfParser = require('../../../app/api/ada/lib/pdfParser');

const getMockedRegularBuffer = () => getMockedFileBuffer('regular.pdf');
const getMockedInvalidRegularBuffer = () => getMockedFileBuffer('regular.txt');
const getMockedRegularEncryptedBuffer = () => getMockedFileBuffer('regular.pdf.enc');
const getMockedRegularDecryptedBuffer = () => getMockedFileBuffer('regular-decrypted.txt');
const getMockedForceVendedEncryptedBuffer = () => getMockedFileBuffer('force-vended.pdf.enc');
const getMockedForceVendedDecryptedBuffer = () => getMockedFileBuffer('force-vended-decrypted.txt');

describe('Get mocked file buffer without errors test', () => {
  it('should get the mocked regular buffer without errors', () => (
    Promise.resolve(getMockedRegularBuffer())
  ));
  it('should get the mocked invalid regular buffer without errors', () => (
    Promise.resolve(getMockedInvalidRegularBuffer())
  ));
  it('should get the mocked regular encrypted buffer without errors', () => (
    Promise.resolve(getMockedRegularEncryptedBuffer())
  ));
  it('should get the mocked regular decrypted buffer without errors', () => (
    Promise.resolve(getMockedRegularDecryptedBuffer())
  ));
  it('should get the mocked force vended encrypted buffer without errors', () => (
    Promise.resolve(getMockedForceVendedEncryptedBuffer())
  ));
  it('should get the mocked force vended decrypted buffer without errors', () => (
    Promise.resolve(getMockedForceVendedDecryptedBuffer())
  ));
});

describe('PDF get secret key tests', () => {
  it('should get the secret key from a parsed PDF', () => {
    const { parsePDF } = mockData;
    const secretKey = pdfParser.getSecretKey(parsePDF.PDFContent);

    assert.equal(secretKey, parsePDF.secretKey, 'Secret key should equal specific content');
  });

  it('should fail if PDF is missing', () => {
    assert.throws(
      () => { pdfParser.getSecretKey(); },
      ParsePDFKeyError
    );
  });

  it('should fail if parsed PDF has no redemption key', () => {
    const { parsePDF } = mockData;

    assert.throws(
      () => { pdfParser.getSecretKey(parsePDF.noKeyPDFContent); },
      InvalidCertificateError
    );
  });
});

describe('PDF parse test', () => {
  it('should parse PDF content', async () => {
    const fileBuffer = getMockedRegularBuffer();
    const result = await pdfParser.parsePDFFile(fileBuffer);
    assert.equal(result, mockData.parsePDF.PDFContent, 'PDF parser result should equal content');
  });

  it('should fail parsing PDF content when no file is passed', () => (
    pdfParser.parsePDFFile().should.be.rejectedWith(mockData.parsePDF.parametersError)
  ));

  it('should fail parsing PDF content when an invalid file is passed', () => {
    const fileBuffer = getMockedInvalidRegularBuffer();
    return pdfParser.parsePDFFile(Buffer.from(fileBuffer))
      .should.be.rejectedWith(mockData.parsePDF.structureError);
  });
});

describe('PDF decrypt test', () => {
  it('should decrypt regular PDF', () => {
    const fileBuffer = getMockedRegularEncryptedBuffer();
    const decryptedFileBuffer = getMockedRegularDecryptedBuffer();
    const { decryptPDF } = mockData;
    const { passphrase, regularTitle } = decryptPDF;
    const decryptedFile = pdfParser.decryptFile(passphrase, regularTitle, fileBuffer);

    assert(Buffer.from(decryptedFile).equals(decryptedFileBuffer), 'PDF decrypted content should equal specific content');
  });

  it('should decrypt force vended PDF', () => {
    const fileBuffer = getMockedForceVendedEncryptedBuffer();
    const decryptedFileBuffer = getMockedForceVendedDecryptedBuffer();
    const decryptedFile = pdfParser.decryptFile(mockData.decryptPDF.data.toString(), 'forceVended', fileBuffer);
    assert(Buffer.from(decryptedFile).equals(decryptedFileBuffer), 'PDF decrypted content should equal specific content');
  });

  it('should return same file when no decryption key is passed', () => {
    const fileBuffer = getMockedForceVendedEncryptedBuffer();
    const decryptedFile = pdfParser.decryptFile(undefined, undefined, fileBuffer);
    assert(Buffer.from(decryptedFile).equals(fileBuffer), 'Result content should equal initial content');
  });

  it('should fail at decrypting when only decryption key is passed', () => {
    assert.throws(
      () => pdfParser.decryptFile(mockData.decryptPDF.passphrase),
      mockData.decryptPDF.decryptionError
    );
  });
});
