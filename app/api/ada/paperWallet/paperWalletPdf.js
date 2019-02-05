// @flow
import Pdf from 'jspdf';
import qr from 'qr-image';
import paperWalletPage1Path from '../../../assets/pdf/paper-wallet-certificate-page-1.png';
import paperWalletPage1PathTestnet from '../../../assets/pdf/paper-wallet-certificate-page-1-testnet.png';
import paperWalletPage2Path from '../../../assets/pdf/paper-wallet-certificate-page-2.png';
import paperWalletPage2PathTestnet from '../../../assets/pdf/paper-wallet-certificate-page-2-testnet.png';
import paperWalletCertificateBgPath from '../../../assets/pdf/paper-wallet-certificate-background.png';
import { Logger, stringifyError } from '../../../utils/logging';
import saver from 'file-saver';
import bip39 from 'bip39';

export type PaperRequest = {
  words: Array<string>,
  addresses: Array<string>,
  isMainnet: boolean,
  isCustomPass: boolean,
}

export const generateAdaPaperPdf = async (request: PaperRequest, callback?: Function) => {
  // Prepare params
  const logback = callback || (() => {});
  logback('Reading parameters');
  const { isMainnet } = request;
  const words = bip39.generateMnemonic(224).split(' ');
  const addresses = [
    'Ae2tdPwUPEZ4Gg5gmqwW2t7ottKBMjWunmPt7DwKkAGsxx9XNSfWqrE1Gbk',
    'Ae2tdPwUPEYzDLR8zduvsULnjpZqQN2f67na68XkXMYbU7nSoxYmM6HyujC',
    // 'Ae2tdPwUPEZHwifNUbb9eGitrkEiuMJZRyeeq22hLCZMse4iSW7xAdjcyfE',
    // 'Ae2tdPwUPEZL98o7rECwL4FtMYD43YPRuZFqnYYdJS4yKBdUB6pLHjQTAxu',
    // 'Ae2tdPwUPEZ1SfVxRHxS882JGxMC58Y98bNkNhc2uxrbSpCa8L92VtX1ntU',
  ];
  console.log(words);

  logback('Initializing the document');
  const width = 595.28;
  const height = 841.98;
  const doc = new Pdf({
    format: [width, height]
  });
  const [pageWidthPx, pageHeightPx] =
    [doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight()];
  const pageSize = { w: pageWidthPx, h: pageHeightPx };
  try {

    logback('Drawing pretty background');
    // background images
    await addImage(doc, paperWalletCertificateBgPath, pageSize);

    logback('Preparing the face page');
    // first page
    const page1Uri = isMainnet ? paperWalletPage1Path : paperWalletPage1PathTestnet;
    await addImage(doc, page1Uri, pageSize);
    printAddresses(doc, addresses, logback);

    // second page
    doc.addPage();

    logback('Preparing the back page');
    const page2Uri = isMainnet ? paperWalletPage2Path : paperWalletPage2PathTestnet;
    await addImage(doc, page2Uri, pageSize);
    logback('Printing mnemonics');
    printMnemonics(doc, words)

  } catch (error) {
    Logger.error('Failed to render paper wallet! ' + stringifyError(error));
    throw error;
  }

  logback('Downloading');
  // Write file to disk
  console.log(doc);
  const blob = doc.output('blob');
  saver.saveAs(blob, 'test.pdf');

  logback('All done');
};

function printAddresses(doc: Pdf, addresses: Array<string>, logback: Function) {
  const pageWidthPx = doc.internal.pageSize.getWidth();
  const [pA, pB] = [{ x:40, y:187 }, { x:170, y:249 }];
  doc.text(pA.x, pA.y, 'x');
  doc.text(pB.x, pA.y, 'x');
  doc.text(pB.x, pB.y, 'x');
  doc.text(pA.x, pB.y, 'x');

  doc.setTextColor(59, 92, 155);
  if (addresses.length === 1) {

    logback('Drawing the address');

    doc.setFontSize(9);
    const [address] = addresses;
    textCenter(doc, pA.y + 7, address, null, 180, true);
    // Generate QR image for wallet address
    const qrCodeImage = Buffer.from(qr.imageSync(address, {
      type: 'png',
      size: 10,
      ec_level: 'L',
      margin: 0
    })).toString('base64');
    addImageBase64(doc, qrCodeImage, {
      x: (pageWidthPx / 2) - 15,
      y: pA.y + 17,
      w: 30,
      h: 30
    });

  } else if (addresses.length > 1) {

    if (addresses.length > 5) {
      throw new Error('Maximum number of addresses supported: 5');
    }

    doc.setFontSize(8);
    const addrPad = 22;
    const qrSize = {
      2: 14,
      3: 14,
      4: 12,
      5: 10,
    }[addresses.length];

    const rowHeight = (pB.y - pA.y) / addresses.length;
    for (let r = 0; r < addresses.length; r++) {
      logback(`Drawing address #${r + 1}`);
      const y = (pB.y - (rowHeight / 2)) - (rowHeight * r);
      doc.text(pB.x - addrPad, y, addresses[r], null, 180);
      const qrCodeImage = Buffer.from(qr.imageSync(addresses[r], {
        type: 'png',
        size: 10,
        ec_level: 'L',
        margin: 0
      })).toString('base64');
      addImageBase64(doc, qrCodeImage, {
        x: (pB.x - addrPad) + 4,
        y: y - ((qrSize / 2) - 1),
        w: qrSize,
        h: qrSize
      });
    }
  }
}

function printMnemonics(doc: Pdf, words: Array<string>) {
  doc.setFont('courier');
  doc.setFontSize(7);
  const [pA, pB] = [{ x:56, y:82 }, { x:153, y:105 }];
  const lineHeight = (pB.y - pA.y) / 3;
  for (let r = 0; r < 3; r++) {
    const rowIndex = r * 7;
    const rowWords = words.slice(rowIndex, rowIndex + 7);
    const rowLetters = rowWords.reduce((a, s) => a + s.length, 0);
    const rowString = rowWords.join(' '.repeat((64 - rowLetters) / 7));
    const y = (pB.y - (lineHeight / 2)) - (lineHeight * r);
    textCenter(doc, y, rowString, null, 180, true);
  }
}

type AddImageParams = {
  x?: number,
  y?: number,
  w?: number,
  h?: number,
}

function textCenter(doc: Pdf, y: number, text: string, m, r, isReverseCentering?: boolean) {
  const unit = doc.getStringUnitWidth(text);
  const fontSize = doc.internal.getFontSize();
  const scaleFactor = doc.internal.scaleFactor;
  const textWidth = unit * fontSize / scaleFactor;
  const pageWidth = doc.internal.pageSize.width;
  const textOffset = (pageWidth / 2) - ((textWidth / 2) * (isReverseCentering ? -1 : +1));
  doc.text(textOffset, y, text, m, r);
}

async function addImage(doc: Pdf, url: string, params?: AddImageParams): Promise<void> {
  return addImageBase64(doc, await loadImage(url), params);
}

function addImageBase64(doc: Pdf, img: string, params?: AddImageParams): Promise<void> {
  const { x, y, w, h } = params || {};
  doc.addImage(img, 'png', x || 0, y || 0, w, h);
  return null;
}

async function loadImage(url: string): Promise<string> {
  return new Promise<Image>((resolve, reject) => {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = window.document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = url;
    } catch (e) {
      reject(e);
    }
  });
}
