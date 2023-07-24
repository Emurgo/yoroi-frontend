// @flow
import { AsyncAction, Action } from '../lib/Action';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { Moment } from 'moment';

// ======= TRANSACTIONS ACTIONS =======

export type TransactionRowsToExportRequest = {|
  startDate: typeof Moment,
  endDate: typeof Moment,
|};

export default class TransactionsActions {
  loadMoreTransactions: AsyncAction<PublicDeriver<>> = new AsyncAction();
  exportTransactionsToFile: AsyncAction<{|
    publicDeriver: PublicDeriver<>,
    exportRequest: TransactionRowsToExportRequest,
  |}> = new AsyncAction();
  closeExportTransactionDialog: Action<void> = new Action();
  closeDelegationBanner: Action<void> = new Action();
}
