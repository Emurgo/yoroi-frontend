// @flow
import JormungandrWalletsActions from './jormungandr-wallets-actions';
import DelegationTransactionActions from './delegation-transaction-actions';
import DelegationActions from './delegation-actions';

export type JormungandrActionsMap = {|
  wallets: JormungandrWalletsActions,
  delegationTransaction: DelegationTransactionActions,
  delegation: DelegationActions,
|};

const jormungandrActionsMap: JormungandrActionsMap = Object.freeze({
  wallets: new JormungandrWalletsActions(),
  delegationTransaction: new DelegationTransactionActions(),
  delegation: new DelegationActions(),
});

export default jormungandrActionsMap;
