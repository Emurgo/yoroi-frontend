// @flow

import Store from '../base/Store';
import type {
  GetTransactionsFunc,
  RefreshPendingTransactionsFunc,
} from '../../api/common';

export default class ErgoTransactionsStore extends Store {
  refreshTransactions: GetTransactionsFunc = (request) => {
    return this.api.ergo.refreshTransactions({
      ...request,
    });
  }

  refreshPendingTransactions: RefreshPendingTransactionsFunc = (request) => {
    return this.api.ergo.refreshPendingTransactions(request);
  }
}
