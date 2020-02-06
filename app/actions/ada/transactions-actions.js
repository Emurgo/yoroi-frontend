// @flow
import { AsyncAction, Action } from '../lib/Action';
import PublicDeriverWithCachedMeta from '../../domain/PublicDeriverWithCachedMeta';

// ======= TRANSACTIONS ACTIONS =======

export type TransactionRowsToExportRequest = void;

export default class TransactionsActions {
  loadMoreTransactions: AsyncAction<PublicDeriverWithCachedMeta> = new AsyncAction();
  exportTransactionsToFile: AsyncAction<{|
    publicDeriver: PublicDeriverWithCachedMeta,
    exportRequest: TransactionRowsToExportRequest,
  |}> = new AsyncAction();
  closeExportTransactionDialog: Action<void> = new Action();
}
