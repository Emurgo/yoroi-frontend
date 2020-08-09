// @flow
import { AsyncAction, Action } from '../lib/Action';
import type { RestoreModeType } from '../common/wallet-restore-actions';

// ======= HARDWARE WALLET CONNECT ACTIONS =======

export default class HWConnectActions {
  init: Action<void> = new Action();
  cancel: Action<void> = new Action();
  submitCheck: Action<void> = new Action();
  setMode: Action<RestoreModeType> = new Action();
  goBackToCheck: Action<void> = new Action();
  submitConnect: AsyncAction<void> = new AsyncAction();
  submitSave: AsyncAction<string> = new AsyncAction();
}
