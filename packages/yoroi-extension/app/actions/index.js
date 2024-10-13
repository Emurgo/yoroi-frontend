// @flow
import WalletBackupActions from './wallet-backup-actions';
import ProfileActions from './profile-actions';
import DialogsActions from './dialogs-actions';
import NotificationsActions from './notifications-actions';
import MemosActions from './memos-actions';
import WalletRestoreActions from './common/wallet-restore-actions';
import YoroiTransferActions from './common/yoroi-transfer-actions';
import TxBuilderActions from './common/tx-builder-actions';
import WalletSettingsActions from './common/wallet-settings-actions';
import  ConnectorActionsMap from '../connector/actions/connector-actions';

export type ActionsMap = {|
  txBuilderActions: TxBuilderActions,
  walletSettings: WalletSettingsActions,
  walletBackup: WalletBackupActions,
  profile: ProfileActions,
  dialogs: DialogsActions,
  notifications: NotificationsActions,
  yoroiTransfer: YoroiTransferActions,
  memos: MemosActions,
  walletRestore: WalletRestoreActions,
  connector: ConnectorActionsMap,
|};

const actionsMap: ActionsMap = Object.freeze({
  txBuilderActions: new TxBuilderActions(),
  walletSettings: new WalletSettingsActions(),
  walletBackup: new WalletBackupActions(),
  profile: new ProfileActions(),
  dialogs: new DialogsActions(),
  notifications: new NotificationsActions(),
  yoroiTransfer: new YoroiTransferActions(),
  memos: new MemosActions(),
  walletRestore: new WalletRestoreActions(),
  connector: new ConnectorActionsMap(),
});

export default actionsMap;
