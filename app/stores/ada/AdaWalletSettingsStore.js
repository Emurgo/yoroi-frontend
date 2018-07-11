// @flow
import { observable, action } from 'mobx';
import _ from 'lodash';
import WalletSettingsStore from '../WalletSettingsStore';
import Request from '../lib/LocalizedRequest';
import type { UpdateWalletPasswordResponse, UpdateWalletResponse } from '../../api/common';

export default class AdaWalletSettingsStore extends WalletSettingsStore {

  /* eslint-disable max-len */
  @observable updateWalletRequest: Request<UpdateWalletResponse> = new Request(this.api.ada.updateWallet);
  @observable updateWalletPasswordRequest: Request<UpdateWalletPasswordResponse> = new Request(this.api.ada.updateWalletPassword);
  /* eslint-enable max-len */

  setup() {
    const a = this.actions.ada.walletSettings;
    a.startEditingWalletField.listen(this._startEditingWalletField);
    a.stopEditingWalletField.listen(this._stopEditingWalletField);
    a.cancelEditingWalletField.listen(this._cancelEditingWalletField);
    a.updateWalletField.listen(this._updateWalletField);
    a.updateWalletPassword.listen(this._updateWalletPassword);
  }

  @action _updateWalletPassword = async ({ walletId, oldPassword, newPassword }: {
    walletId: string, oldPassword: ?string, newPassword: ?string,
  }) => {
    await this.updateWalletPasswordRequest.execute({ walletId, oldPassword, newPassword });
    this.actions.dialogs.closeActiveDialog.trigger();
    this.updateWalletPasswordRequest.reset();
    this.stores.ada.wallets.refreshWalletsData();
  };

  @action _updateWalletField = async ({ field, value }: { field: string, value: string }) => {
    const activeWallet = this.stores.ada.wallets.active;
    if (!activeWallet) return;
    const { id: walletId, name, assurance } = activeWallet;
    const walletData = { walletId, name, assurance };
    walletData[field] = value;
    const wallet = await this.updateWalletRequest.execute(walletData).promise;
    if (!wallet) return;
    await this.stores.ada.wallets.walletsRequest.patch(result => {
      const walletIndex = _.findIndex(result, { id: walletId });
      result[walletIndex] = wallet;
    });
    this.stores.ada.wallets._setActiveWallet({ walletId });
  };

}
