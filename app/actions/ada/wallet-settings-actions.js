// @flow
import { AsyncAction, Action } from '../lib/Action';
import PublicDeriverWithCachedMeta from '../../domain/PublicDeriverWithCachedMeta';

export default class WalletSettingsActions {
  cancelEditingWalletField: Action<void> = new Action();
  startEditingWalletField: Action<{| field: string |}> = new Action();
  stopEditingWalletField: Action<void> = new Action();
  renamePublicDeriver: AsyncAction<{|
    publicDeriver: PublicDeriverWithCachedMeta,
    newName: string,
  |}> = new AsyncAction();
  renameConceptualWallet: AsyncAction<{|
    publicDeriver: PublicDeriverWithCachedMeta,
    newName: string,
  |}> = new AsyncAction();
  updateSigningPassword: AsyncAction<{|
    publicDeriver: PublicDeriverWithCachedMeta,
    oldPassword: string,
    newPassword: string
  |}> = new AsyncAction();
  resyncHistory: AsyncAction<{|
    publicDeriver: PublicDeriverWithCachedMeta,
  |}> = new AsyncAction();
}
