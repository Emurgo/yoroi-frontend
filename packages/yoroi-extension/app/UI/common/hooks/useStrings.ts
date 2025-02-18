import React from 'react';
import { defineMessages } from 'react-intl';
import { useIntl } from '../../context/IntlProvider';

export const messages = Object.freeze(
  defineMessages({
    clickToView: {
      id: 'notifications.description.clickToView',
      defaultMessage: '!!!Click to view',
    },
    tokensReceived: {
      id: 'notifications.title.income',
      defaultMessage: '!!!Tokens received',
    },
    txFailed: {
      id: 'notifications.title.cancelled',
      defaultMessage: '!!!Transaction failed',
    },
    tokensSent: {
      id: 'notifications.title.outcome',
      defaultMessage: '!!!Tokens sent',
    },
    stakingRewardsReceived: {
      id: 'notifications.title.rewards',
      defaultMessage: '!!!Staking rewards received',
    },
  })
);

export const useStrings = () => {
  const { intl } = useIntl();

  return React.useRef({
    clickToView: intl.formatMessage(messages.clickToView),
    tokensReceived: intl.formatMessage(messages.tokensReceived),
    txFailed: intl.formatMessage(messages.txFailed),
    tokensSent: intl.formatMessage(messages.tokensSent),
    stakingRewardsReceived: intl.formatMessage(messages.stakingRewardsReceived),
  }).current;
};
