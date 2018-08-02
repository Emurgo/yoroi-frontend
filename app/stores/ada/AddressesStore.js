// @flow
import { observable, computed, action, runInAction } from 'mobx';
import _ from 'lodash';
import Store from '../lib/Store';
import CachedRequest from '../lib/LocalizedCachedRequest';
import Request from '../lib/LocalizedRequest';
import WalletAddress from '../../domain/WalletAddress';
import LocalizableError, { localizedError } from '../../i18n/LocalizableError';
import type { GetAddressesResponse, CreateAddressResponse } from '../../api/ada/index';

export default class AddressesStore extends Store {

  @observable lastGeneratedAddress: ?WalletAddress = null;
  @observable addressesRequests: Array<{
    walletId: string,
    allRequest: CachedRequest<GetAddressesResponse>
  }> = [];
  @observable error: ?LocalizableError = null;

  // REQUESTS
  /* eslint-disable max-len */
  @observable createAddressRequest: Request<CreateAddressResponse> = new Request(this.api.ada.createAddress);
  /* eslint-disable max-len */

  setup() {
    const actions = this.actions.ada.addresses;
    actions.createAddress.listen(this._createAddress);
    actions.resetErrors.listen(this._resetErrors);
  }

  _createAddress = async () => {
    try {
      const address: ?CreateAddressResponse = await this.createAddressRequest.execute().promise;
      if (address != null) {
        this._refreshAddresses();
        runInAction('set last generated address and reset error', () => {
          this.error = null;
        });
      }
    } catch (error) {
      runInAction('set error', () => { this.error = localizedError(error); });
    }
  };

  @computed get all(): Array<WalletAddress> {
    const wallet = this.stores.ada.wallets.active;
    if (!wallet) return [];
    const result = this._getAddressesAllRequest(wallet.id).result;
    return result ? result.addresses : [];
  }

  @computed get hasAny(): boolean {
    const wallet = this.stores.ada.wallets.active;
    if (!wallet) return false;
    const result = this._getAddressesAllRequest(wallet.id).result;
    return result ? result.addresses.length > 0 : false;
  }

  @computed get active(): ?WalletAddress {
    const wallet = this.stores.ada.wallets.active;
    if (!wallet) return;
    const result = this._getAddressesAllRequest(wallet.id).result;
    return result ? result.addresses[result.addresses.length - 1] : null;
  }

  @computed get totalAvailable(): number {
    const wallet = this.stores.ada.wallets.active;
    if (!wallet) return 0;
    const result = this._getAddressesAllRequest(wallet.id).result;
    return result ? result.addresses.length : 0;
  }

  @action _refreshAddresses = () => {
    const allWallets = this.stores.ada.wallets.all;
    for (const wallet of allWallets) {
      const allRequest = this._getAddressesAllRequest(wallet.id);
      allRequest.invalidate({ immediately: false });
      allRequest.execute({ walletId: wallet.id });
    }
  };

  @action _resetErrors = () => {
    this.error = null;
  };

  _getAccountIdByWalletId = (walletId: string): (?string) => {
    const result = this._getAddressesAllRequest(walletId).result;
    return result ? result.accountId : null;
  };

  _getAddressesAllRequest = (walletId: string): CachedRequest<GetAddressesResponse> => {
    const foundRequest = _.find(this.addressesRequests, { walletId });
    if (foundRequest && foundRequest.allRequest) return foundRequest.allRequest;
    return new CachedRequest(this.api.ada.getAddresses);
  };

}
