// @flow
import { AsyncAction, Action } from '../lib/Action';

export default class WalletSettingsActions {
  cancelEditingWalletField: Action<void> = new Action();
  startEditingWalletField: Action<{| field: string |}> = new Action();
  stopEditingWalletField: Action<void> = new Action();
  renamePublicDeriver: AsyncAction<{|
    publicDeriverId: number,
    newName: string,
  |}> = new AsyncAction();
  renameConceptualWallet: AsyncAction<{|
    conceptualWalletId: number,
    newName: string,
  |}> = new AsyncAction();
  updateSigningPassword: AsyncAction<{|
    publicDeriverId: number,
    oldPassword: string,
    newPassword: string
  |}> = new AsyncAction();
  resyncHistory: AsyncAction<{|
    publicDeriverId: number,
  |}> = new AsyncAction();
  removeWallet: AsyncAction<{|
    publicDeriverId: number,
  |}> = new AsyncAction();
}
