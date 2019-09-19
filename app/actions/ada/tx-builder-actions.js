// @flow
import Action from '../lib/Action';

export default class WalletSettingsActions {
  updateReceiver: Action<void | string> = new Action();
  updateAmount: Action<void | number> = new Action();
  updateMemo: Action<void | string> = new Action();
  updateTentativeTx: Action<void> = new Action();
  toggleSendAll: Action<void> = new Action();
  reset: Action<void> = new Action();
}
