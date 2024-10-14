// @flow
import WalletBackupActions from './wallet-backup-actions';
import DialogsActions from './dialogs-actions';
import MemosActions from './memos-actions';
import TxBuilderActions from './common/tx-builder-actions';
import WalletSettingsActions from './common/wallet-settings-actions';
import  ConnectorActionsMap from '../connector/actions/connector-actions';

export type ActionsMap = {|
  txBuilderActions: TxBuilderActions,
  walletSettings: WalletSettingsActions,
  walletBackup: WalletBackupActions,
  dialogs: DialogsActions,
  memos: MemosActions,
  connector: ConnectorActionsMap,
|};

const actionsMap: ActionsMap = Object.freeze({
  txBuilderActions: new TxBuilderActions(),
  walletSettings: new WalletSettingsActions(),
  walletBackup: new WalletBackupActions(),
  dialogs: new DialogsActions(),
  memos: new MemosActions(),
  connector: new ConnectorActionsMap(),
});

export default actionsMap;
