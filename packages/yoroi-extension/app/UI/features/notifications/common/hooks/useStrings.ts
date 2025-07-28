import React from 'react';
import { defineMessages } from 'react-intl';
import { useIntl } from 'react-intl';

export const messages = Object.freeze(
  defineMessages({
    notifSettingsTitle: {
      id: 'notifications.settings.title',
      defaultMessage: '!!!In-app notifications',
    },
    notifSettingsDesc: {
      id: 'notifications.settings.description',
      defaultMessage:
        '!!!Allow display of in-app notifications for key transactions',
    },
    duration: {
      id: 'notifications.settings.duration',
      defaultMessage: '!!!Duration',
    },
    durationDescription: {
      id: 'notifications.settings.durationDescription',
      defaultMessage: '!!!Display during {duration} seconds',
    },
    enablePushNotificationsTitle: {
      id: 'notifications.settings.enablePushNotificationsTitle',
      defaultMessage: '!!!Push notifications',
    },
    enablePushNotificationsDesc: {
      id: 'notifications.settings.enablePushNotificationsDesc',
      defaultMessage: '!!!Allow push notifications',
    },
    notificationCenterTitle: {
      id: 'notifications.center.title',
      defaultMessage: '!!!notifications',
    },
    readAll: {
      id: 'notifications.center.markAllAsRead',
      defaultMessage: '!!!mark all as read',
    },
    noNotification: {
      id: 'notifications.center.noNotification',
      defaultMessage: '!!!No notification yet',
    },
  })
);

export const useStrings = () => {
  const intl = useIntl();

  return React.useRef({
    notifSettingsTitle: intl.formatMessage(messages.notifSettingsTitle),
    notifSettingsDesc: intl.formatMessage(messages.notifSettingsDesc),
    duration: intl.formatMessage(messages.duration),
    durationDescription: (duration: number) => intl.formatMessage(messages.durationDescription, { duration }),
    enablePushNotificationsTitle: intl.formatMessage(messages.enablePushNotificationsTitle),
    enablePushNotificationsDesc: intl.formatMessage(messages.enablePushNotificationsDesc),
    notificationCenterTitle: intl.formatMessage(messages.notificationCenterTitle),
    readAll: intl.formatMessage(messages.readAll),
    noNotification: intl.formatMessage(messages.noNotification),
  }).current;
};
