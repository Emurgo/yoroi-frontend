// @flow

import { AsyncAction, Action } from '../lib/Action';

export type WalletRestoreMeta = {|
  recoveryPhrase: string,
  walletName: string,
  walletPassword: string,
  paperPassword: string,
|};

export const RestoreMode = Object.freeze({
  UNSET: -1,
  REGULAR: 0,
  PAPER: 1,
});
export type RestoreModeType = $Values<typeof RestoreMode>;

export default class WalletRestoreActions {
  submitFields: Action<WalletRestoreMeta> = new Action();
  startRestore: AsyncAction<void> = new AsyncAction();
  verifyMnemonic: AsyncAction<void> = new AsyncAction();
  startCheck: AsyncAction<void> = new AsyncAction();
  setMode: Action<RestoreModeType> = new Action();
  reset: Action<void> = new Action();
  back: Action<void> = new Action();
}
