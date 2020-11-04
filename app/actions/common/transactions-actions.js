// @flow
import { AsyncAction, Action, } from '../lib/Action';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { DelegationRequests } from '../../stores/toplevel/DelegationStore';

// ======= TRANSACTIONS ACTIONS =======

export type TransactionRowsToExportRequest = void;

export default class TransactionsActions {
  loadMoreTransactions: AsyncAction<PublicDeriver<>> = new AsyncAction();
  exportTransactionsToFile: AsyncAction<{|
    publicDeriver: PublicDeriver<>,
    exportRequest: TransactionRowsToExportRequest,
    delegationRequests: DelegationRequests,
  |}> = new AsyncAction();
  closeExportTransactionDialog: Action<void> = new Action();
}
