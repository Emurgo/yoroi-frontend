// @flow
import Action from '../lib/Action';

// ======= TRANSACTIONS ACTIONS =======

export default class TransactionsActions {
  loadMoreTransactions: Action<any> = new Action();
  exportTransactionsToFile: Action<void> = new Action();
  closeExportTransactionDialog: Action<void> = new Action();
}
