// @flow

import JormungandrWalletsActions from './jormungandr-wallets-actions';
import DelegationTransactionActions from './delegation-transaction-actions';

export type JormungandrActionsMap = {|
  wallets: JormungandrWalletsActions,
  delegationTransaction: DelegationTransactionActions,
|};

const jormungandrActionsMap: JormungandrActionsMap = Object.freeze({
  wallets: new JormungandrWalletsActions(),
  delegationTransaction: new DelegationTransactionActions(),
});

export default jormungandrActionsMap;
