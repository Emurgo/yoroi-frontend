// @flow
import { action, observable } from 'mobx';
import type { Node } from 'react';
import { find, } from 'lodash';
import Store from '../base/Store';
import type { RemoveAllTransactionsFunc } from '../../api/common';
import Request from '../lib/LocalizedRequest';
import type { StoresMap } from '../index';
import {
  removeWalletFromDb,
  changeSigningKeyPassword,
  renameConceptualWallet,
  resyncWallet,
  removeAllTransactions,
} from '../../api/thunk';

export type WarningList = {|
  publicDeriverId: number,
  dialogs: Array<void => Node>,
|};

export default class WalletSettingsStore extends Store<StoresMap> {

  @observable renameModelRequest: Request<(() => Promise<void>) => Promise<void>>
    = new Request(async (func) => { await func(); });

  @observable changeSigningKeyRequest: Request<(() => Promise<void>) => Promise<void>>
    = new Request(async (func) => { await func(); });

  @observable clearHistory: Request<RemoveAllTransactionsFunc>
    = new Request(removeAllTransactions);

  @observable removeWalletRequest: Request<typeof removeWalletFromDb>
    = new Request<typeof removeWalletFromDb>(removeWalletFromDb);

  @observable walletFieldBeingEdited: string | null = null;
  @observable lastUpdatedWalletField: string | null = null;

  @observable walletWarnings: Array<WarningList> = [];
  getWalletWarnings: number => WarningList = (
    publicDeriverId
  ) => {
    const foundRequest = find(this.walletWarnings, { publicDeriverId });
    if (foundRequest) return foundRequest;

    throw new Error(`${nameof(WalletSettingsStore)}::${nameof(this.getWalletWarnings)} no warning list found`);
  }

  @action startEditingWalletField: {| field: string |} => void = (
    { field }
  ) => {
    this.walletFieldBeingEdited = field;
  };

  @action stopEditingWalletField: void => void = () => {
    if (this.walletFieldBeingEdited != null) {
      this.lastUpdatedWalletField = this.walletFieldBeingEdited;
    }
    this.walletFieldBeingEdited = null;
  };

  @action cancelEditingWalletField: void => void = () => {
    this.lastUpdatedWalletField = null;
    this.walletFieldBeingEdited = null;
  };

  @action updateSigningPassword: {|
    publicDeriverId: number,
    oldPassword: string,
    newPassword: string
  |} => Promise<void> = async (request) => {
    await this.changeSigningKeyRequest.execute(async () => {
      await changeSigningKeyPassword(request);
    });
    this.stores.uiDialogs.closeActiveDialog();
    this.changeSigningKeyRequest.reset();
  };

   renameConceptualWallet: {|
    conceptualWalletId: number,
    newName: string
  |} => Promise<void> = async (request) => {
    this.stores.wallets.onRenameSelectedWallet(request.newName);

    await this.renameModelRequest.execute(async () => {
      await renameConceptualWallet(request);
    });
  };

  @action resyncHistory: {|
    publicDeriverId: number,
  |} => Promise<void> = async (request) => {
    this.clearHistory.reset();

    await this.clearHistory.execute({
      publicDeriver: { publicDeriverId: request.publicDeriverId },
      refreshWallet: async () => {
        this.stores.transactions.clearCache(request.publicDeriverId);
        await resyncWallet({
          publicDeriverId: request.publicDeriverId,
        });
      }
    }).promise;
  };

  @action removeWallet: {|
    publicDeriverId: number,
  |} => Promise<void> = async (request) => {
    this.removeWalletRequest.reset();
    const { stores } = this;
    stores.wallets.unsetActiveWallet(); // deselect before deleting

    // Remove this wallet from wallet sort list
    const walletsNavigation = stores.profile.walletsNavigation
    const newWalletsNavigation = {
      ...walletsNavigation,
      // $FlowFixMe[invalid-computed-prop]
      'cardano': walletsNavigation.cardano.filter(
        walletId => walletId !== request.publicDeriverId)
    }
    await stores.profile.updateSortedWalletList(newWalletsNavigation);

    // ==================== Disconnect related dApps ====================
    await this.stores.connector.getConnectorWhitelist();
    const connectorWhitelist = stores.connector.currentConnectorWhitelist;
    const connectedDapps = connectorWhitelist.filter(
      dapp => dapp.publicDeriverId === request.publicDeriverId
    );

    for (const dapp of connectedDapps) {
      await this.stores.connector.removeWalletFromWhitelist1({
        url: dapp.url,
      });
    }

    await this.removeWalletRequest.execute({
      publicDeriverId: request.publicDeriverId,
    }).promise;
    // note: it's possible some other function was waiting for a DB lock
    //       and so it may fail if it runs now since underlying data was deleted
    //       to avoid this causing an issue, we just refresh the page
    // note: redirect logic will handle going to the right page after reloading
    // note: there is a slight gap between the removeWallet releasing the DB lock
    //       and actually reloading the page.
    //       theoretically, a crash could happen in between these
    //       but the chance is low and we need to release the DB lock to commit the deletion
    window.location.reload();
  };
}
