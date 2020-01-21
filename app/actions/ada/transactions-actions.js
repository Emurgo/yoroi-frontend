// @flow
import { AsyncAction, Action } from '../lib/Action';

// ======= TRANSACTIONS ACTIONS =======

export type TransactionRowsToExportRequest = void;

export default class TransactionsActions {
  loadMoreTransactions: AsyncAction<void> = new AsyncAction();
  exportTransactionsToFile: AsyncAction<TransactionRowsToExportRequest> = new AsyncAction();
  closeExportTransactionDialog: Action<void> = new Action();
}
