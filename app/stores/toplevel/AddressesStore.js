// @flow
import { observable, computed, action, runInAction } from 'mobx';
import { find } from 'lodash';
import Store from '../base/Store';
import CachedRequest from '../lib/LocalizedCachedRequest';
import Request from '../lib/LocalizedRequest';
import LocalizableError, { localizedError } from '../../i18n/LocalizableError';
import type {
  CreateAddressFunc,
  CreateAddressResponse,
} from '../../api/common';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetAllUtxos, asHasUtxoChains, asDisplayCutoff, asHasLevels,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import type {
  IHasUtxoChainsRequest,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { StoresMap } from '../index';
import type { ActionsMap } from '../../actions';
import {
  Logger,
} from '../../utils/logging';
import { buildRoute } from '../../utils/routing';
import { getApiForCoinType } from '../../api/common/utils';
import type { AddressFilterKind, AddressGroupName, StandardAddress, AddressTypeName } from '../../types/AddressFilterTypes';
import { addressGroups, addressTypes, AddressStoreTypes, AddressFilter, AddressGroupTypes } from '../../types/AddressFilterTypes';
import { ROUTES } from '../../routes-config';
import {
  ConceptualWallet
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';

type SubRequestType<+T> = {|
  publicDeriver: PublicDeriver<>,
|} => Promise<$ReadOnlyArray<$ReadOnly<T>>>;

const addressBookGroup = {
  stable: AddressGroupTypes.addressBook,
  display: addressGroups.addressBook,
};

export class AddressTypeStore<T: StandardAddress> {

  @observable addressesRequests: Array<{|
    publicDeriver: PublicDeriver<>,
    cachedRequest: CachedRequest<SubRequestType<T>>,
  |}> = [];

  stores: StoresMap;
  actions: ActionsMap;
  request: SubRequestType<T>;
  name: AddressTypeName;
  groupName: AddressGroupName;
  shouldHide: (PublicDeriver<>, AddressTypeStore<T>) => boolean;
  constructor(data: {|
    stores: StoresMap,
    actions: ActionsMap,
    request: SubRequestType<T>,
    name: AddressTypeName,
    groupName: AddressGroupName;
    shouldHide: (PublicDeriver<>, AddressTypeStore<T>) => boolean,
  |}) {
    this.stores = data.stores;
    this.actions = data.actions;
    this.request = data.request;
    this.name = data.name;
    this.groupName = data.groupName;
    this.shouldHide = data.shouldHide;
  }

  @computed get isActiveStore(): boolean {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return false;
    const { app } = this.stores;
    const screenRoute = buildRoute(
      ROUTES.WALLETS.RECEIVE.ADDRESS_LIST,
      {
        id: publicDeriver.getPublicDeriverId(),
        group: this.groupName.stable,
        name: this.name.stable,
      }
    );
    return app.currentRoute === screenRoute;
  }

  setAsActiveStore: (PublicDeriver<>) => void = (publicDeriver) => {
    this.actions.router.goToRoute.trigger({
      route: ROUTES.WALLETS.RECEIVE.ADDRESS_LIST,
      params: {
        id: publicDeriver.getPublicDeriverId(),
        group: this.groupName.stable,
        name: this.name.stable,
      },
    });
  };

  @computed get isHidden(): boolean {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return true;
    return this.shouldHide(publicDeriver, this);
  }

  @computed get all(): $ReadOnlyArray<$ReadOnly<T>> {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return [];
    const result = this._flowCoerceResult(this._getRequest(publicDeriver));
    if (result == null) return [];
    return result;
  }

  @computed get filtered(): $ReadOnlyArray<$ReadOnly<T>> {
    return userFilter<T>({
      addressFilter: this.stores.addresses.addressFilter,
      addresses: this.all,
    });
  }

  @computed get wasExecuted(): boolean {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return false;
    return this._getRequest(publicDeriver).wasExecuted;
  }

  /** Refresh addresses from database */
  @action refreshAddressesFromDb: PublicDeriver<> => Promise<void> = async (
    publicDeriver,
  ) => {
    const allRequest = this._getRequest(publicDeriver);
    allRequest.invalidate({ immediately: false });
    await allRequest.execute({ publicDeriver }).promise;
  };

  _flowCoerceResult: (
    CachedRequest<SubRequestType<T>>
  ) => ?$ReadOnlyArray<$ReadOnly<T>> = (request) => {
    // Flow fails when resolving types so this is the best we can check
    (request.result: ?$ReadOnlyArray<$ReadOnly<any>>);
    return (request.result: any);
  }

  _getRequest: (PublicDeriver<>) => CachedRequest<SubRequestType<T>> = (publicDeriver) => {
    const foundRequest = find(this.addressesRequests, { publicDeriver });
    if (foundRequest && foundRequest.cachedRequest) {
      return foundRequest.cachedRequest;
    }
    return new CachedRequest<SubRequestType<T>>(this.request);
  };

  @action addObservedWallet: PublicDeriver<> => void = (
    publicDeriver
  ) => {
    this.addressesRequests.push({
      publicDeriver,
      cachedRequest: this._getRequest(publicDeriver),
    });
  }
}

export default class AddressesStore extends Store {

  @observable error: ?LocalizableError = null;

  @observable addressFilter: AddressFilterKind = AddressFilter.None;

  addressBook: AddressTypeStore<StandardAddress>;

  // REQUESTS
  @observable createAddressRequest: Request<CreateAddressFunc>
    = new Request<CreateAddressFunc>(this.api.common.createAddress);

  setup(): void {
    super.setup();

    const actions = this.actions.addresses;
    actions.createAddress.listen(this._createAddress);
    actions.resetErrors.listen(this._resetErrors);
    actions.setFilter.listen(this._setFilter);
    actions.resetFilter.listen(this._resetFilter);

    this.addressBook = new AddressTypeStore({
      stores: this.stores,
      actions: this.actions,
      request: (request) => this.stores.addresses._wrapForeign({
        ...request,
        storeToFilter: this.addressBook,
      }),
      name: {
        stable: AddressStoreTypes.all,
        display: addressTypes.all
      },
      groupName: addressBookGroup,
      shouldHide: (_publicDeriver, _store) => false,
    });
  }

  getStoresForWallet: (
    PublicDeriver<>
  ) => Array<AddressTypeStore<StandardAddress>> = (publicDeriver) => {
    const { coinType } = publicDeriver.getParent();
    const apiType = getApiForCoinType(coinType);
    return [
      ...this.stores.substores[apiType].addresses.getStoresForWallet(publicDeriver),
      this.addressBook,
    ];
  }

  _createAddress: PublicDeriver<> => Promise<void> = async (
    publicDeriver
  ) => {
    try {
      const result = await this._baseCreateAddress(publicDeriver);
      if (result != null) {
        await this.refreshAddressesFromDb(publicDeriver);
        runInAction('reset error', () => { this.error = null; });
      }
    } catch (error) {
      runInAction('set error', () => { this.error = localizedError(error); });
    }
  };
  _baseCreateAddress: PublicDeriver<> => Promise<?CreateAddressResponse> = async (
    publicDeriver
  ) => {
    const withDisplayCutoff = asDisplayCutoff(publicDeriver);
    if (withDisplayCutoff == null) {
      Logger.error(`${nameof(this._createAddress)} incorrect public deriver`);
      return;
    }
    const address = await this.createAddressRequest.execute({
      popFunc: withDisplayCutoff.popAddress
    }).promise;
    return address;
  };

  @action _resetErrors: void => void = () => {
    this.error = null;
  };

  addObservedWallet: PublicDeriver<> => void = (
    publicDeriver
  ) => {
    const { coinType } = publicDeriver.getParent();
    const apiType = getApiForCoinType(coinType);
    this.stores.substores[apiType].addresses.addObservedWallet(publicDeriver);
    this.addressBook.addObservedWallet(publicDeriver);
  }

  refreshAddressesFromDb: PublicDeriver<> => Promise<void> = async (
    publicDeriver
  ) => {
    const { coinType } = publicDeriver.getParent();
    const apiType = getApiForCoinType(coinType);
    this.stores.substores[apiType].addresses.refreshAddressesFromDb(publicDeriver);
    this.addressBook.refreshAddressesFromDb(publicDeriver);
  }

  _wrapForAllAddresses: {|
    publicDeriver: PublicDeriver<>,
    storeToFilter: AddressTypeStore<StandardAddress>,
  |} => Promise<$ReadOnlyArray<$ReadOnly<StandardAddress>>> = async (request) => {
    const { coinType } = request.publicDeriver.getParent();
    const apiType = getApiForCoinType(coinType);

    const withUtxos = asGetAllUtxos(request.publicDeriver);
    if (withUtxos == null) {
      Logger.error(`${nameof(this._wrapForAllAddresses)} incorrect public deriver`);
      return Promise.resolve([]);
    }

    const allAddresses = await this.api[apiType].getAllAddressesForDisplay({
      publicDeriver: withUtxos,
      type: this.stores.substores[apiType].addresses.getAddressTypesForWallet(withUtxos)[0]
    });

    return this.storewiseFilter({
      publicDeriver: request.publicDeriver,
      storeToFilter: request.storeToFilter,
      addresses: allAddresses,
    });
  }

  _wrapForeign: {|
    publicDeriver: PublicDeriver<>,
    storeToFilter: AddressTypeStore<StandardAddress>,
  |} => Promise<$ReadOnlyArray<$ReadOnly<StandardAddress>>> = async (request) => {
    const withLevels = asHasLevels<ConceptualWallet>(request.publicDeriver);
    if (withLevels == null) {
      throw new Error(`${nameof(this._wrapForeign)} missing levels`);
    }

    const allAddresses = await this.api.common.getForeignAddresses({
      publicDeriver: withLevels,
    });

    return this.storewiseFilter({
      publicDeriver: request.publicDeriver,
      storeToFilter: request.storeToFilter,
      addresses: allAddresses.map(hash => ({
        address: hash,
        label: 'asdf',
      })),
    });
  }

  _wrapForChainAddresses: {|
    publicDeriver: PublicDeriver<>,
    storeToFilter: AddressTypeStore<StandardAddress>,
    chainsRequest: IHasUtxoChainsRequest,
  |}=> Promise<$ReadOnlyArray<$ReadOnly<StandardAddress>>> = async (request) => {
    const { coinType } = request.publicDeriver.getParent();
    const apiType = getApiForCoinType(coinType);

    const withHasUtxoChains = asHasUtxoChains(
      request.publicDeriver
    );
    if (withHasUtxoChains == null) {
      Logger.error(`${nameof(this._wrapForChainAddresses)} incorrect public deriver`);
      return Promise.resolve([]);
    }
    const addresses = await this.api[apiType].getChainAddressesForDisplay({
      publicDeriver: withHasUtxoChains,
      chainsRequest: request.chainsRequest,
      type: this.stores.substores[apiType].addresses.getAddressTypesForWallet(withHasUtxoChains)[0]
    });

    return this.storewiseFilter({
      publicDeriver: request.publicDeriver,
      storeToFilter: request.storeToFilter,
      addresses,
    });
  }

  storewiseFilter: {|
    publicDeriver: PublicDeriver<>,
    storeToFilter: AddressTypeStore<StandardAddress>,
    addresses: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
  |} => Promise<$ReadOnlyArray<$ReadOnly<StandardAddress>>> = async (request) => {
    const { coinType } = request.publicDeriver.getParent();
    const apiType = getApiForCoinType(coinType);

    return await this.stores.substores[apiType].addresses.storewiseFilter(request);
  }

  _createAddressIfNeeded: {|
    publicDeriver: PublicDeriver<>,
    genAddresses: () => Promise<$ReadOnlyArray<$ReadOnly<StandardAddress>>>,
  |} => Promise<$ReadOnlyArray<$ReadOnly<StandardAddress>>> = async (request) => {
    const addresses = await request.genAddresses();
    const last = addresses[addresses.length - 1];
    if (last == null) return addresses;

    if (last.isUsed === true) {
      await this._baseCreateAddress(request.publicDeriver);
      return request.genAddresses(); // refresh after creating new address
    }
    return addresses;
  }

  @action _setFilter: AddressFilterKind => void = (filter) => {
    this.addressFilter = filter;
  }

  @action _resetFilter: void => void = () => {
    this.addressFilter = AddressFilter.None;
  }
}

export function userFilter<T: StandardAddress>(request: {|
  addressFilter: AddressFilterKind,
  addresses: $ReadOnlyArray<$ReadOnly<T>>,
|}): $ReadOnlyArray<$ReadOnly<T>> {
  if (request.addressFilter === AddressFilter.None) {
    return request.addresses;
  }
  if (request.addressFilter === AddressFilter.Unused) {
    return request.addresses.filter(address => (
      address.isUsed === null || address.isUsed === false
    ));
  }
  if (request.addressFilter === AddressFilter.Used) {
    return request.addresses.filter(address => (
      address.isUsed === true
    ));
  }
  if (request.addressFilter === AddressFilter.HasBalance) {
    return request.addresses.filter(address => (
      address.value !== undefined && address.value.gt(0)
    ));
  }
  throw new Error(`${nameof(userFilter)} unknown filter type ${request.addressFilter}`);
}
