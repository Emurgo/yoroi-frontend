// @flow
import { observable, action } from 'mobx';
import _ from 'lodash';
import WalletSettingsStore from '../base/WalletSettingsStore';
import Request from '../lib/LocalizedRequest';
import type { UpdateWalletPasswordFunc, UpdateWalletFunc } from '../../api/ada';

export default class AdaWalletSettingsStore extends WalletSettingsStore {

  @observable updateWalletMetaRequest: Request<UpdateWalletFunc>
    = new Request<UpdateWalletFunc>(this.api.ada.updateWalletMeta);

  @observable updateWalletPasswordRequest: Request<UpdateWalletPasswordFunc>
    = new Request<UpdateWalletPasswordFunc>(this.api.ada.updateWalletPassword);

  setup() {
    const a = this.actions.ada.walletSettings;
    a.startEditingWalletField.listen(this._startEditingWalletField);
    a.stopEditingWalletField.listen(this._stopEditingWalletField);
    a.cancelEditingWalletField.listen(this._cancelEditingWalletField);
    a.updateWalletField.listen(this._updateWalletField);
    a.updateWalletPassword.listen(this._updateWalletPassword);
  }

  @action _updateWalletPassword = async (
    {
      walletId,
      oldPassword,
      newPassword
    }: {
      walletId: string,
      oldPassword: string,
      newPassword: string
    }
  ): Promise<void> => {
    await this.updateWalletPasswordRequest.execute({ walletId, oldPassword, newPassword });
    this.actions.dialogs.closeActiveDialog.trigger();
    this.updateWalletPasswordRequest.reset();
    await this.stores.substores.ada.wallets.refreshWalletsData();
  };

  /** Updates meta-parameters for the internal wallet representation */
  @action _updateWalletField = async (
    { field, value }: { field: string, value: string }
  ): Promise<void> => {
    // get wallet
    const activeWallet = this.stores.substores.ada.wallets.active;
    if (!activeWallet) return;
    const { id: walletId, name, assurance } = activeWallet;

    // update field
    const walletData = { walletId, name, assurance };
    walletData[field] = value;

    // update the meta-parameters in the internal wallet representation
    const wallet = await this.updateWalletMetaRequest.execute(walletData).promise;
    if (!wallet) return;

    // replace wallet with new modified version
    await this.stores.substores.ada.wallets.walletsRequest.patch(result => {
      const walletIndex = _.findIndex(result, { id: walletId });
      result[walletIndex] = wallet;
    });

    // replace active wallet with new modified version
    this.stores.substores.ada.wallets._setActiveWallet({ walletId });
  };

}
