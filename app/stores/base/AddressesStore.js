// @flow
import { observable, computed, action, runInAction, toJS } from 'mobx';
import _ from 'lodash';
import Store from './Store';
import CachedRequest from '../lib/LocalizedCachedRequest';
import Request from '../lib/LocalizedRequest';

import {
  LedgerBridge,
} from 'yoroi-extension-ledger-bridge';

import WalletAddress from '../../domain/WalletAddress';
import LocalizableError, { localizedError } from '../../i18n/LocalizableError';
import type { GetAddressesResponse } from '../../api/common';
import environment from '../../environment';

import type {
  BIP32Path
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import {
  Logger,
} from '../../utils/logging';
import Wallet from '../../domain/Wallet';

export default class AddressesStore extends Store {

  /** Track addresses for a set of wallets */
  @observable addressesRequests: Array<{
    walletId: string,
    allRequest: CachedRequest<GetAddressesResponse>
  }> = [];
  @observable error: ?LocalizableError = null;
  @observable selectedAddress: ?{ address: string, path: BIP32Path } = null;
  ledgerBridge: ?LedgerBridge;

  // REQUESTS
  @observable createAddressRequest: Request<WalletAddress>;

  setup() {
    const actions = this.actions[environment.API].addresses;
    actions.createAddress.listen(this._createAddress);
    actions.selectAddress.listen(this._selectAddress);
    actions.verifyAddress.listen(this._verifyAddress);
    actions.resetErrors.listen(this._resetErrors);
    actions.closeAddressDetailDialog.listen(this._closeAddressDetailDialog);
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

  @action _verifyAddress = async (params: { wallet: Wallet }): Promise<void> => {
    Logger.info('AddressStore::_verifyAddress called');

    if (!this.selectedAddress) {
      throw new Error('AddressStore::_verifyAddress called with no address selected');
    }
    // need to unwrap observable otherwise bridge will fail
    const path = toJS(this.selectedAddress.path);

    if (!params.wallet.hardwareInfo) {
      throw new Error('AddressStore::_verifyAddress called with no hardware wallet active');
    }

    // TODO: don't use hardcoded strings and maybe find a better way to do this?
    let hwStore;
    if (params.wallet.hardwareInfo.vendor === 'ledger.com') {
      hwStore = this.stores.substores[environment.API].ledgerSend;
    } else if (params.wallet.hardwareInfo.vendor === 'trezor.io') {
      hwStore = this.stores.substores[environment.API].trezorSend;
    } else {
      throw new Error('AddressStore::_verifyAddress called with unrecognized hardware wallet');
    }

    await hwStore.verifyAddress(path);
  }

  @action _selectAddress = async (params: { address: string, path: BIP32Path }): Promise<void> => {
    Logger.info('AddressStore::_selectAddress::called: ' + params.address);
    this.selectedAddress = { address: params.address, path: params.path };
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

  @action _closeAddressDetailDialog = (): void => {
    this.selectedAddress = null;
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
