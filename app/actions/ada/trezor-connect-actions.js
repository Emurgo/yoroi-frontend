// @flow
import Action from '../lib/Action';

// ======= TREZOR CONNECT ACTIONS =======

export default class TrezorConnectActions {
  // TODO proper type
  submitAbout: Action<any> = new Action();
  // TODO proper type
  goBacktToAbout: Action<any> = new Action();  
  // TODO proper type
  submitConnect: Action<any> = new Action();
  // TODO proper type
  submitSave: Action<any> = new Action();
  // TODO proper type
  cancel: Action<any> = new Action();
}
