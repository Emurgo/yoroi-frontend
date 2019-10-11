// @flow
import Action from '../lib/Action';
import PublicDeriverWithCachedMeta from '../../domain/PublicDeriverWithCachedMeta';

export default class WalletSettingsActions {
  cancelEditingWalletField: Action<void> = new Action();
  startEditingWalletField: Action<{ field: string }> = new Action();
  stopEditingWalletField: Action<void> = new Action();
  renamePublicDeriver: Action<{ newName: string }> = new Action();
  renameConceptualWallet: Action<{ newName: string }> = new Action();
  updateSigningPassword: Action<{
    publicDeriver: PublicDeriverWithCachedMeta,
    oldPassword: string,
    newPassword: string
  }> = new Action();
}
