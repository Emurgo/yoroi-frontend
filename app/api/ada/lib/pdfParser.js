// @flow
import pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min';
import type { PDF } from '../adaTypes';
import { decryptForceVend, decryptRecoveryRegularVend, decryptRecoveryForceVend, decryptRegularVend } from './decrypt';
import { InvalidCertificateError, ReadFileError, DecryptionError, ParsePDFFileError, ParsePDFPageError, ParsePDFKeyError } from '../errors';
import { Logger, stringifyError } from '../../../utils/logging';

// Pdfjs Worker is initialized, reference to issue: https://github.com/mozilla/pdf.js/issues/7612#issuecomment-315179422
const pdfjsWorkerBlob = new Blob([pdfjsWorker]);
const pdfjsWorkerBlobURL = URL.createObjectURL(pdfjsWorkerBlob);
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerBlobURL;

export const getSecretKey = (parsedPDF: string): string => {
  try {
    const splitArray = parsedPDF.trim().split(' ');
    const lastItem = splitArray[splitArray.length - 1];

    if (lastItem !== '——————' && lastItem !== 'KEY') {
      throw new InvalidCertificateError();
    }

    let redemptionKeyIndex = 0;
    let elementsAfterRedemptionKey;

    if (lastItem === '——————') {
      elementsAfterRedemptionKey = 5;
      redemptionKeyIndex = splitArray.length - elementsAfterRedemptionKey;
    }

    if (lastItem === 'KEY') {
      elementsAfterRedemptionKey = 3;
      redemptionKeyIndex = splitArray.length - elementsAfterRedemptionKey;
    }

    const redemptionKey = splitArray[redemptionKeyIndex];

    return redemptionKey;
  } catch (error) {
    Logger.error('pdfParser::getSecretKey error: ' + stringifyError(error));
    if (error instanceof InvalidCertificateError) {
      throw error;
    }
    throw new ParsePDFKeyError();
  }
};

export const readFile = (file: ?Blob): Promise<Uint8Array> => new Promise((resolve, reject) => {
  try {
    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        const { result } = reader;
        const buffer = typeof result === 'string' ? JSON.parse(result) : result;
        const fileBuffer = buffer === null
          ? new Uint8Array(0)
          : new Uint8Array(buffer);
        resolve(fileBuffer);
      };
      reader.readAsArrayBuffer(file);
    } else {
      throw new Error();
    }
  } catch (error) {
    Logger.error('pdfParser::readFile error: ' + stringifyError(error));
    reject(new ReadFileError());
  }
});

export const decryptFile = (
  decryptionKey: ?string,
  redemptionType: string,
  file: Uint8Array
): Uint8Array => {
  try {
    // If pass phrase is given assume that it's an encrypted certificate
    if (decryptionKey) {
      // Decrypt the file
      let decryptedFile;
      switch (redemptionType) {
        case 'forceVended': {
          const decryptionKeyArray = decryptionKey.split(',');
          decryptedFile = decryptForceVend(decryptionKeyArray, file);
          break;
        }
        case 'recoveryRegular':
          decryptedFile = decryptRecoveryRegularVend(decryptionKey, file);
          break;
        case 'recoveryForceVended':
          decryptedFile = decryptRecoveryForceVend(decryptionKey, file);
          break;
        default: // regular
          decryptedFile = decryptRegularVend(decryptionKey, file);
      }
      return decryptedFile;
    }
    return file;
  } catch (error) {
    Logger.error('pdfParser::decryptFile error: ' + stringifyError(error));
    throw new DecryptionError();
  }
};

// It was based in the following example: https://ourcodeworld.com/articles/read/405/how-to-convert-pdf-to-text-extract-text-from-pdf-with-javascript
export const parsePDFFile = (file: Uint8Array): Promise<string> => (
  new Promise((resolve, reject) => {
    pdfjsLib.getDocument(file).then(async pdf => {
      let pagesText = '';
      for (let i = 0; i < pdf._pdfInfo.numPages; i++) {
        pagesText += await _readPage(pdf, i + 1);
      }
      return resolve(pagesText);
    }).catch(error => {
      Logger.error('pdfParser::parsePDFFile error: ' + stringifyError(error));
      reject(new ParsePDFFileError());
    });
  })
);

const _readPage = (pdf: PDF, pageNumber: number): Promise<string> => (
  new Promise((resolve, reject) => {
    pdf.getPage(pageNumber)
      .then(pdfPage => pdfPage.getTextContent())
      .then(textContent => {
        const textItems = textContent.items;
        let finalString = '';
        // Concatenate the string of the item to the final string
        for (let i = 0; i < textItems.length; i++) {
          const item = textItems[i];
          finalString += item.str + ' ';
        }
        return resolve(finalString);
      })
      .catch(error => {
        Logger.error('pdfParser::_readPage error: ' + stringifyError(error));
        reject(new ParsePDFPageError());
      });
  })
);
