import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

export const messages = Object.freeze(
  defineMessages({
    rewardsSummary: {
      id: 'wallet.staking.summary',
      defaultMessage: '!!!Rewards Summary',
    },
    dialogSummaryDescription: {
      id: 'wallet.staking.dialogSummaryDescription',
      defaultMessage:
        '!!!Your rewards are automatically staked. You don’t need to withdraw it everytime because you pay a transaction fee.',
    },
    withdrawLabel: {
      id: 'wallet.transaction.withdraw',
      defaultMessage: '!!!Withdraw',
    },
    totalRewardsLabel: {
      id: 'wallet.dashboard.summary.rewardsTitle',
      defaultMessage: '!!!Total Rewards',
    },
    totalDelegated: {
      id: 'wallet.dashboard.summary.totalDelegated',
      defaultMessage: '!!!Total Delegated',
    },
    rewardHistoryLabel: {
      id: 'wallet.staking.rewards.rewardHistory',
      defaultMessage: '!!!Reward History',
    },
    epochLabel: {
      id: 'global.labels.epoch',
      defaultMessage: '!!!Epoch',
    },
    stakepoolNameLabel: {
      id: 'global.labels.stakepool',
      defaultMessage: '!!!Stakepool Name',
    },
    rewardValue: {
      id: 'wallet.staking.rewards.rewardValue',
      defaultMessage: '!!!Reward value',
    },
    rewardsLabel: {
      id: 'global.labels.rewardsLabel',
      defaultMessage: '!!!Rewards',
    },
    errorLabel: {
      id: 'global.labels.error',
      defaultMessage: '!!!Error',
    },
  })
);

export const useStrings = () => {
  const intl = useIntl();
  return React.useRef({
    rewardsSummary: intl.formatMessage(messages.rewardsSummary),
    dialogSummaryDescription: intl.formatMessage(messages.dialogSummaryDescription),
    withdrawLabel: intl.formatMessage(messages.withdrawLabel),
    totalRewardsLabel: intl.formatMessage(messages.totalRewardsLabel),
    totalDelegated: intl.formatMessage(messages.totalDelegated),
    rewardHistoryLabel: intl.formatMessage(messages.rewardHistoryLabel),
    epochLabel: intl.formatMessage(messages.epochLabel),
    stakepoolNameLabel: intl.formatMessage(messages.stakepoolNameLabel),
    rewardValue: intl.formatMessage(messages.rewardValue),
    rewardsLabel: intl.formatMessage(messages.rewardsLabel),
    errorLabel: intl.formatMessage(messages.errorLabel),
  }).current;
};
