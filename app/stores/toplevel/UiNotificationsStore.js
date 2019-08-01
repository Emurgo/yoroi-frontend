// @flow
import { observable, action, computed } from 'mobx';
import Store from '../base/Store';
import type { Notification } from '../../types/notificationType';

/** Manage a list on ongoing notifications and closes them when they expire */
export default class UiNotificationsStore extends Store {

  @observable activeNotifications: Array<Notification> = [];

  @computed get mostRecentActiveNotification(): ?Notification {
    return this.activeNotifications.length > 0 ?
      this.activeNotifications[this.activeNotifications.length - 1] :
      null;
  }

  setup() {
    this.actions.notifications.open.listen(this._onOpen);
    this.actions.notifications.closeActiveNotification.listen(this._onClose);
  }

  isOpen = (id: string): boolean => !!this._findNotificationById(id);

  getTooltipActiveNotification = (tooltipNotificationId : string): ?Notification => {
    let notification = null;
    const activeNotificationId = this.mostRecentActiveNotification ?
      this.mostRecentActiveNotification.id :
      '';
    if (activeNotificationId === tooltipNotificationId) {
      notification = this.mostRecentActiveNotification;
    }
    return notification;
  }

  _findNotificationById = (id: string): ?Notification => (
    this.activeNotifications.find(notification => notification.id === id)
  );

  @action _onOpen = ({ id, message, duration }: Notification) => {
    const notification: Notification = {
      id,
      message,
      duration: duration || null,
      secondsTimerInterval: duration ? setInterval(this._updateSeconds, 1000, id) : null,
    };

    if (this.isOpen(id)) {
      // if notification is currently active close and reopen it
      this._onClose({ id });
      setTimeout(() => this._set(notification), 200);
    } else {
      this._set(notification);
    }
  };

  @action _set = (notification: Notification) => {
    this.activeNotifications.push(notification);
  };

  @action _onClose = ({ id } : { id: string }) => {
    const notification = this._findNotificationById(id);
    if (notification) {
      if (notification.secondsTimerInterval) clearInterval(notification.secondsTimerInterval);
      const indexOfNotification = this.activeNotifications.indexOf(notification);
      this.activeNotifications.splice(indexOfNotification, 1);
    }
  };

  @action _updateSeconds = (id: string) => {
    const notification = this._findNotificationById(id);
    if (notification && notification.duration) {
      notification.duration -= 1;
      if (notification.duration === 0) this._onClose({ id });
    }
  };
}
