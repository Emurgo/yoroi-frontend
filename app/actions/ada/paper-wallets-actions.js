// @flow
import Action from '../lib/Action';
import type { PdfGenStepType } from '../../api/ada/paperWallet/paperWalletPdf';

// ======= PAPER WALLET ACTIONS =======

export default class PaperWalletsActions {
  submitInit: Action<{
    numAddresses: number,
    printAccountPlate: boolean,
  }> = new Action();
  submitUserPassword: Action<{ userPassword: string }> = new Action();
  submitCreate: Action<{}> = new Action();
  backToCreate: Action<void> = new Action();
  submitVerify: Action<{}> = new Action();
  createPaperWallet: Action<{}> = new Action();
  createPdfDocument: Action<{}> = new Action();
  setPdfRenderStatus: Action<{ status: PdfGenStepType }> = new Action();
  setPdf: Action<{ pdf: Blob }> = new Action();
  downloadPaperWallet: Action<{}> = new Action();
  cancel: Action<{}> = new Action();
}
