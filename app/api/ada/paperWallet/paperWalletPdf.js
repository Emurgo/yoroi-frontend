// @flow
import Pdf from 'jspdf';
// import qr from 'qr-image';
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
  const address = addresses[0];

  // Helpers
  const printMnemonic = (index) => `${index + 1}. ${words[index]}`;

  // Generate QR image for wallet address
  // const qrCodeImage = qr.imageSync(address, {
  //   type: 'png',
  //   size: 10,
  //   ec_level: 'L',
  //   margin: 0
  // });
  const textColor = '#3b5c9b';
  const width = 595.28;
  const height = 841.98;
  const doc = new Pdf({
    format: [width, height]
  });
  const [pageWidthPx, pageHeightPx] =
    [doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight()];
  try {
    // // font family
    // const fontBuffer = paperWalletFontPath;
    // doc.font(fontBuffer);

    // background images
    const img = await loadImage(paperWalletCertificateBgPath);
    doc.addImage(img, 'png', 0, 0, pageWidthPx, pageHeightPx);
    // doc.image(backgroundUri, 0, 0, { fit: [width, height] });

    // first page
    // const page1Uri = isMainnet ? paperWalletPage1Path : paperWalletPage1PathTestnet;
    //
    // doc.image(page1Uri, 0, 0, { fit: [width, height] });
    // doc.rotate(180, { origin: [width / 2, height / 2] });
    // doc.fillColor(textColor);
    // doc.fontSize(10).text('AddressLabel?', 0, 160, {
    //   width: 595,
    //   align: 'center'
    // });
    // doc.image(qrCodeImage, (width / 2) - 80 / 2, 180, { fit: [80, 80] });
    // doc.fontSize(8).text(address, (width - 250) / 2, 274, {
    //   width: 250,
    //   align: 'center',
    //   lineGap: 2
    // });
    //
    // // revert document rotation
    // doc.rotate(-180, { origin: [width / 2, height / 2] });
    //
    // // second page
    // doc.addPage();
    // const page2Uri = isMainnet ? paperWalletPage2Path : paperWalletPage2PathTestnet;
    // doc.image(page2Uri, 0, 0, { fit: [width, height] });
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

async function loadImage(url): Promise<Image> {
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
