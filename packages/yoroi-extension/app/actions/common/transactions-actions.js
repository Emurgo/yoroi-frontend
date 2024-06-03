// @flow
import { AsyncAction, Action } from '../lib/Action';
import { Moment } from 'moment';

// ======= TRANSACTIONS ACTIONS =======

export type TransactionRowsToExportRequest = {|
  startDate: typeof Moment,
  endDate: typeof Moment,
|};

type WalletStateForExport = {
  publicDeriverId: number,
  networkId: number,
  +plate: {
    TextPart: string,
    ...
  },
  defaultTokenId: string,
  allAddresses: {|
    utxoAddresses: Array<$ReadOnly<AddressRow>>,
    accountingAddresses: Array<$ReadOnly<AddressRow>>,
  |},
};

export default class TransactionsActions {
  loadMoreTransactions: AsyncAction<{ publicDeriverId: number, networkId: number, ... }> = new AsyncAction();
  exportTransactionsToFile: AsyncAction<{|
    publicDeriver: WalletStateForExport,
    exportRequest: TransactionRowsToExportRequest,
  |}> = new AsyncAction();
  closeExportTransactionDialog: Action<void> = new Action();
  closeDelegationBanner: Action<void> = new Action();
}
