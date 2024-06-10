// @flow

import { observable, runInAction } from 'mobx';
import Store from '../base/Store';

import type {
  TokenInsert, TokenRow,
  NetworkRow,
} from '../../api/ada/lib/storage/database/primitives/tables';
import {
  defaultAssets,
  networks,
  isCardanoHaskell,
} from '../../api/ada/lib/storage/database/prepackaged/networks';
import type {
  DefaultTokenEntry,
} from '../../api/common/lib/MultiToken';
import {
  getAllSchemaTables,
  raii,
} from '../../api/ada/lib/storage/database/utils';
import { GetToken } from '../../api/ada/lib/storage/database/primitives/api/read';
import { ModifyToken } from '../../api/ada/lib/storage/database/primitives/api/write';
import { genCardanoAssetMap } from '../../api/ada/lib/storage/bridge/updateTransactions';
import type WalletsActions from '../../actions/wallet-actions';
import type TransactionsStore from './TransactionsStore';
import type { IFetcher as IFetcherCardano } from '../../api/ada/lib/state-fetch/IFetcher.types';
import type { RemoteTokenInfo } from '../../api/ada/lib/state-fetch/types';
import { createTokenRowSummary } from '../stateless/tokenHelpers';
import { second } from '../../coreUtils';

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
    +loading: {
      +getDatabase: () => any,
      ...
    },
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

  fetchMissingTokenInfo: (networkId: number, tokenIds: Array<string>) => Promise<void> = async (
    networkId,
    tokenIds
  ) => {
    const db = this.stores.loading.getDatabase();
    if (!db) {
      return;
    }
    const network: ?NetworkRow = (Object.values(networks): Array<any>).find(
      ({ NetworkId }) => NetworkId === networkId
    );
    if (!network) {
      return;
    }

    let assetMap;
    if (isCardanoHaskell(network)) {
      const deps =  Object.freeze({
        ModifyToken,
        GetToken,
      });
      const depTables = Object
            .keys(deps)
            .map(key => deps[key])
            .flatMap(table => getAllSchemaTables(db, table));

      assetMap = await raii(
        db,
        depTables,
        dbTx => (
          genCardanoAssetMap(
            db,
            dbTx,
            deps,
            tokenIds,
            this.stores.substores.ada.stateFetchStore.fetcher.getTokenInfo,
            this.stores.substores.ada.stateFetchStore.fetcher.getMultiAssetMintMetadata,
            this.stores.substores.ada.stateFetchStore.fetcher.getMultiAssetSupply,
            network,
          )
        )
      );
    } else {
      throw new Error('unexpected wallet type');
    }
    runInAction(() => { this._updateTokenInfo([...assetMap.values()]) });
  }

  refreshTokenInfo: void => Promise<void> = async () => {
    const db = this.stores.loading.getDatabase();
    if (db == null) throw new Error(`${nameof(TokenInfoStore)}::${nameof(this.refreshTokenInfo)} called before storage was initialized`);
    const tokens = await this.api.common.getTokenInfo({ db });

    runInAction(() => { this._updateTokenInfo(tokens) });
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
