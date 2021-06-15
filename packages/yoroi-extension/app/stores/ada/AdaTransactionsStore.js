// @flow

import Store from '../base/Store';
import type {
  BaseGetTransactionsRequest,
  GetTransactionsFunc,
  GetTransactionsResponse,
  RefreshPendingTransactionsFunc,
} from '../../api/common';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import WalletTransaction from '../../domain/WalletTransaction';
import CardanoShelleyTransaction from '../../domain/CardanoShelleyTransaction';
import type { RemoteTokenInfo, TokenInfoResponse } from '../../api/ada/lib/state-fetch/types';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';

function createTokenLocalStorageKey(tokenId: string, network: $ReadOnly<NetworkRow>): string {
  return `token-metadata-${network.NetworkId}-${tokenId}`;
}

export default class AdaTransactionsStore extends Store<StoresMap, ActionsMap> {

  refreshTransactions: GetTransactionsFunc = async (request: BaseGetTransactionsRequest) => {
    const stateFetcher = this.stores.substores.ada.stateFetchStore.fetcher;

    const txs: GetTransactionsResponse = await this.api.ada.refreshTransactions({
      ...request,
      getTransactionsHistoryForAddresses: stateFetcher.getTransactionsHistoryForAddresses,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
      getBestBlock: stateFetcher.getBestBlock,
    });

    try {
      const tokenIds = new Set<string>();
      txs.transactions.forEach((tx: WalletTransaction) => {
        tx.amount.values.forEach(t => tokenIds.add(t.identifier));
        tx.addresses.from.flatMap(a => a.value.values).forEach(t => tokenIds.add(t.identifier));
        tx.addresses.to.flatMap(a => a.value.values).forEach(t => tokenIds.add(t.identifier));
        if (tx instanceof CardanoShelleyTransaction) {
          tx.withdrawals.flatMap(w => w.value.values).forEach(t => tokenIds.add(t.identifier));
        }
      });
      const network = request.publicDeriver.getParent().getNetworkInfo();
      const missingMetaTokenIds = [...tokenIds]
        .map(id => id?.split('.')?.join(''))
        .filter(tokenId => tokenId.length > 0
          && !localStorage.getItem(createTokenLocalStorageKey(tokenId, network)));
      const tokenInfo: TokenInfoResponse = await stateFetcher.getTokenInfo({
        network,
        tokenIds: missingMetaTokenIds,
      });
      // $FlowFixMe[incompatible-call]
      missingMetaTokenIds.forEach((tokenId: string) => {
        const tokenMeta: ?RemoteTokenInfo = tokenInfo[tokenId];
        localStorage.setItem(createTokenLocalStorageKey(tokenId, network), JSON.stringify({
          ...tokenMeta,
          timestamp: new Date().toISOString(),
        }));
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Token metadata fetch failed. Reason: ', error);
    }

    return txs;
  }

  refreshPendingTransactions: RefreshPendingTransactionsFunc = (request) => {
    return this.api.ada.refreshPendingTransactions(request);
  }
}
