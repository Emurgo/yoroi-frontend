// @flow

import { observable, runInAction } from 'mobx';
import Store from '../base/Store';

import type {
  TokenInsert, TokenRow,
  NetworkRow,
} from '../../api/ada/lib/storage/database/primitives/tables';
import { defaultAssets } from '../../api/ada/lib/storage/database/prepackaged/networks';
import type {
  DefaultTokenEntry,
} from '../../api/common/lib/MultiToken';
import type WalletsActions from '../../actions/wallet-actions';
import type TransactionsStore from './TransactionsStore';
import type { IFetcher as IFetcherCardano } from '../../api/ada/lib/state-fetch/IFetcher.types';
import { getCardanoAssets } from '../../api/thunk';
import type { RemoteTokenInfo } from '../../api/ada/lib/state-fetch/types';
import { createTokenRowSummary } from '../stateless/tokenHelpers';

export type TokenInfoMap = Map<
  string, // network ID. String because mobx requires string for observable maps
  Map<
    string, // identifier
    $ReadOnly<TokenRow>
  >
>;

export default class TokenInfoStore<
  StoresMapType: {
    +transactions?: TransactionsStore,
    +substores: {
      +ada: {
        +stateFetchStore: {
          +fetcher: IFetcherCardano,
          ...
        },
        ...
      },
      ...
    },
    ...
  },
  ActionsMapType: { +wallets?: WalletsActions, ... },
> extends Store<StoresMapType, ActionsMapType> {
  @observable tokenInfo: TokenInfoMap;

  setup(): void {
    super.setup();
    this.tokenInfo = new Map();
  }

  async fetchRemoteMetadata(network: $ReadOnly<NetworkRow>, tokenId: string): Promise<?RemoteTokenInfo> {
    const identifier = tokenId.replace('.', '');
    return (await this.stores.substores.ada.stateFetchStore.fetcher
      .getTokenInfo({ network, tokenIds: [identifier] }))[identifier];
  }

  async getLocalOrRemoteMetadata(network: $ReadOnly<NetworkRow>, tokenId: string): Promise<RemoteTokenInfo> {
    const localTokeninfo: ?$ReadOnly<TokenRow> =
      this.tokenInfo.get(String(network.NetworkId))?.get(tokenId);
    if (localTokeninfo != null) {
      return createTokenRowSummary(localTokeninfo);
    }
    const remoteTokeninfo: ?RemoteTokenInfo =
      await this.fetchRemoteMetadata(network, tokenId);
    if (remoteTokeninfo != null) {
      return remoteTokeninfo;
    }
    return { name: undefined, ticker: undefined, decimals: undefined, logo: undefined };
  }

  fetchMissingAndGetLocalOrRemoteMetadata(network: $ReadOnly<NetworkRow>, tokenIds: Array<string>): { [string]: Promise<RemoteTokenInfo> } {
    const fetchPromise = this.fetchMissingTokenInfo(network.NetworkId, tokenIds);
    return tokenIds.reduce((res, id) => {
      res[id] = fetchPromise.then(() => this.getLocalOrRemoteMetadata(network, id));
      return res;
    }, {});
  }

  fetchMissingTokenInfo: (networkId: number, tokenIds: Array<string>) => Promise<void> = async (
    networkId,
    tokenIds
  ) => {
    // todo: filter out tokenIds already in this.tokenInfo
    const assets = await getCardanoAssets({ networkId, tokenIds });
    runInAction(() => { this._updateTokenInfo(assets) });
  }

  refreshTokenInfo: void => Promise<void> = async () => {
    const assets = await getCardanoAssets();
    runInAction(() => { this._updateTokenInfo(assets) });
  }

  getDefaultTokenInfo: number => $ReadOnly<TokenRow> = (
    networkId: number
  ) => {
    return getDefaultEntryTokenInfo(
      networkId,
      this.tokenInfo
    );
  }

  getDefaultTokenInfoSummary: number => RemoteTokenInfo = (
    networkId: number
  ) => {
    return createTokenRowSummary(this.getDefaultTokenInfo(networkId));
  }

  _updateTokenInfo: $ReadOnlyArray<$ReadOnly<TokenRow>> => void = (tokens) => {
    for (const token of tokens) {
      const mapForNetwork = this.tokenInfo.get(token.NetworkId.toString());

      if (mapForNetwork == null) {
        const newMap: Map<string, $ReadOnly<TokenRow>> = observable.map();
        newMap.set(token.Identifier, token);
        this.tokenInfo.set(token.NetworkId.toString(), newMap);
      } else {
        // note: always update since cache may be out of date
        mapForNetwork.set(token.Identifier, token);
      }
    }
  }
}

export function getDefaultEntryToken(
  info: $ReadOnly<{
    NetworkId: number,
    Identifier: string,
    ...,
  }>,
): DefaultTokenEntry {
  return {
    defaultNetworkId: info.NetworkId,
    defaultIdentifier: info.Identifier,
  };
}

export function getDefaultEntryTokenInfo(
  networkId: number,
  tokenInfo: TokenInfoMap,
): $ReadOnly<TokenRow> {
  const defaultToken = defaultAssets.find(asset => asset.NetworkId === networkId);
  if (defaultToken == null) throw new Error(`${nameof(TokenInfoStore)} no default token found for network`);

  const row = tokenInfo
    .get(networkId.toString())
    ?.get(defaultToken.Identifier);

  if (row == null) throw new Error(`${nameof(TokenInfoStore)} no row found for default token`);

  return row;
}

export function mockDefaultToken(
  networkId: number,
): DefaultTokenEntry {
  return getDefaultEntryToken(
    getDefaultEntryTokenInfo(
      networkId,
      mockFromDefaults(defaultAssets)
    )
  );
}

export function mockFromDefaults(
  mockSource: Array<$Diff<TokenInsert, {| Digest: number |}>>
): TokenInfoMap {
  const tokenInfo: TokenInfoMap = new Map();

  const withMock: Array<TokenRow> = mockSource.map((entry, i) => ({
    ...entry,
    TokenId: i,
    Digest: i,
    IsNFT: entry.IsNFT
  }));
  for (const token of withMock) {
    const mapForNetwork = tokenInfo.get(token.NetworkId.toString());

    if (mapForNetwork == null) {
      const newMap: Map<string, $ReadOnly<TokenRow>> = observable.map();
      newMap.set(token.Identifier, token);
      tokenInfo.set(token.NetworkId.toString(), newMap);
    } else {
      // note: always update since cache may be out of date
      mapForNetwork.set(token.Identifier, token);
    }
  }

  return tokenInfo;
}
