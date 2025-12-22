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
    stakePoolDelegated: {
      id: 'wallet.dashboard.upcomingRewards.stakePoolDelegated',
      defaultMessage: '!!!Stake Pool Delegated',
    },
    roa30dLabel: {
      id: 'wallet.staking.banner.roa30d',
      defaultMessage: '!!!ROA 30d',
    },
    poolSizeLabel: {
      id: 'wallet.staking.pool.size',
      defaultMessage: '!!!Pool size',
    },
    poolSaturation: {
      id: 'wallet.staking.pool.saturation',
      defaultMessage: '!!!Saturation',
    },
    updatePoolLabel: {
      id: 'global.updatePool',
      defaultMessage: '!!!  UPDATE POOL',
    },
    undelegatePool: {
      id: 'transaction.review.undelegatePool',
      defaultMessage: '!!!Unstake entire wallet balance from',
    },
    undelegateLabel: {
      id: 'global.labael.undelegate',
      defaultMessage: '!!!Undelegate',
    },
    deregisteringStakingKey: {
      id: 'transaction.review.deregisteringStakingKey',
      defaultMessage: '!!!Undelegating from the pool',
    },
    epochProgress: {
      id: 'wallet.staking.epochProgress',
      defaultMessage: '!!!Epoch Progress',
    },
    welcomeMessage: {
      id: 'wallet.emptyWalletMessage',
      defaultMessage: '!!!Your wallet is empty',
    },
    welcomeMessageSubtitle: {
      id: 'wallet.emptyWalletMessageSubtitle',
      defaultMessage: '!!!Top up your wallet safely using our trusted partners',
    },
    welcomeMessageTestnet: {
      id: 'wallet.emptyWalletMessage.testnet',
      defaultMessage: '!!!Learn Cardano with test ADA ⭐',
    },
    welcomeMessageSubtitleTestnet: {
      id: 'wallet.emptyWalletMessageSubtitle.testnet',
      defaultMessage: '!!!Stake your test ADA by participating in our testnet staking program.',
    },
    welcomeMessageSubtitleTestnetExtra: {
      id: 'wallet.emptyWalletMessageSubtitle.testnetExtra',
      defaultMessage: "!!!Get your TADA. It's your key to testing a new world of possibilities.",
    },
    goToFaucetButton: {
      id: 'wallet.emptyWalletMessage.goToFaucet',
      defaultMessage: '!!!ADD TEST ADA',
    },
    buyAda: {
      id: 'button.buyAda',
      defaultMessage: '!!!Buy ADA',
    },
    stakePoolLabel: {
      id: 'wallet.delegation.transaction.stakePoolLabel',
      defaultMessage: '!!!Stake pool',
    },
    participationInGovernance: {
      id: 'staking.dialog.participationInGovernance',
      defaultMessage: '!!!Participation in governance is required to withdraw',
    },
    participationInfo: {
      id: 'staking.dialog.participationInfo',
      defaultMessage:
        '!!!Participating in governance is required to withdraw rewards on Cardano. First, delegate your ADA in the governance center. Once your delegation is confirmed, you will then be able to withdraw your rewards.',
    },
    goToGovernance: {
      id: 'staking.dialog.goToGovernance',
      defaultMessage: '!!!Go to governance center',
    },
    governanceRequired: {
      id: 'staking.dialog.governanceRequired',
      defaultMessage: '!!Governance Required for Rewards',
    },
    toReceiveRewards: {
      id: 'staking.dialog.toReceiveRewards',
      defaultMessage:
        '!!To receive rewards from your stake delegation, you must also delegate your voting power. Save time and fees by delegating to our Yoroi DRep now, alongside your stake pool delegation.',
    },
    delegateToYoroiDRep: {
      id: 'staking.dialog.delegateToYoroiDRep',
      defaultMessage: '!!Delegate to Yoroi DRep',
    },
    delegateStakeOnly: {
      id: 'staking.dialog.delegateStakeOnly',
      defaultMessage: '!!Delegate stake only',
    },
    participationInGovUndelegate: {
      id: 'staking.dialog.participationInGovUndelegate',
      defaultMessage: '!!Participation in governance is required to undelegate',
    },
    undelegateInfo: {
      id: 'staking.dialog.undelegateInfo',
      defaultMessage:
        '!!Undelegating causes any pending staking  rewards to be withdrawn and participating in governance is required to withdraw rewards on Cardano. First, delegate your ADA in the governance center. Once your delegation is confirmed, you will then be able to undelegate.',
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
    stakePoolDelegated: intl.formatMessage(messages.stakePoolDelegated),
    roa30dLabel: intl.formatMessage(messages.roa30dLabel),
    poolSizeLabel: intl.formatMessage(messages.poolSizeLabel),
    poolSaturation: intl.formatMessage(messages.poolSaturation),
    updatePoolLabel: intl.formatMessage(messages.updatePoolLabel),
    undelegatePool: intl.formatMessage(messages.undelegatePool),
    undelegateLabel: intl.formatMessage(messages.undelegateLabel),
    deregisteringStakingKey: intl.formatMessage(messages.deregisteringStakingKey),
    epochProgress: intl.formatMessage(messages.epochProgress),
    welcomeMessage: intl.formatMessage(messages.welcomeMessage),
    welcomeMessageSubtitle: intl.formatMessage(messages.welcomeMessageSubtitle),
    welcomeMessageTestnet: intl.formatMessage(messages.welcomeMessageTestnet),
    welcomeMessageSubtitleTestnet: intl.formatMessage(messages.welcomeMessageSubtitleTestnet),
    welcomeMessageSubtitleTestnetExtra: intl.formatMessage(messages.welcomeMessageSubtitleTestnetExtra),
    goToFaucetButton: intl.formatMessage(messages.goToFaucetButton),
    buyAda: intl.formatMessage(messages.buyAda),
    stakePoolLabel: intl.formatMessage(messages.stakePoolLabel),
    participationInGovernance: intl.formatMessage(messages.participationInGovernance),
    participationInfo: intl.formatMessage(messages.participationInfo),
    goToGovernance: intl.formatMessage(messages.goToGovernance),
    governanceRequired: intl.formatMessage(messages.governanceRequired),
    toReceiveRewards: intl.formatMessage(messages.toReceiveRewards),
    delegateToYoroiDRep: intl.formatMessage(messages.delegateToYoroiDRep),
    delegateStakeOnly: intl.formatMessage(messages.delegateStakeOnly),
    participationInGovUndelegate: intl.formatMessage(messages.participationInGovUndelegate),
    undelegateInfo: intl.formatMessage(messages.undelegateInfo),
  }).current;
};
