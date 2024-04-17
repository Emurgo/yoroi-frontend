// @flow
import { AsyncAction, Action } from '../lib/Action';
import { Moment } from 'moment';

// ======= TRANSACTIONS ACTIONS =======

export type TransactionRowsToExportRequest = {|
  startDate: typeof Moment,
  endDate: typeof Moment,
|};

export default class TransactionsActions {
  loadMoreTransactions: AsyncAction<{| publicDeriverId: number |}> = new AsyncAction();
  exportTransactionsToFile: AsyncAction<{|
  publicDeriverId: number,
    exportRequest: TransactionRowsToExportRequest,
  |}> = new AsyncAction();
  closeExportTransactionDialog: Action<void> = new Action();
  closeDelegationBanner: Action<void> = new Action();
}
