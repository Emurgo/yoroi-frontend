import React from 'react';
import { defineMessages } from 'react-intl';
import { useIntl } from '../../../../context/IntlProvider';

export const messages = Object.freeze(
  defineMessages({
    assetSwapLabel: {
      id: 'swap.menu.swap',
      defaultMessage: '!!!Asset swap',
    },
    orderSwapLabel: {
      id: 'swap.menu.orders',
      defaultMessage: '!!!Orders',
    },
    limitTabLabel: {
      id: 'swap.actions.limitTabLabel',
      defaultMessage: '!!!Limit',
    },
    marketTabLabel: {
      id: 'swap.actions.marketTabLabel',
      defaultMessage: '!!!Market',
    },
  })
);

export const useStrings = () => {
  const { intl } = useIntl();
  return React.useRef({
    assetSwapLabel: intl.formatMessage(messages.assetSwapLabel),
    orderSwapLabel: intl.formatMessage(messages.orderSwapLabel),
    limitTabLabel: intl.formatMessage(messages.limitTabLabel),
    marketTabLabel: intl.formatMessage(messages.marketTabLabel),
  }).current;
};
