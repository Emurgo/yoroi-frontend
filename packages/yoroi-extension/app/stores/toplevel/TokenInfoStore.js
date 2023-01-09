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
  isErgo,
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
import { addErgoAssets } from '../../api/ergo/lib/storage/bridge/updateTransactions';
import type WalletsActions from '../../actions/wallet-actions';
import type TransactionsStore from './TransactionsStore';
import type { IFetcher as IFetcherCardano } from '../../api/ada/lib/state-fetch/IFetcher';
import type { IFetcher as IFetcherErgo } from '../../api/ergo/lib/state-fetch/IFetcher';

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
      +ergo: {
        +stateFetchStore: {
          +fetcher: IFetcherErgo,
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

  fetchMissingTokenInfo: (number, Array<string>) => Promise<void> = async (
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
            network,
          )
        )
      );
    } else if (isErgo(network)) {
      assetMap = await addErgoAssets(
        {
          db,
          tokenIdentifiers: tokenIds,
          getAssetInfo: async (req) => {
            try {
              return await
              this.stores.substores.ergo.stateFetchStore.fetcher.getAssetInfo(req);
            } catch (e) {
              // eslint-disable-next-line no-console
              console.error('Aseet info request failed', e);
              return Object.fromEntries(tokenIds.map(tokenId => [tokenId, ({}: any)]));;
            }
          },
          network,
        }
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
