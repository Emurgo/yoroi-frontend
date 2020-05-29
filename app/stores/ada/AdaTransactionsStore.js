// @flow

import Store from '../base/Store';
import type {
  GetTransactionsFunc,
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
}
