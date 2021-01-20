// @flow

import Store from '../base/Store';
import type {
  GetTransactionsFunc,
  RefreshPendingTransactionsFunc,
} from '../../api/common';

export default class ErgoTransactionsStore extends Store {
  refreshTransactions: GetTransactionsFunc = (request) => {
    const stateFetcher = this.stores.substores.ergo.stateFetchStore.fetcher;
    return this.api.ergo.refreshTransactions({
      ...request,
      getTransactionsHistoryForAddresses: stateFetcher.getTransactionsHistoryForAddresses,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
      getAssetInfo: stateFetcher.getAssetInfo,
      getBestBlock: stateFetcher.getBestBlock,
    });
  }

  refreshPendingTransactions: RefreshPendingTransactionsFunc = (request) => {
    return this.api.ergo.refreshPendingTransactions(request);
  }
}
