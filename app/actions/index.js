// @flow
import RouterActions from './router-actions';
import SidebarActions from './sidebar-actions';
import WalletBackupActions from './wallet-backup-actions';
import ProfileActions from './profile-actions';
import DialogsActions from './dialogs-actions';
import NotificationsActions from './notifications-actions';
import adaActionsMap from './ada/index';
import type { AdaActionsMap } from './ada/index';

export type ActionsMap = {
  router: RouterActions,
  sidebar: SidebarActions,
  walletBackup: WalletBackupActions,
  profile: ProfileActions,
  dialogs: DialogsActions,
  notifications: NotificationsActions,
  ada: AdaActionsMap
};

const actionsMap: ActionsMap = {
  router: new RouterActions(),
  sidebar: new SidebarActions(),
  walletBackup: new WalletBackupActions(),
  profile: new ProfileActions(),
  dialogs: new DialogsActions(),
  notifications: new NotificationsActions(),
  ada: adaActionsMap
};

export default actionsMap;
