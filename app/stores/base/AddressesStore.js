// @flow
import { observable, computed, action, runInAction } from 'mobx';
import { find } from 'lodash';
import Store from './Store';
import CachedRequest from '../lib/LocalizedCachedRequest';
import Request from '../lib/LocalizedRequest';
import LocalizableError, { localizedError } from '../../i18n/LocalizableError';
import type {
  CreateAddressFunc,
} from '../../api/ada';
import environment from '../../environment';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetAllUtxos, asHasUtxoChains, asDisplayCutoff,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import type {
  IHasUtxoChainsRequest,
  Address, Addressing, UsedStatus, Value,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { StoresMap } from '../index';
import {
  Logger,
} from '../../utils/logging';
import { ChainDerivations } from '../../config/numbersConfig';
import PublicDeriverWithCachedMeta from '../../domain/PublicDeriverWithCachedMeta';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';

export type StandardAddress = {|
  ...Address, ...Value, ...Addressing, ...UsedStatus
|};

type SubRequestType<T> = { publicDeriver: PublicDeriver<> } => Promise<Array<T>>;
export class AddressTypeStore<T> {

  @observable addressesRequests: Array<{
    publicDeriver: PublicDeriver<>,
    cachedRequest: CachedRequest<SubRequestType<T>>,
  }> = [];

  stores: StoresMap;
  request: SubRequestType<T>;
  constructor(
    stores: StoresMap,
    request: SubRequestType<T>,
  ) {
    this.stores = stores;
    this.request = request;
  }

  @computed get all(): Array<T> {
    const publicDeriver = this.stores.substores[environment.API].wallets.selected;
    if (!publicDeriver) return [];
    const result = this._flowCoerceResult(this._getRequest(publicDeriver.self));
    if (result == null) return [];
    return result;
  }

  @computed get hasAny(): boolean {
    const publicDeriver = this.stores.substores[environment.API].wallets.selected;
    if (!publicDeriver) return false;
    const result = this._flowCoerceResult(this._getRequest(publicDeriver.self));
    return result ? result.length > 0 : false;
  }

  @computed get last(): ?T {
    const publicDeriver = this.stores.substores[environment.API].wallets.selected;
    if (!publicDeriver) return;
    const result = this._flowCoerceResult(this._getRequest(publicDeriver.self));
    return result ? result[result.length - 1] : null;
  }

  @computed get totalAvailable(): number {
    const publicDeriver = this.stores.substores[environment.API].wallets.selected;
    if (!publicDeriver) return 0;
    const result = this._flowCoerceResult(this._getRequest(publicDeriver.self));
    return result ? result.length : 0;
  }

  /** Refresh addresses for all wallets */
  @action refreshAddresses: void => Promise<void> = async () => {
    const publicDeriver = this.stores.substores[environment.API].wallets.selected;
    if (publicDeriver == null) return;
    const allRequest = this._getRequest(publicDeriver.self);
    allRequest.invalidate({ immediately: false });
    await allRequest.execute({ publicDeriver: publicDeriver.self }).promise;
  };

  _flowCoerceResult: CachedRequest<SubRequestType<T>> => ?Array<T> = (request) => {
    // Flow fails when resolving types so this is the best we can check
    (request.result: ?Array<any>);
    return (request.result: any);
  }

  _getRequest: (PublicDeriver<>) => CachedRequest<SubRequestType<T>> = (publicDeriver) => {
    const foundRequest = find(this.addressesRequests, { publicDeriver });
    if (foundRequest && foundRequest.cachedRequest) {
      return foundRequest.cachedRequest;
    }
    return new CachedRequest<SubRequestType<T>>(this.request);
  };

  @action addObservedWallet: PublicDeriver<> => Promise<void> = async (
    publicDeriver
  ) => {
    this.addressesRequests.push({
      publicDeriver,
      cachedRequest: this._getRequest(publicDeriver),
    });
    await this.refreshAddresses();
  }
}

export default class AddressesStore extends Store {

  /** warning: do NOT use this if public deriver level < Account */
  allAddressesForDisplay: AddressTypeStore<StandardAddress>;

  externalForDisplay: AddressTypeStore<StandardAddress>;
  internalForDisplay: AddressTypeStore<StandardAddress>;

  @observable error: ?LocalizableError = null;

  // REQUESTS
  @observable createAddressRequest: Request<CreateAddressFunc>;

  setup(): void {
    const actions = this.actions[environment.API].addresses;
    actions.createAddress.listen(this._createAddress);
    actions.resetErrors.listen(this._resetErrors);

    this.allAddressesForDisplay = new AddressTypeStore(
      this.stores,
      (request) => this._wrapForAllAddresses(request)
    );
    this.externalForDisplay = new AddressTypeStore(
      this.stores,
      (request) => this._wrapForChainAddresses({
        ...request,
        chainsRequest: { chainId: ChainDerivations.EXTERNAL },
      })
    );
    this.internalForDisplay = new AddressTypeStore(
      this.stores,
      (request) => this._wrapForChainAddresses({
        ...request,
        chainsRequest: { chainId: ChainDerivations.INTERNAL },
      })
    );
  }

  _createAddress = async (): Promise<void> => {
    try {
      const publicDeriver = this.stores.substores[environment.API].wallets.selected;
      if (publicDeriver == null) return;
      const withDisplayCutoff = asDisplayCutoff(publicDeriver.self);
      if (withDisplayCutoff == null) {
        Logger.error(`_createAddress incorrect public deriver`);
        return;
      }
      const address = await this.createAddressRequest.execute({
        popFunc: withDisplayCutoff.popAddress
      }).promise;
      if (address != null) {
        await this.refreshAddresses(publicDeriver);
        runInAction('reset error', () => { this.error = null; });
      }
    } catch (error) {
      runInAction('set error', () => { this.error = localizedError(error); });
    }
  };

  @action _resetErrors = () => {
    this.error = null;
  };

  addObservedWallet: PublicDeriverWithCachedMeta => Promise<void> = async (
    publicDeriver
  ) => {
    const withHasUtxoChains = asHasUtxoChains(publicDeriver.self);
    if (withHasUtxoChains == null) {
      await this.allAddressesForDisplay.addObservedWallet(publicDeriver.self);
    } else {
      await this.externalForDisplay.addObservedWallet(publicDeriver.self);
      await this.internalForDisplay.addObservedWallet(publicDeriver.self);
    }
    await this.refreshAddresses(publicDeriver);
  }

  refreshAddresses: PublicDeriverWithCachedMeta => Promise<void> = async (
    publicDeriver
  ) => {
    const withHasUtxoChains = asHasUtxoChains(publicDeriver.self);
    if (withHasUtxoChains == null) {
      await this.allAddressesForDisplay.refreshAddresses();
    } else {
      await this.externalForDisplay.refreshAddresses();
      await this.internalForDisplay.refreshAddresses();
    }
  }

  _wrapForAllAddresses = (request: {
    publicDeriver: PublicDeriver<>,
  }): Promise<Array<StandardAddress>> => {
    const withUtxos = asGetAllUtxos(request.publicDeriver);
    if (withUtxos == null) {
      Logger.error(`_wrapForAllAddresses incorrect public deriver`);
      return Promise.resolve([]);
    }
    // TODO: filter group keys to only get key with our staking key?
    return this.api[environment.API].getAllAddressesForDisplay({
      publicDeriver: withUtxos,
      type: environment.isShelley()
        ? CoreAddressTypes.SHELLEY_GROUP
        : CoreAddressTypes.CARDANO_LEGACY,
    });
  }
  _wrapForChainAddresses = (request: {
    publicDeriver: PublicDeriver<>,
    chainsRequest: IHasUtxoChainsRequest,
  }): Promise<Array<StandardAddress>> => {
    const withHasUtxoChains = asHasUtxoChains(
      request.publicDeriver
    );
    if (withHasUtxoChains == null) {
      Logger.error(`_wrapForChainAddresses incorrect public deriver`);
      return Promise.resolve([]);
    }
    // TODO: filter group keys to only get key with our staking key?
    return this.api[environment.API].getChainAddressesForDisplay({
      publicDeriver: withHasUtxoChains,
      chainsRequest: request.chainsRequest,
      type: environment.isShelley()
        ? CoreAddressTypes.SHELLEY_GROUP
        : CoreAddressTypes.CARDANO_LEGACY,
    });
  }
}
