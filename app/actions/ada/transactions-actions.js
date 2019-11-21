// @flow
import Action from '../lib/Action';

// ======= TRANSACTIONS ACTIONS =======

export type TransactionRowsToExportRequest = void;

export default class TransactionsActions {
  loadMoreTransactions: Action<void> = new Action();
  exportTransactionsToFile: Action<TransactionRowsToExportRequest> = new Action();
  closeExportTransactionDialog: Action<void> = new Action();
}
