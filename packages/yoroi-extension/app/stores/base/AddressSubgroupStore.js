// @flow

import { observable, computed, action } from 'mobx';
import CachedRequest from '../lib/LocalizedCachedRequest';
import { find } from 'lodash';
import type { StoresMap } from '../index';
import type { ActionsMap } from '../../actions';
import type { StandardAddress, } from '../../types/AddressFilterTypes';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { ChainDerivations } from '../../config/numbersConfig';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';
import type { SubgroupCtorData, IAddressTypeStore } from '../stateless/addressStores';

type SubRequestType = {|
  publicDeriver: PublicDeriver<>,
|} => Promise<$ReadOnlyArray<$ReadOnly<StandardAddress>>>;

export class AddressTypeStore {

  @observable addressesRequests: Array<{|
    publicDeriver: PublicDeriver<>,
    cachedRequest: CachedRequest<SubRequestType>,
  |}> = [];

  stores: StoresMap;
  actions: ActionsMap;
  request: SubRequestType;
  constructor(data: {|
    stores: StoresMap,
    actions: ActionsMap,
    request: SubRequestType,
  |}) {
    this.stores = data.stores;
    this.actions = data.actions;
    this.request = data.request;
  }

  @computed get all(): $ReadOnlyArray<$ReadOnly<StandardAddress>> {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) return [];
    const result = this._flowCoerceResult(this._getRequest(publicDeriver));
    if (result == null) return [];
    return result;
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
    CachedRequest<SubRequestType>
  ) => ?$ReadOnlyArray<$ReadOnly<StandardAddress>> = (request) => {
    // Flow fails when resolving types so this is the best we can check
    (request.result: ?$ReadOnlyArray<$ReadOnly<any>>);
    return (request.result: any);
  }

  _getRequest: (PublicDeriver<>) => CachedRequest<SubRequestType> = (publicDeriver) => {
    const foundRequest = find(this.addressesRequests, { publicDeriver });
    if (foundRequest && foundRequest.cachedRequest) {
      return foundRequest.cachedRequest;
    }
    return new CachedRequest<SubRequestType>(this.request);
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

export class AddressBookSubgroup extends AddressTypeStore implements IAddressTypeStore {
  constructor(data: SubgroupCtorData): IAddressTypeStore {
    super({
      stores: data.stores,
      actions: data.actions,
      request: (request) => data.stores.addresses._wrapForeign({
        ...request,
        storeName: data.name,
      }),
    });
    return this;
  }
}
export class ByronAllAddressesSubgroup extends AddressTypeStore implements IAddressTypeStore {
  constructor(data: SubgroupCtorData): IAddressTypeStore {
    super({
      stores: data.stores,
      actions: data.actions,
      request: (request) => data.stores.addresses._wrapForAllAddresses({
        ...request,
        storeName: data.name,
        type: CoreAddressTypes.CARDANO_LEGACY,
      }),
    });
    return this;
  }
}
export class ByronExternalAddressesSubgroup extends AddressTypeStore implements IAddressTypeStore {
  constructor(data: SubgroupCtorData): IAddressTypeStore {
    super({
      stores: data.stores,
      actions: data.actions,
      request: (request) => data.stores.addresses._createAddressIfNeeded({
        publicDeriver: request.publicDeriver,
        genAddresses: () => data.stores.addresses._wrapForChainAddresses({
          ...request,
          storeName: data.name,
          type: CoreAddressTypes.CARDANO_LEGACY,
          chainsRequest: { chainId: ChainDerivations.EXTERNAL },
        }),
      }),
    });
    return this;
  }
}
export class ByronInternalAddressesSubgroup extends AddressTypeStore implements IAddressTypeStore {
  constructor(data: SubgroupCtorData): IAddressTypeStore {
    super({
      stores: data.stores,
      actions: data.actions,
      request: (request) => data.stores.addresses._wrapForChainAddresses({
        ...request,
        storeName: data.name,
        type: CoreAddressTypes.CARDANO_LEGACY,
        chainsRequest: { chainId: ChainDerivations.INTERNAL },
      }),
    });
    return this;
  }
}
export class BaseExternalAddressesSubgroup extends AddressTypeStore implements IAddressTypeStore {
  constructor(data: SubgroupCtorData): IAddressTypeStore {
    super({
      stores: data.stores,
      actions: data.actions,
      request: (request) => data.stores.addresses._createAddressIfNeeded({
        publicDeriver: request.publicDeriver,
        genAddresses: () => data.stores.addresses._wrapForChainAddresses({
          ...request,
          storeName: data.name,
          type: CoreAddressTypes.CARDANO_BASE,
          chainsRequest: { chainId: ChainDerivations.EXTERNAL },
        }),
      }),
    });
    return this;
  }
}
export class BaseInternalAddressesSubgroup extends AddressTypeStore implements IAddressTypeStore {
  constructor(data: SubgroupCtorData): IAddressTypeStore {
    super({
      stores: data.stores,
      actions: data.actions,
      request: (request) => data.stores.addresses._createAddressIfNeeded({
        publicDeriver: request.publicDeriver,
        genAddresses: () => data.stores.addresses._wrapForChainAddresses({
          ...request,
          storeName: data.name,
          type: CoreAddressTypes.CARDANO_BASE,
          chainsRequest: { chainId: ChainDerivations.INTERNAL },
        }),
      }),
    });
    return this;
  }
}
export class BaseMangledAddressesSubgroup extends AddressTypeStore implements IAddressTypeStore {
  constructor(data: SubgroupCtorData): IAddressTypeStore {
    super({
      stores: data.stores,
      actions: data.actions,
      request: (request) => data.stores.addresses._wrapForAllAddresses({
        publicDeriver: request.publicDeriver,
        ...request,
        storeName: data.name,
        type: CoreAddressTypes.CARDANO_BASE,
      }),
    });
    return this;
  }
}
export class EnterpriseExternalAddressesSubgroup
  extends AddressTypeStore implements IAddressTypeStore {
  constructor(data: SubgroupCtorData): IAddressTypeStore {
    super({
      stores: data.stores,
      actions: data.actions,
      request: (request) => data.stores.addresses._createAddressIfNeeded({
        publicDeriver: request.publicDeriver,
        genAddresses: () => data.stores.addresses._wrapForChainAddresses({
          ...request,
          storeName: data.name,
          type: CoreAddressTypes.CARDANO_ENTERPRISE,
          chainsRequest: { chainId: ChainDerivations.EXTERNAL },
        }),
      }),
    });
    return this;
  }
}
export class EnterpriseInternalAddressesSubgroup
  extends AddressTypeStore implements IAddressTypeStore {
  constructor(data: SubgroupCtorData): IAddressTypeStore {
    super({
      stores: data.stores,
      actions: data.actions,
      request: (request) => data.stores.addresses._createAddressIfNeeded({
        publicDeriver: request.publicDeriver,
        genAddresses: () => data.stores.addresses._wrapForChainAddresses({
          ...request,
          storeName: data.name,
          type: CoreAddressTypes.CARDANO_ENTERPRISE,
          chainsRequest: { chainId: ChainDerivations.INTERNAL },
        }),
      }),
    });
    return this;
  }
}
export class RewardAddressesSubgroup extends AddressTypeStore implements IAddressTypeStore {
  constructor(data: SubgroupCtorData): IAddressTypeStore {
    super({
      stores: data.stores,
      actions: data.actions,
      request: (request) => data.stores.addresses._wrapForAllAddresses({
        publicDeriver: request.publicDeriver,
        ...request,
        storeName: data.name,
        type: CoreAddressTypes.CARDANO_REWARD,
      }),
    });
    return this;
  }
}
