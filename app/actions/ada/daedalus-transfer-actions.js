// @flow
import Action from '../lib/Action';

export default class DaedalusTranferActions {
  restoreAddresses: Action<any> = new Action();
  getAddressesWithFunds: Action<any> = new Action();
  generateTransferTx: Action<any> = new Action();
}
