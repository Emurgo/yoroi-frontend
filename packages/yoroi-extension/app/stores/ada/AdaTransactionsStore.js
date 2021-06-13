// @flow

import Store from '../base/Store';
import type {
  GetTransactionsFunc, GetTransactionsResponse,
  RefreshPendingTransactionsFunc,
  BaseGetTransactionsRequest,
} from '../../api/common';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import WalletTransaction from '../../domain/WalletTransaction';
import CardanoShelleyTransaction from '../../domain/CardanoShelleyTransaction';
import type { RemoteTokenInfo } from '../../api/ada/lib/state-fetch/types';

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
      const missingMetaTokenIds = [...tokenIds]
        .filter(tokenId => tokenId?.length > 0 && !localStorage.getItem(`token-metadata-${tokenId}`))
        .map(id => id.split('.')[0]);
      const tokenInfo = await stateFetcher.getTokenInfo({
        network: request.publicDeriver.getParent().getNetworkInfo(),
        tokenIds: missingMetaTokenIds,
      });
      // $FlowFixMe[incompatible-call]
      Object.entries(tokenInfo).forEach(([tokenId, tokenMeta]: [string, RemoteTokenInfo]) => {
        localStorage.setItem(`token-metadata-${tokenId}`, JSON.stringify({
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
