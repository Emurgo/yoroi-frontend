// @flow
import BigNumber from 'bignumber.js';
import Action from '../lib/Action';

// ======= PAPER WALLET ACTIONS =======

export default class PaperWalletsActions {
  submitInit: Action<{ isCustomPassword: boolean, numAddresses: number }> = new Action();
  submitUserPassword: Action<{ userPassword: string }> = new Action();
  createPaperWallet: Action<{}> = new Action();
  downloadPaperWallet: Action<{}> = new Action();
  submitCreate: Action<{}> = new Action();
  submitMnemonicPassword: Action<{}> = new Action();
  submitVerify: Action<{}> = new Action();
  cancel: Action<{}> = new Action();
}
