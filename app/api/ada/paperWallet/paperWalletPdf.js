// @flow
import Pdf from 'jspdf';
import qr from 'qr-image';
import paperWalletPage1Path from '../../../assets/pdf/paper-wallet-certificate-page-1.png';
import paperWalletPage1PathTestnet from '../../../assets/pdf/paper-wallet-certificate-page-1-testnet.png';
import paperWalletPage2Path from '../../../assets/pdf/paper-wallet-certificate-page-2.png';
import paperWalletPage2PathTestnet from '../../../assets/pdf/paper-wallet-certificate-page-2-testnet.png';
import paperWalletCertificateBgPath from '../../../assets/pdf/paper-wallet-certificate-background.png';
import type { PaperWalletPass } from '../adaWallet';
import { Logger, stringifyError } from '../../../utils/logging';
import saver from 'file-saver';

export type PaperRequest = {
  words: Array<string>,
  pass: PaperWalletPass,
  addresses: Array<string>,
  isMainnet: boolean
}

export const generateAdaPaperPdf = async (request: PaperRequest) => {
  // Prepare params
  const { addresses, words, isMainnet, pass } = request;
  const address = 'Ae2tdPwUPEZ4Gg5gmqwW2t7ottKBMjWunmPt7DwKkAGsxx9XNSfWqrE1Gbk';

  // Helpers
  const printMnemonic = (index) => `${index + 1}. ${words[index]}`;

  // Generate QR image for wallet address
  const qrCodeImage = Buffer.from(qr.imageSync(address, {
    type: 'png',
    size: 10,
    ec_level: 'L',
    margin: 0
  })).toString('base64');
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
    textCenter(doc, 195, address, null, 180, true);

    await addImageBase64(doc, qrCodeImage, {
      x: (pageWidthPx / 2) - 15,
      y: 205,
      w: 30,
      h: 30
    });

    // second page
    doc.addPage();

    const page2Uri = isMainnet ? paperWalletPage2Path : paperWalletPage2PathTestnet;
    await addImage(doc, page2Uri, pageSize);

    // doc.rotate(180, { origin: [width / 2, height / 2] });
    // doc.fillColor(textColor);
    // doc.fontSize(10).text('RecoveryLabel?', 0, 535, {
    //   width: 595,
    //   align: 'center'
    // });
    //
    // // mnemonics
    // doc.fontSize(7);
    // doc.text(printMnemonic(0), 168, 560);
    // doc.text(printMnemonic(1), 212, 560);
    // doc.text(printMnemonic(2), 256, 560);
    // doc.text(printMnemonic(3), 300, 560);
    // doc.text(printMnemonic(4), 344, 560);
    // doc.text(printMnemonic(5), 388, 560);
    //
    // doc.text(printMnemonic(6), 168, 581);
    // doc.text(printMnemonic(7), 212, 581);
    // doc.text(printMnemonic(8), 256, 581);
    // doc.text(printMnemonic(9), 300, 581);
    // doc.text(printMnemonic(10), 344, 581);
    // doc.text(printMnemonic(11), 388, 581);
    //
    // doc.text(printMnemonic(12), 168, 602);
    // doc.text(printMnemonic(13), 212, 602);
    // doc.text(printMnemonic(14), 256, 602);
    // doc.text(printMnemonic(15), 300, 602);
    // doc.text(printMnemonic(16), 344, 602);
    // doc.text(printMnemonic(17), 388, 602);
    //
    // doc.fontSize(7).text('BuildLabel?', (width - 270) / 2, 705, {
    //   width: 270,
    //   align: 'left'
    // });
    //
    // doc.rotate(-180, { origin: [width / 2, height / 2] });
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

async function addImageBase64(doc: Pdf, img: string, params?: AddImageParams): Promise<void> {
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
