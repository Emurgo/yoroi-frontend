// @flow
import Action from '../lib/Action';

export default class YoroiTranferActions {
  startTransferFunds: Action<void> = new Action();
  setupTransferFundsWithMnemonic: Action<{ recoveryPhrase: string }> = new Action();
  backToUninitialized: Action<void> = new Action();
  transferFunds: Action<{ next: Function }> = new Action();
  cancelTransferFunds: Action<void> = new Action();
}
