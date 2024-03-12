// @flow
import { action, observable, runInAction } from 'mobx';
import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import LocalizableError, { localizedError } from '../../i18n/LocalizableError';
import type { CreateAddressFunc, CreateAddressResponse, } from '../../api/common';
import { PublicDeriver, } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { asDisplayCutoff, asHasLevels, asHasUtxoChains, } from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import type { IHasUtxoChainsRequest, } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { Logger, } from '../../utils/logging';
import type { AddressFilterKind, AddressTypeName, StandardAddress, } from '../../types/AddressFilterTypes';
import { AddressFilter, } from '../../types/AddressFilterTypes';
import { ConceptualWallet } from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import { addressToDisplayString } from '../../api/ada/lib/storage/bridge/utils';
import { AddressTypeStore } from '../base/AddressSubgroupStore';
import type { CoreAddressT } from '../../api/ada/lib/storage/database/primitives/enums';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';
import type { IAddressTypeStore, IAddressTypeUiSubset } from '../stateless/addressStores';
import { allAddressSubgroups } from '../stateless/addressStores';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import type { AddressDetails } from '../../api/ada';
import { ChainDerivations } from '../../config/numbersConfig';
import { forceNonNull } from '../../coreUtils';

export default class AddressesStore extends Store<StoresMap, ActionsMap> {

  // note: no need for this to be observable
  _addressSubgroupMap: Map<Class<IAddressTypeStore>, IAddressTypeStore> = new Map();

  @observable error: ?LocalizableError = null;

  @observable addressFilter: AddressFilterKind = AddressFilter.None;

  addressBook: AddressTypeStore;

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

    for (const store of allAddressSubgroups) {
      this._addressSubgroupMap.set(store.class, new store.class({
        stores: this.stores,
        actions: this.actions,
        name: store.name,
      }));
    }
  }

  get addressSubgroupMap(): $ReadOnlyMap<Class<IAddressTypeStore>, IAddressTypeUiSubset> {
    return this._addressSubgroupMap;
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
    allAddressSubgroups
      .filter(store => store.isRelated({
        selected: publicDeriver
      }))
      .map(store => store.class)
      .forEach(
        storeClass => this._addressSubgroupMap.get(storeClass)?.addObservedWallet(publicDeriver)
      );
  }

  refreshAddressesFromDb: PublicDeriver<> => Promise<void> = async (
    publicDeriver
  ) => {
    await Promise.all(
      allAddressSubgroups
        .filter(store => store.isRelated({
          selected: publicDeriver
        }))
        .map(store => store.class)
        .map(storeClass => (
          this._addressSubgroupMap.get(storeClass)?.refreshAddressesFromDb(publicDeriver)
        ))
    );
  }

  _wrapForAllAddresses: {|
    publicDeriver: PublicDeriver<>,
    storeName: AddressTypeName,
    type: CoreAddressT,
  |} => Promise<$ReadOnlyArray<$ReadOnly<StandardAddress>>> = async (request) => {
    const allAddresses = await this.api.ada.getAllAddressesForDisplay({
      publicDeriver: request.publicDeriver,
      type: request.type,
    });

    return this.storewiseFilter({
      publicDeriver: request.publicDeriver,
      storeName: request.storeName,
      addresses: allAddresses.map(addrInfo => ({
        ...addrInfo,
        address: addressToDisplayString(
          addrInfo.address,
          request.publicDeriver.getParent().getNetworkInfo()
        ),
      })),
    });
  }

  _wrapForeign: {|
    publicDeriver: PublicDeriver<>,
    storeName: AddressTypeName,
  |} => Promise<$ReadOnlyArray<$ReadOnly<StandardAddress>>> = async (request) => {
    const withLevels = asHasLevels<ConceptualWallet>(request.publicDeriver);
    if (withLevels == null) {
      throw new Error(`${nameof(this._wrapForeign)} missing levels`);
    }
    const allAddresses = await this.api.ada.getForeignAddresses({
      publicDeriver: withLevels,
    });

    return this.storewiseFilter({
      publicDeriver: request.publicDeriver,
      storeName: request.storeName,
      addresses: allAddresses.map(addrInfo => ({
        type: addrInfo.type,
        address: addressToDisplayString(
          addrInfo.address,
          request.publicDeriver.getParent().getNetworkInfo()
        ),
        label: 'asdf',
      })),
    });
  }

  _wrapForChainAddresses: {|
    publicDeriver: PublicDeriver<>,
    storeName: AddressTypeName,
    type: CoreAddressT,
    chainsRequest: IHasUtxoChainsRequest,
  |}=> Promise<$ReadOnlyArray<$ReadOnly<StandardAddress>>> = async (request) => {
    const withHasUtxoChains = asHasUtxoChains(
      request.publicDeriver
    );
    if (withHasUtxoChains == null) {
      Logger.error(`${nameof(this._wrapForChainAddresses)} incorrect public deriver`);
      return Promise.resolve([]);
    }
    const addresses = await this.api.ada.getChainAddressesForDisplay({
      publicDeriver: withHasUtxoChains,
      chainsRequest: request.chainsRequest,
      type: request.type,
    });

    return this.storewiseFilter({
      publicDeriver: request.publicDeriver,
      storeName: request.storeName,
      addresses: addresses.map(addrInfo => ({
        ...addrInfo,
        address: addressToDisplayString(
          addrInfo.address,
          request.publicDeriver.getParent().getNetworkInfo()
        ),
      })),
    });
  }

  storewiseFilter: {|
    publicDeriver: PublicDeriver<>,
    storeName: AddressTypeName,
    addresses: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
  |} => Promise<$ReadOnlyArray<$ReadOnly<StandardAddress>>> = async (request) => {
    return await this.stores.substores.ada.addresses.storewiseFilter(request);
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

  getFirstExternalAddress: (PublicDeriver<>) => Promise<AddressDetails> = async (publicDeriver) => {
    return (await this.api.ada.getChainAddressesForDisplay({
      publicDeriver: forceNonNull(asHasUtxoChains(publicDeriver)),
      type: CoreAddressTypes.CARDANO_BASE,
      chainsRequest: { chainId: ChainDerivations.EXTERNAL },
    }))[0];
  }
}
