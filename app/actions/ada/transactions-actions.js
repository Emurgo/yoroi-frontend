// @flow
import Action from '../lib/Action';

import type {
  GetTransactionRowsToExportRequest,
} from '../../api/ada';

// ======= TRANSACTIONS ACTIONS =======

export type TransactionRowsToExportRequest = {};

export default class TransactionsActions {
  loadMoreTransactions: Action<void> = new Action();
  exportTransactionsToFile: Action<GetTransactionRowsToExportRequest> = new Action();
  closeExportTransactionDialog: Action<void> = new Action();
}
