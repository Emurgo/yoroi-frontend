// @flow
import Action from '../lib/Action';

// ======= CONNECT TREZOR ACTIONS =======

export default class ConnectTrezorAction {
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
