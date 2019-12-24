// @flow
import Action from '../lib/Action';
import type { PdfGenStepType } from '../../api/ada/paperWallet/paperWalletPdf';

// ======= PAPER WALLET ACTIONS =======

export default class PaperWalletsActions {
  submitInit: Action<{
    numAddresses: number,
    printAccountPlate: boolean,
  }> = new Action();
  submitUserPassword: Action<{| userPassword: string |}> = new Action();
  submitCreate: Action<void> = new Action();
  backToCreate: Action<void> = new Action();
  submitVerify: Action<void> = new Action();
  createPaperWallet: Action<void>= new Action();
  createPdfDocument: Action<void>= new Action();
  setPdfRenderStatus: Action<{ status: PdfGenStepType }> = new Action();
  setPdf: Action<{ pdf: Blob }> = new Action();
  downloadPaperWallet: Action<void> = new Action();
  cancel: Action<void>= new Action();
}
