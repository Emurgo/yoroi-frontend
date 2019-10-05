// @flow
import Action from '../lib/Action';

// ======= HARDWARE WALLET CONNECT ACTIONS =======

export default class HWConnectActions {
  init: Action<void> = new Action();
  cancel: Action<void> = new Action();
  submitCheck: Action<void> = new Action();
  goBackToCheck: Action<void> = new Action();
  submitConnect: Action<void> = new Action();
  submitSave: Action<{
    walletName: string,
    derivationIndex: number,
  }> = new Action();
}
