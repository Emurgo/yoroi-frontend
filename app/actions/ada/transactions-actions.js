// @flow
import Action from '../lib/Action';

import type {
  GetTransactionRowsToExportRequest,
} from '../../api/ada';

// ======= TRANSACTIONS ACTIONS =======

export type TransactionRowsToExportRequest = void;

export default class TransactionsActions {
  loadMoreTransactions: Action<any> = new Action();
  exportTransactionsToFile: Action<GetTransactionRowsToExportRequest> = new Action();
  closeExportTransactionDialog: Action<void> = new Action();
}
