// @flow
import { observable, action, computed } from 'mobx';
import Store from '../base/Store';
import type { Notification } from '../../types/notification.types';
import NotificationsActions from '../../actions/notifications-actions';

/** Manage a list on ongoing notifications and closes them when they expire */
export default class UiNotificationsStore<
  TStores,
  TActions: { notifications: NotificationsActions, ... },
> extends Store<TStores, TActions>
{

  @observable activeNotifications: Array<Notification> = [];

  @computed get mostRecentActiveNotification(): ?Notification {
    return this.activeNotifications.length > 0 ?
      this.activeNotifications[this.activeNotifications.length - 1] :
      null;
  }

  setup(): void {
    super.setup();
    this.actions.notifications.open.listen(this._onOpen);
    this.actions.notifications.closeActiveNotification.listen(this._onClose);
  }

  isOpen: string => boolean = (
    id: string
  ): boolean => !!this._findNotificationById(id);

  getTooltipActiveNotification: string => ?Notification = (
    tooltipNotificationId : string
  ): ?Notification => {
    let notification = null;
    const activeNotificationId = this.mostRecentActiveNotification ?
      this.mostRecentActiveNotification.id :
      '';
    if (activeNotificationId === tooltipNotificationId) {
      notification = this.mostRecentActiveNotification;
    }
    return notification;
  }

  _findNotificationById: string => ?Notification = (id) => (
    this.activeNotifications.find(notification => notification.id === id)
  );

  @action _onOpen: Notification => void = (newNotification) => {
    const notification: Notification = {
      ...newNotification,
      secondsTimerInterval: newNotification.duration != null
        ? setInterval(this._updateSeconds, 1000, newNotification.id)
        : null,
    };

    if (this.isOpen(notification.id)) {
      // if notification is currently active close and reopen it
      this._onClose({ id: notification.id });
      setTimeout(() => this._set(notification), 200);
    } else {
      this._set(notification);
    }
  };

  @action _set: Notification => void = (notification) => {
    this.activeNotifications.push(notification);
  };

  @action _onClose: {| id: string |} => void = ({ id }) => {
    const notification = this._findNotificationById(id);
    if (notification) {
      if (notification.secondsTimerInterval) clearInterval(notification.secondsTimerInterval);
      const indexOfNotification = this.activeNotifications.indexOf(notification);
      this.activeNotifications.splice(indexOfNotification, 1);
    }
  };

  @action _updateSeconds: string => void = (id) => {
    const notification = this._findNotificationById(id);
    if (notification && notification.duration != null) {
      notification.duration -= 1;
      if (notification.duration === 0) this._onClose({ id });
    }
  };
}
