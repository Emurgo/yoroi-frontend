// @flow
import Action from '../lib/Action';

// ======= TREZOR CONNECT ACTIONS =======

export default class TrezorConnectActions {
  cancel: Action<void> = new Action();
  submitAbout: Action<void> = new Action();
  goBacktToAbout: Action<void> = new Action();
  submitConnect: Action<void> = new Action();
  submitSave: Action<string> = new Action();
}
