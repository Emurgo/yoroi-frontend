// @flow
import { AsyncAction, Action } from '../lib/Action';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';

export default class WalletSettingsActions {
  cancelEditingWalletField: Action<void> = new Action();
  startEditingWalletField: Action<{| field: string |}> = new Action();
  stopEditingWalletField: Action<void> = new Action();
  renamePublicDeriver: AsyncAction<{|
    publicDeriver: PublicDeriver<>,
    newName: string,
  |}> = new AsyncAction();
  renameConceptualWallet: AsyncAction<{|
    publicDeriver: PublicDeriver<>,
    newName: string,
  |}> = new AsyncAction();
  updateSigningPassword: AsyncAction<{|
    publicDeriver: PublicDeriver<>,
    oldPassword: string,
    newPassword: string
  |}> = new AsyncAction();
  resyncHistory: AsyncAction<{|
    publicDeriver: PublicDeriver<>,
  |}> = new AsyncAction();
  removeWallet: AsyncAction<{|
    publicDeriver: PublicDeriver<>,
  |}> = new AsyncAction();
  openNextWarning: Action<PublicDeriver<>> = new Action();
}
