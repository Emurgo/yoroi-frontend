// @flow
import { AsyncAction, Action } from '../lib/Action';
import type { WalletWithCachedMeta } from '../../stores/toplevel/WalletStore';

// ======= TRANSACTIONS ACTIONS =======

export type TransactionRowsToExportRequest = void;

export default class TransactionsActions {
  loadMoreTransactions: AsyncAction<WalletWithCachedMeta> = new AsyncAction();
  exportTransactionsToFile: AsyncAction<{|
    publicDeriver: WalletWithCachedMeta,
    exportRequest: TransactionRowsToExportRequest,
  |}> = new AsyncAction();
  closeExportTransactionDialog: Action<void> = new Action();
}
