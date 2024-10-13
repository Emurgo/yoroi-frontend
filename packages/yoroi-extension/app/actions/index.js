// @flow
import RouterActions from './router-actions';
import WalletBackupActions from './wallet-backup-actions';
import ProfileActions from './profile-actions';
import DialogsActions from './dialogs-actions';
import NotificationsActions from './notifications-actions';
import MemosActions from './memos-actions';
import WalletActions from './wallet-actions';
import WalletRestoreActions from './common/wallet-restore-actions';
import YoroiTransferActions from './common/yoroi-transfer-actions';
import TxBuilderActions from './common/tx-builder-actions';
import WalletSettingsActions from './common/wallet-settings-actions';
import  ConnectorActionsMap from '../connector/actions/connector-actions';
import ServerConnectionActions from './server-connection-actions';

export type ActionsMap = {|
  txBuilderActions: TxBuilderActions,
  walletSettings: WalletSettingsActions,
  router: RouterActions,
  walletBackup: WalletBackupActions,
  profile: ProfileActions,
  dialogs: DialogsActions,
  notifications: NotificationsActions,
  yoroiTransfer: YoroiTransferActions,
  memos: MemosActions,
  wallets: WalletActions,
  walletRestore: WalletRestoreActions,
  connector: ConnectorActionsMap,
  serverConnection: ServerConnectionActions,
|};

const actionsMap: ActionsMap = Object.freeze({
  txBuilderActions: new TxBuilderActions(),
  walletSettings: new WalletSettingsActions(),
  router: new RouterActions(),
  walletBackup: new WalletBackupActions(),
  profile: new ProfileActions(),
  dialogs: new DialogsActions(),
  notifications: new NotificationsActions(),
  yoroiTransfer: new YoroiTransferActions(),
  memos: new MemosActions(),
  wallets: new WalletActions(),
  walletRestore: new WalletRestoreActions(),
  connector: new ConnectorActionsMap(),
  serverConnection: new ServerConnectionActions(),
});

export default actionsMap;
