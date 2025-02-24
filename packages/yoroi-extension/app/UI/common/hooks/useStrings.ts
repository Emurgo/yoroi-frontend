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

export const useStrings = (intl) => {
  const { intl: contextIntl } = useIntl();
  const i = intl || contextIntl;

  return React.useRef({
    clickToView: i.formatMessage(messages.clickToView),
    tokensReceived: i.formatMessage(messages.tokensReceived),
    txFailed: i.formatMessage(messages.txFailed),
    tokensSent: i.formatMessage(messages.tokensSent),
    stakingRewardsReceived: i.formatMessage(messages.stakingRewardsReceived),
  }).current;
};
