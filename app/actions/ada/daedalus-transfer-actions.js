// @flow
import Action from '../lib/Action';

export default class DaedalusTranferActions {
  startTransferFunds: Action<any> = new Action();
  startTransferPaperFunds: Action<any> = new Action();
  startTransferMasterKey: Action<any> = new Action();
  setupTransferFundsWithMnemonic: Action<any> = new Action();
  setupTransferFundsWithMasterKey: Action<any> = new Action();
  backToUninitialized: Action<any> = new Action();
  transferFunds: Action<any> = new Action();
  cancelTransferFunds: Action<any> = new Action();
}
