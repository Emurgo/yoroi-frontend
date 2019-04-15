// @flow
import Action from '../lib/Action';

// ======= PAPER WALLET ACTIONS =======

export default class PaperWalletsActions {
  submitInit: Action<{ isCustomPassword: boolean, numAddresses: number }> = new Action();
  submitUserPassword: Action<{ userPassword: string }> = new Action();
  submitCreate: Action<{}> = new Action();
  backToCreate: Action<{}> = new Action();
  submitVerify: Action<{}> = new Action();
  createPaperWallet: Action<{}> = new Action();
  createPdfDocument: Action<{}> = new Action();
  setPdfRenderStatus: Action<{ status: string }> = new Action();
  setPdf: Action<{ pdf: Blob }> = new Action();
  downloadPaperWallet: Action<{}> = new Action();
  cancel: Action<{}> = new Action();
}
