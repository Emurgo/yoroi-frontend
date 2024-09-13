// @flow
import { AsyncAction, Action } from '../lib/Action';
import { Moment } from 'moment';
import type { WalletState } from '../../../chrome/extension/background/types';

// ======= TRANSACTIONS ACTIONS =======

export type TransactionRowsToExportRequest = {|
  startDate: typeof Moment,
  endDate: typeof Moment,
|};

export default class TransactionsActions {
  loadMoreTransactions: AsyncAction<WalletState> = new AsyncAction();
  exportTransactionsToFile: AsyncAction<{|
    publicDeriver: WalletState,
    exportRequest: TransactionRowsToExportRequest,
  |}> = new AsyncAction();
  closeExportTransactionDialog: Action<void> = new Action();
  closeDelegationBanner: Action<void> = new Action();
}
