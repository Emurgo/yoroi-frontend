// @flow
import { observable, computed, action, runInAction } from 'mobx';
import _ from 'lodash';
import Store from './Store';
import CachedRequest from '../lib/LocalizedCachedRequest';
import Request from '../lib/LocalizedRequest';

import {
  LedgerBridge,
} from 'yoroi-extension-ledger-bridge';

import {
  prepareLedgerBridger,
  disposeLedgerBridgeIFrame
} from '../../utils/iframeHandler';

import WalletAddress from '../../domain/WalletAddress';
import LocalizableError, { localizedError } from '../../i18n/LocalizableError';
import type { GetAddressesResponse } from '../../api/common';
import environment from '../../environment';

import {
  utils
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

import {
  Logger,
  stringifyError,
  stringifyData,
} from '../../utils/logging';

export default class AddressesStore extends Store {

  /** Track addresses for a set of wallets */
  @observable addressesRequests: Array<{
    walletId: string,
    allRequest: CachedRequest<GetAddressesResponse>
  }> = [];
  @observable error: ?LocalizableError = null;
  @observable verifyAddress: ?{ address: string, derivedPath: string } = null;
  ledgerBridge: ?LedgerBridge;

  // REQUESTS
  @observable createAddressRequest: Request<WalletAddress>;

  setup() {
    const actions = this.actions[environment.API].addresses;
    actions.createAddress.listen(this._createAddress);
    actions.verifyAddress.listen(this._verifyAddress);
    actions.resetErrors.listen(this._resetErrors);
    actions.closeVerifyAddressDialog.listen(this._closeVerifyAddressDialog);
  }

  _createAddress = async () => {
    try {
      const address: ?WalletAddress = await this.createAddressRequest.execute().promise;
      if (address != null) {
        this._refreshAddresses();
        runInAction('reset error', () => { this.error = null; });
      }
    } catch (error) {
      runInAction('set error', () => { this.error = localizedError(error); });
    }
  };

  @action _verifyAddress = async (params: { address: string, derivedPath: string }): Promise<void> => {
    Logger.info('AddressStore::_init called');

    if (this.ledgerBridge == null) {
      Logger.info('AddressStore::_init new LedgerBridge created');
      this.ledgerBridge = new LedgerBridge();
    }

    try {
      Logger.info('AddressStore::_send::called: ' + params.address);

      if (this.ledgerBridge) {
        // trick to fix flow
        const ledgerBridge: LedgerBridge = this.ledgerBridge;
        this.verifyAddress = { address: params.address, derivedPath: params.derivedPath };

        // TODO: delete
        console.log("verify params: ");
        console.log(params.address);
        console.log(params.derivedPath);

        console.log("verify address:");
        console.log(this.verifyAddress);

        console.log("deviredPath: ");
        console.log(utils.str_to_path(params.derivedPath.slice(2)));

        const pathBIP32 = utils.str_to_path(params.derivedPath.slice(2));

        await prepareLedgerBridger(ledgerBridge);
        ledgerBridge.showAddress(pathBIP32);

      } else {
        throw new Error(`LedgerBridge Error: LedgerBridge is undefined`);
      }
    } catch (error) {
      Logger.error('AddressStore::_send::error: ' + stringifyError(error));
      // this._setError(this._convertToLocalizableError(error));
    }
  }

  @computed get all(): Array<WalletAddress> {
    const wallet = this.stores.substores[environment.API].wallets.active;
    if (!wallet) return [];
    const result = this._getAddressesAllRequest(wallet.id).result;
    return result ? result.addresses : [];
  }

  @computed get hasAny(): boolean {
    const wallet = this.stores.substores[environment.API].wallets.active;
    if (!wallet) return false;
    const result = this._getAddressesAllRequest(wallet.id).result;
    return result ? result.addresses.length > 0 : false;
  }

  @computed get active(): ?WalletAddress {
    const wallet = this.stores.substores[environment.API].wallets.active;
    if (!wallet) return;
    const result = this._getAddressesAllRequest(wallet.id).result;
    return result ? result.addresses[result.addresses.length - 1] : null;
  }

  @computed get totalAvailable(): number {
    const wallet = this.stores.substores[environment.API].wallets.active;
    if (!wallet) return 0;
    const result = this._getAddressesAllRequest(wallet.id).result;
    return result ? result.addresses.length : 0;
  }

  /** Refresh addresses for all wallets */
  @action _refreshAddresses = () => {
    const allWallets = this.stores.substores[environment.API].wallets.all;
    for (const wallet of allWallets) {
      const allRequest = this._getAddressesAllRequest(wallet.id);
      allRequest.invalidate({ immediately: false });
      allRequest.execute({ walletId: wallet.id });
    }
  };

  /** Update which walletIds to track and refresh the data */
  @action updateObservedWallets = (
    walletIds: Array<string>
  ): void => {
    this.addressesRequests = walletIds.map(walletId => ({
      walletId,
      allRequest: this.stores.substores.ada.addresses._getAddressesAllRequest(walletId),
    }));
    this._refreshAddresses();
  }

  @action _resetErrors = () => {
    this.error = null;
  };

  @action _closeVerifyAddressDialog = (): void => {
    disposeLedgerBridgeIFrame();
    this.ledgerBridge = undefined;
    this.verifyAddress = null;
    this.actions.dialogs.closeActiveDialog.trigger();
  }

  _getAccountIdByWalletId = (walletId: string): (?string) => {
    const result = this._getAddressesAllRequest(walletId).result;
    return result ? result.accountId : null;
  };

  _getAddressesAllRequest = (walletId: string): CachedRequest<GetAddressesResponse> => {
    const foundRequest = _.find(this.addressesRequests, { walletId });
    if (foundRequest && foundRequest.allRequest) return foundRequest.allRequest;
    return new CachedRequest(this.api[environment.API].getExternalAddresses);
  };
}
