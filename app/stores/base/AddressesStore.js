// @flow
import { observable, computed, action, runInAction } from 'mobx';
import _ from 'lodash';
import Store from './Store';
import CachedRequest from '../lib/LocalizedCachedRequest';
import Request from '../lib/LocalizedRequest';
import WalletAddress from '../../domain/WalletAddress';
import LocalizableError, { localizedError } from '../../i18n/LocalizableError';
import type { GetAddressesFunc, CreateAddressFunc } from '../../api/ada';
import environment from '../../environment';

export default class AddressesStore extends Store {

  /** Track addresses for a set of wallets */
  @observable addressesRequests: Array<{
    walletId: string,
    allRequest: CachedRequest<GetAddressesFunc>
  }> = [];
  @observable error: ?LocalizableError = null;

  // REQUESTS
  @observable createAddressRequest: Request<CreateAddressFunc>;

  setup() {
    const actions = this.actions[environment.API].addresses;
    actions.createAddress.listen(this._createAddress);
    actions.resetErrors.listen(this._resetErrors);
  }

  _createAddress = async () => {
    try {
      const address: ?WalletAddress = await this.createAddressRequest.execute({}).promise;
      if (address != null) {
        this._refreshAddresses();
        runInAction('reset error', () => { this.error = null; });
      }
    } catch (error) {
      runInAction('set error', () => { this.error = localizedError(error); });
    }
  };

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

  _getAccountIdByWalletId = (walletId: string): (?string) => {
    // Note: assume single account in Yoroi
    const result = this._getAddressesAllRequest(walletId).result;
    return result ? result.accountId : null;
  };

  _getAddressesAllRequest = (walletId: string): CachedRequest<GetAddressesFunc> => {
    const foundRequest = _.find(this.addressesRequests, { walletId });
    if (foundRequest && foundRequest.allRequest) return foundRequest.allRequest;
    return new CachedRequest<GetAddressesFunc>(this.api[environment.API].getExternalAddresses);
  };
}
