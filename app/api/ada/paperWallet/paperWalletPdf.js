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

export const generateAdaPaperPdf = async (request: PaperRequest) => {
  // Prepare params
  const { isMainnet } = request;
  const words = bip39.generateMnemonic(224).split(' ');
  const addresses = [
    'Ae2tdPwUPEZ4Gg5gmqwW2t7ottKBMjWunmPt7DwKkAGsxx9XNSfWqrE1Gbk',
  ];
  console.log(words);

  const width = 595.28;
  const height = 841.98;
  const doc = new Pdf({
    format: [width, height]
  });
  const [pageWidthPx, pageHeightPx] =
    [doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight()];
  const pageSize = { w: pageWidthPx, h: pageHeightPx };
  try {
    // font family

    // background images
    await addImage(doc, paperWalletCertificateBgPath, pageSize);

    // first page
    const page1Uri = isMainnet ? paperWalletPage1Path : paperWalletPage1PathTestnet;
    await addImage(doc, page1Uri, pageSize);

    doc.setFontSize(8);
    doc.setTextColor(59, 92, 155);

    if (addresses.length === 1) {
      const [address] = addresses;
      textCenter(doc, 195, address, null, 180, true);
      // Generate QR image for wallet address
      const qrCodeImage = Buffer.from(qr.imageSync(address, {
        type: 'png',
        size: 10,
        ec_level: 'L',
        margin: 0
      })).toString('base64');
      addImageBase64(doc, qrCodeImage, {
        x: (pageWidthPx / 2) - 15,
        y: 205,
        w: 30,
        h: 30
      });
    } else if (addresses.length > 1) {

      // TODO: implement multiple addresses
    }

    // second page
    doc.addPage();

    const page2Uri = isMainnet ? paperWalletPage2Path : paperWalletPage2PathTestnet;
    await addImage(doc, page2Uri, pageSize);

    // mnemonics
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

  } catch (error) {
    Logger.error('Failed to render paper wallet! ' + stringifyError(error));
    throw error;
  }

  // Write file to disk
  console.log(doc);
  const blob = doc.output('blob');
  saver.saveAs(blob, 'test.pdf');
};

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
