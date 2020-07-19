// @flow
import JormungandrWalletsActions from './jormungandr-wallets-actions';
import WalletSettingsActions from './wallet-settings-actions';
import YoroiTransferActions from './yoroi-transfer-actions';
import TxBuilderActions from './tx-builder-actions';
import WalletRestoreActions from './wallet-restore-actions';
import DelegationTransactionActions from './delegation-transaction-actions';
import DelegationActions from './delegation-actions';

export type JormungandrActionsMap = {|
  txBuilderActions: TxBuilderActions,
  wallets: JormungandrWalletsActions,
  walletSettings: WalletSettingsActions,
  yoroiTransfer: YoroiTransferActions,
  walletRestore: WalletRestoreActions,
  delegationTransaction: DelegationTransactionActions,
  delegation: DelegationActions,
|};

const jormungandrActionsMap: JormungandrActionsMap = Object.freeze({
  txBuilderActions: new TxBuilderActions(),
  wallets: new JormungandrWalletsActions(),
  walletSettings: new WalletSettingsActions(),
  yoroiTransfer: new YoroiTransferActions(),
  walletRestore: new WalletRestoreActions(),
  delegationTransaction: new DelegationTransactionActions(),
  delegation: new DelegationActions(),
});

export default jormungandrActionsMap;
