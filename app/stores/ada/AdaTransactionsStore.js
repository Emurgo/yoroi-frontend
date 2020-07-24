// @flow

import Store from '../base/Store';
import type {
  GetTransactionsFunc,
  RefreshPendingTransactionsFunc,
} from '../../api/common';

export default class AdaTransactionsStore extends Store {

  refreshTransactions: GetTransactionsFunc = (request) => {
    const stateFetcher = this.stores.substores.ada.stateFetchStore.fetcher;

    return this.api.ada.refreshTransactions({
      ...request,
      getTransactionsHistoryForAddresses: stateFetcher.getTransactionsHistoryForAddresses,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
      getBestBlock: stateFetcher.getBestBlock,
    });
  }

  refreshPendingTransactions: RefreshPendingTransactionsFunc = (request) => {
    return this.api.ada.refreshPendingTransactions(request);
  }
}
