// @flow
import { Action } from './lib/Action';
import type { Notification } from '../types/notification.types';

// ======= NOTIFICATIONS ACTIONS =======

export default class NotificationsActions {
  open: Action<Notification> = new Action();
  updateDataForActiveNotification: Action<{| data: Object, |}> = new Action();
  closeActiveNotification: Action<{| id: string |}>= new Action();
  resetActiveNotification: Action<void> = new Action();
}
