// @flow

import Store from '../base/Store';
import type {
  GetTransactionsFunc,
} from '../../api/common';

export default class JormungandrTransactionsStore extends Store {

  refreshTransactions: GetTransactionsFunc = (request) => {
    const stateFetcher = this.stores.substores.jormungandr.stateFetchStore.fetcher;

    return this.api.jormungandr.refreshTransactions({
      ...request,
      getTransactionsHistoryForAddresses: stateFetcher.getTransactionsHistoryForAddresses,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
      getBestBlock: stateFetcher.getBestBlock,
    });
  }
}
