// @flow
import RouterActions from './router-actions';
import WalletBackupActions from './wallet-backup-actions';
import ProfileActions from './profile-actions';
import DialogsActions from './dialogs-actions';
import NotificationsActions from './notifications-actions';
import LoadingActions from './loading-actions';
import MemosActions from './memos-actions';
import NoticeBoard from './notice-board-actions';
import WalletActions from './wallet-actions';
import AddressesActions from './common/addresses-actions';
import TimeActions from './common/time-actions';
import TransactionsActions from './common/transactions-actions';
import WalletRestoreActions from './common/wallet-restore-actions';
import YoroiTransferActions from './common/yoroi-transfer-actions';
import TxBuilderActions from './common/tx-builder-actions';
import ExplorerActions from './common/explorer-actions';
import DelegationActions from './common/delegation-actions';
import WalletSettingsActions from './common/wallet-settings-actions';
import adaActionsMap from './ada/index';
import ergoActionsMap from './ergo/index';
import type { AdaActionsMap } from './ada/index';
import type { ErgoActionsMap } from './ergo/index';
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
  loading: LoadingActions,
  noticeBoard: NoticeBoard,
  wallets: WalletActions,
  addresses: AddressesActions,
  time: TimeActions,
  transactions: TransactionsActions,
  walletRestore: WalletRestoreActions,
  delegation: DelegationActions,
  explorers: ExplorerActions,
  ada: AdaActionsMap,
  ergo: ErgoActionsMap,
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
  loading: new LoadingActions(),
  noticeBoard: new NoticeBoard(),
  wallets: new WalletActions(),
  addresses: new AddressesActions(),
  time: new TimeActions(),
  walletRestore: new WalletRestoreActions(),
  delegation: new DelegationActions(),
  transactions: new TransactionsActions(),
  explorers: new ExplorerActions(),
  connector: new ConnectorActionsMap(),
  ada: adaActionsMap,
  ergo: ergoActionsMap,
  serverConnection: new ServerConnectionActions(),
});

export default actionsMap;
