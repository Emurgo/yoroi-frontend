// @flow
import { AsyncAction, Action } from '../lib/Action';

// ======= HARDWARE WALLET CONNECT ACTIONS =======

export default class HWConnectActions {
  init: Action<void> = new Action();
  cancel: Action<void> = new Action();
  submitCheck: Action<void> = new Action();
  goBackToCheck: Action<void> = new Action();
  submitConnect: AsyncAction<void> = new AsyncAction();
  submitSave: AsyncAction<string> = new AsyncAction();
  finishTransfer: Action<void> = new Action();
}
