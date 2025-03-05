import React from 'react';
import { defineMessages } from 'react-intl';
import { useIntl } from '../../../../context/IntlProvider';

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

export const useStrings = (intl = null) => {
  const { intl: contextIntl } = useIntl();

  const i = intl || contextIntl;

  return React.useRef({
    notifSettingsTitle: i.formatMessage(messages.notifSettingsTitle),
    notifSettingsDesc: i.formatMessage(messages.notifSettingsDesc),
  }).current;
};
