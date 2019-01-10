// @flow
import pdfjsLib from 'pdfjs-dist';
import type { FileEvent, PDF } from '../adaTypes';
import { decryptForceVend, decryptRecoveryRegularVend, decryptRecoveryForceVend, decryptRegularVend } from './decrypt';
import { InvalidCertificateError } from '../errors';

export const getSecretKey = (parsedPDF: string): string => {
  const splitArray = parsedPDF.split('——————');
  const redemptionKeyLabel = splitArray[3].trim();

  if (redemptionKeyLabel !== 'REDEMPTION KEY') {
    throw new InvalidCertificateError();
  }

  return splitArray[2].trim();
};

// TODO: check if method is necessary
export const getSelectedFile = (event: FileEvent): Blob => event.target.files[0];

export const readFile = (file: Blob): Promise<Uint8Array> =>
  new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = function () {
        const { result } = reader;
        const buffer = typeof result === 'string' ? JSON.parse(result) : result;
        const fileBuffer = new Uint8Array(buffer);
        resolve(fileBuffer);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      reject(error);
    }
  });

export const decryptFile = (
  decryptionKey: string | Array<string>,
  redemptionType: string,
  file: Uint8Array
): Uint8Array => {
  // If pass phrase is given assume that it's an encrypted certificate
  if (decryptionKey) {
    // Decrypt the file
    let decryptedFile;
    switch (redemptionType) {
      case 'forceVended':
        decryptedFile = decryptForceVend(decryptionKey, file);
        break;
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
};

// It was based in the following example: https://ourcodeworld.com/articles/read/405/how-to-convert-pdf-to-text-extract-text-from-pdf-with-javascript
export const parsePDFFile = (file: Uint8Array): Promise<string> => (
  // TODO: Handle errors
  new Promise((resolve, reject) => {
    pdfjsLib.getDocument(file).then(async pdf => {
      let pagesText = '';
      for (let i = 0; i < pdf._pdfInfo.numPages; i++) {
        pagesText += await _readPage(pdf, i + 1);
      }
      return resolve(pagesText);
    }).catch(error => reject(error));
  })
);

const _readPage = (pdf: PDF, pageNumber: number): Promise<string> => (
  // TODO: Handle errors
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
      .catch(error => reject(error));
  })
);
