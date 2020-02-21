// @flow
import { AsyncAction, Action } from '../lib/Action';
import type { WalletWithCachedMeta } from '../../stores/toplevel/WalletStore';

export default class WalletSettingsActions {
  cancelEditingWalletField: Action<void> = new Action();
  startEditingWalletField: Action<{| field: string |}> = new Action();
  stopEditingWalletField: Action<void> = new Action();
  renamePublicDeriver: AsyncAction<{|
    publicDeriver: WalletWithCachedMeta,
    newName: string,
  |}> = new AsyncAction();
  renameConceptualWallet: AsyncAction<{|
    publicDeriver: WalletWithCachedMeta,
    newName: string,
  |}> = new AsyncAction();
  updateSigningPassword: AsyncAction<{|
    publicDeriver: WalletWithCachedMeta,
    oldPassword: string,
    newPassword: string
  |}> = new AsyncAction();
  resyncHistory: AsyncAction<{|
    publicDeriver: WalletWithCachedMeta,
  |}> = new AsyncAction();
  removeWallet: AsyncAction<{|
    publicDeriver: WalletWithCachedMeta,
  |}> = new AsyncAction();
}
