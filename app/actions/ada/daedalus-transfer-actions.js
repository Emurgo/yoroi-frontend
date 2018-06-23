// @flow
import Action from '../lib/Action';

// TODO: Improve transfer actions logic.
// TODO: Add a cancel action in order to reset state
export default class DaedalusTranferActions {
  setupTransferFunds: Action<any> = new Action();
  transferFunds: Action<any> = new Action();
  cancelTransferFunds: Action<any> = new Action();
}
