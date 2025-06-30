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
  })
);

export const useStrings = () => {
  const intl = useIntl();

  return React.useRef({
    notifSettingsTitle: intl.formatMessage(messages.notifSettingsTitle),
    notifSettingsDesc: intl.formatMessage(messages.notifSettingsDesc),
  }).current;
};
