// @flow
import RouterActions from './router-actions';
import TopbarActions from './topbar-actions';
import WalletBackupActions from './wallet-backup-actions';
import ProfileActions from './profile-actions';
import DialogsActions from './dialogs-actions';
import NotificationsActions from './notifications-actions';
import LoadingActions from './loading-actions';
import MemosActions from './memos-actions';
import NoticeBoard from './notice-board-actions';
import WalletActions from './wallet-actions';
import AddressesActions from './common/addresses-actions';
import TransactionsActions from './common/transactions-actions';
import adaActionsMap from './ada/index';
import type { AdaActionsMap } from './ada/index';

export type ActionsMap = {|
  router: RouterActions,
  topbar: TopbarActions,
  walletBackup: WalletBackupActions,
  profile: ProfileActions,
  dialogs: DialogsActions,
  notifications: NotificationsActions,
  memos: MemosActions,
  loading: LoadingActions,
  noticeBoard: NoticeBoard,
  wallets: WalletActions,
  addresses: AddressesActions,
  transactions: TransactionsActions,
  ada: AdaActionsMap,
|};

const actionsMap: ActionsMap = Object.freeze({
  router: new RouterActions(),
  topbar: new TopbarActions(),
  walletBackup: new WalletBackupActions(),
  profile: new ProfileActions(),
  dialogs: new DialogsActions(),
  notifications: new NotificationsActions(),
  memos: new MemosActions(),
  loading: new LoadingActions(),
  noticeBoard: new NoticeBoard(),
  wallets: new WalletActions(),
  addresses: new AddressesActions(),
  transactions: new TransactionsActions(),
  ada: adaActionsMap
});

export default actionsMap;
