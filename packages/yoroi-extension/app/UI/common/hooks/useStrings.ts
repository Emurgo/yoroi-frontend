import React from 'react';
import { defineMessages } from 'react-intl';
import { useIntl } from '../../context/IntlProvider';

export const messages = Object.freeze(
  defineMessages({
    clickToView: {
      id: 'notifications.description.clickToView',
      defaultMessage: 'Click to view',
    },
  })
);

export const useStrings = () => {
  const { intl } = useIntl();
  return React.useRef({
    clickToView: intl.formatMessage(messages.clickToView),
  }).current;
};
