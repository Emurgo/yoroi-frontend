// @flow
import Action from '../lib/Action';

// TODO: Improve transfer actions logic.
// TODO: Add a cancel action in order to reset state
export default class DaedalusTranferActions {
  restoreAddresses: Action<any> = new Action();
  getAddressesWithFunds: Action<any> = new Action();
  generateTransferTx: Action<any> = new Action();
  transferFunds: Action<any> = new Action();
}
