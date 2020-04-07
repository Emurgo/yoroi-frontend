// @flow
import RouterActions from './router-actions';
import TopbarActions from './topbar-actions';
import WalletBackupActions from './wallet-backup-actions';
import ProfileActions from './profile-actions';
import DialogsActions from './dialogs-actions';
import NotificationsActions from './notifications-actions';
import NoticeBoard from './notice-board-actions';
import WalletActions from './wallet-actions';
import adaActionsMap from './ada/index';
import type { AdaActionsMap } from './ada/index';

export type ActionsMap = {|
  router: RouterActions,
  topbar: TopbarActions,
  walletBackup: WalletBackupActions,
  profile: ProfileActions,
  dialogs: DialogsActions,
  notifications: NotificationsActions,
  noticeBoard: NoticeBoard,
  wallets: WalletActions,
  ada: AdaActionsMap,
|};

const actionsMap: ActionsMap = {
  router: new RouterActions(),
  topbar: new TopbarActions(),
  walletBackup: new WalletBackupActions(),
  profile: new ProfileActions(),
  dialogs: new DialogsActions(),
  notifications: new NotificationsActions(),
  noticeBoard: new NoticeBoard(),
  wallets: new WalletActions(),
  ada: adaActionsMap
};

export default actionsMap;
