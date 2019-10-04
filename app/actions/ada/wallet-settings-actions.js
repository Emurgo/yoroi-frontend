// @flow
import Action from '../lib/Action';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';

export default class WalletSettingsActions {
  cancelEditingWalletField: Action<void> = new Action();
  startEditingWalletField: Action<{ field: string }> = new Action();
  stopEditingWalletField: Action<void> = new Action();
  renamePublicDeriver: Action<{ newName: string }> = new Action();
  renameConceptualWallet: Action<{ newName: string }> = new Action();
  // eslint-disable-next-line max-len
  updateSigningPassword: Action<{
    publicDeriver: PublicDeriver, oldPassword: string, newPassword: string
  }> = new Action();
}
