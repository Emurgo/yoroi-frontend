// @flow

import { observable, runInAction, action } from 'mobx';
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
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import {
  getAllSchemaTables,
  raii,
} from '../../api/ada/lib/storage/database/utils';
import { GetToken } from '../../api/ada/lib/storage/database/primitives/api/read';
import { ModifyToken } from '../../api/ada/lib/storage/database/primitives/api/write';
import { genCardanoAssetMap } from '../../api/ada/lib/storage/bridge/updateTransactions';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index'

export type TokenInfoMap = Map<
  string, // network ID. String because mobx requires string for observable maps
  Map<
    string, // identifier
    $ReadOnly<TokenRow>
  >
>;

export default class TokenInfoStore extends Store<StoresMap, ActionsMap> {
  @observable tokenInfo: TokenInfoMap;

  setup(): void {
    super.setup();
    this.tokenInfo = new Map();
    this.actions.wallets.setActiveWallet.listen(
      wallet => { this._fetchMissingTokenInfo(wallet) }
    );
  }

  @action _fetchMissingTokenInfo
    : ({| wallet: PublicDeriver<> |}) => Promise<void>
    = async ({ wallet }) => {

    const { requests } = this.stores.transactions.getTxRequests(wallet);

    await requests.getBalanceRequest;
    const balance = requests.getBalanceRequest.result;
    if (!balance || !balance.size) {
      return;
    }
    // expect all tokens to have an identical network id
    const networkId = balance.values[0].networkId;
    const tokenIds = balance.values
      .filter(token => token.networkId === networkId)
      .map(token => token.identifier);

    const db = this.stores.loading.getDatabase();
    if (!db) {
      return;
    }

    const network: ?NetworkRow = (Object.values(networks): Array<any>).find(
      ({ NetworkId }) => NetworkId === networkId
    );
    if (!network || !isCardanoHaskell(network)) {
      return;
    }
    const deps =  Object.freeze({
      ModifyToken,
      GetToken,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(db, table));

    const assetMap = await raii(
      db,
      depTables,
      dbTx => (
        genCardanoAssetMap(
          db,
          dbTx,
          deps,
          tokenIds,
          this.stores.substores.ada.stateFetchStore.fetcher.getTokenInfo,
          network,
        )
      )
    );
    runInAction(() => { this._updateTokenInfo([...assetMap.values()]) });
  };

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
