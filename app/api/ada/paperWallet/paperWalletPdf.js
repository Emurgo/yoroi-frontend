// @flow
import Pdf from 'jspdf';
import qr from 'qr-image';
import paperWalletPage1Path from '../../../assets/images/paper-wallet/paper-wallet-certificate.front-min.png';
import paperWalletPage2Path from '../../../assets/images/paper-wallet/paper-wallet-certificate.back-min.png';
import { Logger, stringifyError } from '../../../utils/logging';
import type { Network } from '../../../../config/config-types';
import { NetworkType } from '../../../../config/config-types';
import type { WalletAccountNumberPlate } from '../lib/storage/models/PublicDeriver/interfaces';
import { createIcon as blockiesIcon } from '@download/blockies';

export type PaperRequest = {
  words: Array<string>,
  addresses: Array<string>,
  accountPlate: ?WalletAccountNumberPlate,
  network: Network,
}

export const PdfGenSteps = Object.freeze({
  initializing: 0,
  background: 1,
  frontpage: 2,
  addresses: 3,
  backpage: 4,
  mnemonic: 5,
  done: 6,
});
export type PdfGenStepType = $Values<typeof PdfGenSteps>;

export const generateAdaPaperPdf = async (
  request: PaperRequest,
  updateStatus: (PdfGenStepType => void) = () => {}
): Promise<?Blob> => {
  // Prepare params
  // eslint-disable-next-line no-unused-vars
  const { network, addresses, words, accountPlate } = request;

  updateStatus(PdfGenSteps.initializing);

  const width = 595.28;
  const height = 841.98;
  const doc = new Pdf({
    format: [width, height],
    compressPdf: true,
  });
  const [pageWidthPx, pageHeightPx] =
    [doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight()];
  const pageSize = { w: pageWidthPx, h: pageHeightPx };
  try {

    updateStatus(PdfGenSteps.background);

    // background images
    await addImage(doc, paperWalletPage1Path, pageSize);
    if (network !== NetworkType.MAINNET) {
      printTestnetLabel(doc, network, 172);
    }

    if (accountPlate) {
      // print account plate ID bottom-left corner of main front section
      doc.setFontSize(12);
      doc.text(145, 180, accountPlate.id);
    }

    updateStatus(PdfGenSteps.frontpage);

    // first page
    if (network !== NetworkType.MAINNET) {
      printTestnetLabel(doc, network, 105);
    }

    updateStatus(PdfGenSteps.addresses);
    if (!printAddresses(doc, addresses)) {
      return null;
    }

    // second page
    doc.addPage();

    updateStatus(PdfGenSteps.backpage);

    if (network !== NetworkType.MAINNET) {
      printTestnetLabel(doc, network, 75, 180);
    }

    if (accountPlate) {

      // Generate account plate icon
      const icon = blockiesIcon({
        seed: accountPlate.hash,
        size: 7,
        scale: 5,
        bgcolor: '#fff',
        color: '#aaa',
        spotcolor: '#000'
      });

      // Draw account plate icon upside-down middle of the backside
      addImageBase64(doc, icon.toDataURL('image/png'), {
        x: (pageWidthPx + 24) / 2,
        y: 115,
        w: 24,
        h: 24,
        r: 180,
      });

      // Print account plate ID under the plate icon on backside
      doc.setFontSize(12);
      textCenter(doc, 130, accountPlate.id, null, 180, true);
    }

    await addImage(doc, paperWalletPage2Path, pageSize);
    updateStatus(PdfGenSteps.mnemonic);
    printMnemonics(doc, words);
    printPasswordMessage(doc);

  } catch (error) {
    Logger.error('Failed to render paper wallet! ' + stringifyError(error));
    throw error;
  }

  const blob = doc.output('blob');
  updateStatus(PdfGenSteps.done);
  return blob;
};

function printPasswordMessage(
  doc: Pdf,
): void {
  doc.setFontSize(11);
  const text = 'password or a hint';
  textCenter(doc, 56, text, null, 180, true);
  doc.setFontType('normal');
}

function printTestnetLabel(
  doc: Pdf,
  network: string,
  y: number,
  r?: number,
  xShift?: number
): void {
  doc.setFontSize(50);
  doc.setFontType('bold');
  doc.setTextColor(255, 180, 164);
  textCenter(doc, y, network.toUpperCase(), null, r, (r || 0) > 90, xShift);
  doc.setFontType('normal');
  doc.setTextColor(0, 0, 0);
}

function printAddresses(
  doc: Pdf,
  addresses: Array<string>,
): boolean {
  const pageWidthPx = doc.internal.pageSize.getWidth();
  const [pA, pB] = [{ x: 40, y: 187 }, { x: 170, y: 249 }];

  doc.setTextColor(0, 0, 0);
  if (addresses.length === 1) {
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
    const qrSize = [14, 14, 12, 10][addresses.length - 2];

    const rowHeight = (pB.y - pA.y) / addresses.length;
    for (let r = 0; r < addresses.length; r++) {
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
  return true;
}

function printMnemonics(doc: Pdf, words: Array<string>): void {
  doc.setFont('courier');
  doc.setFontSize(7);
  const [pA, pB] = [{ x: 56, y: 82 }, { x: 153, y: 105 }];
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
  r?: number,
}

function textCenter(
  doc: Pdf,
  y: number,
  text: string,
  m: null,
  r: ?number,
  isReverseCentering?: boolean,
  xShift?: number
): void {
  const unit = doc.getStringUnitWidth(text);
  const fontSize = doc.internal.getFontSize();
  const scaleFactor = doc.internal.scaleFactor;
  const textWidth = unit * fontSize / scaleFactor;
  const pageWidth = doc.internal.pageSize.width;
  const textOffset = (
    (pageWidth / 2) - ((textWidth / 2) * (isReverseCentering === true ? -1 : +1))
  );
  doc.text(textOffset + (xShift || 0), y, text, m, r);
}

async function addImage(doc: Pdf, url: string, params?: AddImageParams): Promise<void> {
  return addImageBase64(doc, await loadImage(url), params);
}

function addImageBase64(doc: Pdf, img: string, params?: AddImageParams): void {
  const { x, y, w, h, r } = params || {};
  doc.addImage(img, 'png', x || 0, y || 0, w, h, '', 'FAST', r);
}

async function loadImage(url: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
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
