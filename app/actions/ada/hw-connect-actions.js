// @flow
import Action from '../lib/Action';

// ======= HARDWARE WALLET CONNECT ACTIONS =======

export default class HWConnectActions {
  init: Action<void> = new Action();
  cancel: Action<void> = new Action();
  submitAbout: Action<void> = new Action();
  goBackToAbout: Action<void> = new Action();
  submitConnect: Action<void> = new Action();
  submitSave: Action<string> = new Action();
}
