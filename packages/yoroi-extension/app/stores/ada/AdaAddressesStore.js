// @flow

import Store from '../base/Store';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';

import type { StandardAddress, AddressTypeName, } from '../../types/AddressFilterTypes';
import { AddressGroupTypes, AddressSubgroup } from '../../types/AddressFilterTypes';
import {
  asGetStakingKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import {
  unwrapStakingKey,
} from '../../api/ada/lib/storage/bridge/utils';
import {
  filterAddressesByStakingKey,
} from '../../api/ada/lib/storage/bridge/delegationUtils';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import { isResolvableDomain, resolverApiMaker } from '@yoroi/resolver';
import { Api, Resolver } from '@yoroi/types';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';

export async function filterMangledAddresses(request: {|
  publicDeriver: PublicDeriver<>,
  baseAddresses: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
  invertFilter: boolean,
|}): Promise<$ReadOnlyArray<$ReadOnly<StandardAddress>>> {
  const withStakingKey = asGetStakingKey(request.publicDeriver);
  if (withStakingKey == null) {
    if (request.invertFilter) return [];
    return request.baseAddresses.map(info => ({
      ...info,
      address: info.address
    }));
  }

  const stakingKeyResp = await withStakingKey.getStakingKey();

  const stakingKey = unwrapStakingKey(stakingKeyResp.addr.Hash);

  const filterResult = filterAddressesByStakingKey<StandardAddress>(
    stakingKey,
    request.baseAddresses,
    false,
  );

  const nonMangledSet = new Set(filterResult);
  const result = request.baseAddresses.filter(
    info => (request.invertFilter ? !nonMangledSet.has(info) : nonMangledSet.has(info))
  );

  return result.map(info => ({
    ...info,
    address: info.address,
  }));
}

export type DomainResolverResponseError = 'forbidden' | 'unexpected';

export type DomainResolverResponse = {|
  nameServer: string,
  address: ?string,
  error: ?DomainResolverResponseError,
|};

export type DomainResolverFunc = string => Promise<?DomainResolverResponse>;

export function resolveAddressDomainNameServerName(nameServerTag: string): string {
  switch (nameServerTag) {
    case Resolver.NameServer.Handle: return 'ADA Handle'
    case Resolver.NameServer.Cns: return 'Cardano Name Service (CNS)'
    case Resolver.NameServer.Unstoppable: return 'Unstoppable Domains'
    default: return nameServerTag
  }
}

export default class AdaAddressesStore extends Store<StoresMap, ActionsMap> {

  _domainResolverApi: ?{| getCardanoAddresses: ({| resolve: string |}) => Promise<any> |} = null;

  setup(): void {
    super.setup();
    this._domainResolverApi = resolverApiMaker({
      apiConfig: {
        [Resolver.NameServer.Unstoppable]: {
          apiKey: 'czsajliz-wxgu6tujd1zqq7hey_pclfqhdjsqolsxjfsurgh',
        },
      },
      cslFactory: (ctx) => RustModule.CrossCsl.init(ctx),
    });
  }

  domainResolverSupported(): boolean {
    const selectedWallet = this.stores.wallets.selected;
    if (selectedWallet == null) {
      return true;
    }
    return selectedWallet.isMainnet();
  }

  getSupportedAddressDomainBannerState(): boolean {
    const selectedWallet = this.stores.wallets.selected;
    if (selectedWallet == null) {
      return true;
    }
    const id = String(selectedWallet.publicDeriverId);
    return !this.api.localStorage.getFlag(`w${id}/SupportedAddressDomainBannerState/closed`);
  }

  setSupportedAddressDomainBannerState(isDisplayed: boolean): void {
    const selectedWallet = this.stores.wallets.selected;
    if (selectedWallet == null) {
      return;
    }
    const id = String(selectedWallet.publicDeriverId);
    this.api.localStorage.setFlag(`w${id}/SupportedAddressDomainBannerState/closed`, !isDisplayed);
  }

  async resolveDomainAddress(resolve: string): Promise<?DomainResolverResponse> {
    const { getCardanoAddresses } = this._domainResolverApi ?? {};
    if (getCardanoAddresses == null || !isResolvableDomain(resolve)) {
      return Promise.resolve(null);
    }
    const res = await getCardanoAddresses({ resolve });
    let resultForbidden: ?DomainResolverResponse = null;
    let resultUnexpected: ?DomainResolverResponse = null;
    for (const { nameServer, address, error } of res) {
      const resolvedNameServer = resolveAddressDomainNameServerName(nameServer);
      if (address != null) {
        // Return success right away
        const resultSuccess: DomainResolverResponse =
          { nameServer: resolvedNameServer, address, error: null };
        return Promise.resolve(resultSuccess);
      }
      /* Non-success results are stored but not returned yet
       * in case next iterations might have success
       */
      if (
        error instanceof Resolver.Errors.InvalidDomain
        || error instanceof Resolver.Errors.UnsupportedTld
        || error instanceof Resolver.Errors.NotFound
      ) {
        // ignore
      } else if (error instanceof Api.Errors.Forbidden) {
        if (resultForbidden == null) {
          resultForbidden = { nameServer: resolvedNameServer, error: 'forbidden', address: null };
        }
      } else {
        if (resultUnexpected == null) {
          resultUnexpected = { nameServer: resolvedNameServer, error: 'unexpected', address: null };
        }
        console.error(`Error resolving domain address @ ${nameServer} (${error?.constructor?.name})`, error)
      }
    }
    return Promise.resolve(resultForbidden ?? resultUnexpected ?? null);
  }

  storewiseFilter: {|
    publicDeriver: PublicDeriver<>,
    storeName: AddressTypeName,
    addresses: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
  |} => Promise<$ReadOnlyArray<$ReadOnly<StandardAddress>>> = async (request) => {
    if (request.storeName.group === AddressGroupTypes.addressBook) {
      return request.addresses;
    }
    if (request.storeName.subgroup === AddressGroupTypes.base) {
      return filterMangledAddresses({
        publicDeriver: request.publicDeriver,
        baseAddresses: request.addresses,
        invertFilter: false,
      });
    }
    if (request.storeName.subgroup === AddressSubgroup.mangled) {
      return filterMangledAddresses({
        publicDeriver: request.publicDeriver,
        baseAddresses: request.addresses,
        invertFilter: true,
      });
    }
    return request.addresses;
  }
}
