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
import { ROUTES } from '../../routes-config';
import { buildRoute } from '../../utils/routing';
import { ChainDerivations } from '../../config/numbersConfig';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';
import { Bip44DerivationLevels } from '../../api/ada/lib/storage/database/walletTypes/bip44/api/utils';
import { Bip44Wallet } from '../../api/ada/lib/storage/models/Bip44Wallet/wrapper';
import { Cip1852Wallet } from '../../api/ada/lib/storage/models/Cip1852Wallet/wrapper';
import globalMessages, { addressTypes } from '../../i18n/global-messages';
import type { $npm$ReactIntl$MessageDescriptor } from 'react-intl';
import {
  ConceptualWallet
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import { getApiForCoinType } from '../../api/index';
import type { AddressFilterKind, StandardAddress, AddressStoreKind } from '../../types/AddressFilterTypes';
import { AddressFilter, AddressStoreTypes } from '../../types/AddressFilterTypes';

type SubRequestType<+T> = {|
  publicDeriver: PublicDeriver<>,
|} => Promise<$ReadOnlyArray<$ReadOnly<T>>>;

export type AddressTypeName = {|
  stable: AddressStoreKind, // constant name that doesn't change with language selected
  display: $Exact<$npm$ReactIntl$MessageDescriptor>,
|};

export class AddressTypeStore<T: StandardAddress> {

  @observable addressesRequests: Array<{|
    publicDeriver: PublicDeriver<>,
    cachedRequest: CachedRequest<SubRequestType<T>>,
  |}> = [];

  stores: StoresMap;
  actions: ActionsMap;
  request: SubRequestType<T>;
  name: AddressTypeName;
  route: string;
  shouldHide: (PublicDeriver<>, AddressTypeStore<T>) => boolean;
  constructor(data: {|
    stores: StoresMap,
    actions: ActionsMap,
    request: SubRequestType<T>,
    name: AddressTypeName,
    route: string,
    shouldHide: (PublicDeriver<>, AddressTypeStore<T>) => boolean,
  |}) {
    this.stores = data.stores;
    this.actions = data.actions;
    this.request = data.request;
    this.name = data.name;
    this.route = data.route;
    this.shouldHide = data.shouldHide;
  }

  @computed get isActiveStore(): boolean {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return false;
    const { app } = this.stores;
    const screenRoute = buildRoute(
      this.route,
      {
        id: publicDeriver.getPublicDeriverId(),
      }
    );
    return app.currentRoute === screenRoute;
  }

  setAsActiveStore: (PublicDeriver<>) => void = (publicDeriver) => {
    this.actions.router.goToRoute.trigger({
      route: this.route,
      params: { id: publicDeriver.getPublicDeriverId() },
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
  allAddressesForDisplay: AddressTypeStore<StandardAddress>;
  externalForDisplay: AddressTypeStore<StandardAddress>;
  internalForDisplay: AddressTypeStore<StandardAddress>;

  @observable error: ?LocalizableError = null;

  @observable addressFilter: AddressFilterKind = AddressFilter.None;

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

    this.allAddressesForDisplay = new AddressTypeStore({
      stores: this.stores,
      actions: this.actions,
      request: (request) => this._wrapForAllAddresses({
        ...request,
        storeToFilter: this.allAddressesForDisplay,
        invertFilter: false,
      }),
      name: {
        stable: AddressStoreTypes.all,
        display: globalMessages.addressesLabel
      },
      route: ROUTES.WALLETS.RECEIVE.ROOT,
      shouldHide: (publicDeriver, _store) => {
        const withLevels = asHasLevels<ConceptualWallet>(publicDeriver);
        if (withLevels == null) return true;
        const parent = withLevels.getParent();
        if (!(parent instanceof Bip44Wallet || parent instanceof Cip1852Wallet)) {
          return false;
        }
        // don't show this if public deriver level < Account
        return parent.getPublicDeriverLevel() > Bip44DerivationLevels.ACCOUNT.level;
      },
    });
    this.externalForDisplay = new AddressTypeStore({
      stores: this.stores,
      actions: this.actions,
      request: async (request) => this._createAddressIfNeeded({
        publicDeriver: request.publicDeriver,
        genAddresses: () => this._wrapForChainAddresses({
          ...request,
          storeToFilter: this.externalForDisplay,
          chainsRequest: { chainId: ChainDerivations.EXTERNAL },
        }),
      }),
      name: {
        stable: AddressStoreTypes.external,
        display: addressTypes.externalTab,
      },
      route: ROUTES.WALLETS.RECEIVE.EXTERNAL,
      shouldHide: (_publicDeriver, store) => store.all.length === 0,
    });
    this.internalForDisplay = new AddressTypeStore({
      stores: this.stores,
      actions: this.actions,
      request: (request) => this._wrapForChainAddresses({
        ...request,
        storeToFilter: this.internalForDisplay,
        chainsRequest: { chainId: ChainDerivations.INTERNAL },
      }),
      name: {
        stable: AddressStoreTypes.internal,
        display: addressTypes.internalLabel,
      },
      route: ROUTES.WALLETS.RECEIVE.INTERNAL,
      shouldHide: (_publicDeriver, store) => store.all.length === 0,
    });
  }

  getStoresForWallet: (
    PublicDeriver<>
  ) => Array<AddressTypeStore<StandardAddress>> = (publicDeriver) => {
    const { coinType } = publicDeriver.getParent();
    const apiType = getApiForCoinType(coinType);
    return this.stores.substores[apiType].addresses.getStoresForWallet(publicDeriver);
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
    const withHasUtxoChains = asHasUtxoChains(publicDeriver);
    if (withHasUtxoChains == null) {
      this.allAddressesForDisplay.addObservedWallet(publicDeriver);
    } else {
      this.externalForDisplay.addObservedWallet(publicDeriver);
      this.internalForDisplay.addObservedWallet(publicDeriver);
    }
    const { coinType } = publicDeriver.getParent();
    const apiType = getApiForCoinType(coinType);
    this.stores.substores[apiType].addresses.addObservedWallet(publicDeriver);
  }

  refreshAddressesFromDb: PublicDeriver<> => Promise<void> = async (
    publicDeriver
  ) => {
    const withHasUtxoChains = asHasUtxoChains(publicDeriver);
    if (withHasUtxoChains == null) {
      await this.allAddressesForDisplay.refreshAddressesFromDb(publicDeriver);
    } else {
      await this.externalForDisplay.refreshAddressesFromDb(publicDeriver);
      await this.internalForDisplay.refreshAddressesFromDb(publicDeriver);
    }
    const { coinType } = publicDeriver.getParent();
    const apiType = getApiForCoinType(coinType);
    this.stores.substores[apiType].addresses.refreshAddressesFromDb(publicDeriver);
  }

  _wrapForAllAddresses: {|
    publicDeriver: PublicDeriver<>,
    storeToFilter: AddressTypeStore<StandardAddress>,
    invertFilter: boolean,
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
      type: request.publicDeriver.getParent() instanceof Bip44Wallet
        ? CoreAddressTypes.CARDANO_LEGACY
        : CoreAddressTypes.SHELLEY_GROUP,
    });

    return this.storewiseFilter({
      publicDeriver: request.publicDeriver,
      storeToFilter: request.storeToFilter,
      addresses: allAddresses,
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
      type: request.publicDeriver.getParent() instanceof Bip44Wallet
        ? CoreAddressTypes.CARDANO_LEGACY
        : CoreAddressTypes.SHELLEY_GROUP,
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

    const filterByStore = await this.stores.substores[apiType].addresses.storewiseFilter(request);
    if (this.addressFilter === AddressFilter.None) {
      return filterByStore;
    }
    if (this.addressFilter === AddressFilter.Unused) {
      return filterByStore.filter(address => address.isUsed === null || address.isUsed === false);
    }
    throw new Error(`${nameof(this.storewiseFilter)} unknown filter type ${this.addressFilter}`);
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

export function userFilter<T>(request: {|
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
  throw new Error(`${nameof(userFilter)} unknown filter type ${request.addressFilter}`);
}
