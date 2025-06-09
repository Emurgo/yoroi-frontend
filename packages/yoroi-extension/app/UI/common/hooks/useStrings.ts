import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

export const messages = Object.freeze(
  defineMessages({
    clickToView: {
      id: 'notifications.description.clickToView',
      defaultMessage: '!!!Click to view',
    },
    intrwalletTxConfirmed: {
      id: 'notifications.title.intrawallet',
      defaultMessage: '!!!Intrawallet transaction confirmed',
    },
    assetsReceived: {
      id: 'notifications.title.income',
      defaultMessage: '!!!Assets received',
    },
    txFailed: {
      id: 'notifications.title.cancelled',
      defaultMessage: '!!!Transaction failed',
    },
    assetsSent: {
      id: 'notifications.title.outcome',
      defaultMessage: '!!!Assets sent',
    },
    stakingRewardsReceived: {
      id: 'notifications.title.rewards',
      defaultMessage: '!!!Staking rewards received',
    },
    bringBannerButton: {
      id: 'banners.bring.button',
      defaultMessage: '!!!Explore cashback',
    },
    bringBannerTitle: {
      id: 'banners.bring.title',
      defaultMessage: '!!!Earn ADA while you shop 🛍️',
    },
    bringBannerDesc: {
      id: 'banners.bring.desc',
      defaultMessage: '!!!Get rewarded with instant ADA cashback on every fiat purchase - stack up your portfolio effortlessly.',
    },
    usdaBannerTitle: {
      id: 'banners.usda.title',
      defaultMessage: '!!!Swap USDA with Yoroi',
    },
    usdaBannerDesc: {
      id: 'banners.usda.desc',
      defaultMessage: "!!!Swap USDA effortlessly within Yoroi and enjoy the power of Cardano's first native stablecoin.",
    },
    usdaBannerButton: {
      id: 'banners.usda.button',
      defaultMessage: '!!!Go to swap',
    },
    receiverFieldLabelUnresolvedAddress: {
      id: 'wallet.send.form.receiver.label.unresolvedAddress',
      defaultMessage: "!!!Receiver address, ADA Handle or domain you entered doesn't exist. Please double-check it and try again",
    },
    receiverFieldLabelForbiddenAccess: {
      id: 'wallet.send.form.receiver.label.forbiddenAccess',
      defaultMessage: '!!!access forbidden, you might need a VPN',
    },
    receiverFieldLabelUnexpectedError: {
      id: 'wallet.send.form.receiver.label.unexpectedError',
      defaultMessage: '!!!unexpected error',
    },
    adaHandle: {
      id: 'global.label.adaHandle',
      defaultMessage: '!!!ADA Handle',
    },
    cardanoCNS: {
      id: 'global.label.CardanoCNS',
      defaultMessage: '!!!Cardano Name Service (CNS)',
    },
    unstoppableDomains: {
      id: 'global.label.unstoppableDomains',
      defaultMessage: '!!!Unstoppable Domains',
    },
    transactionReview: {
      id: 'transaction.review.transactionReview',
      defaultMessage: '!!!Transaction Review',
    },
  })
);

export const useStrings = () => {
  const intl = useIntl();

  return React.useRef({
    clickToView: intl.formatMessage(messages.clickToView),
    intrawalletTxConfirmed: intl.formatMessage(messages.intrwalletTxConfirmed),
    assetsReceived: intl.formatMessage(messages.assetsReceived),
    txFailed: intl.formatMessage(messages.txFailed),
    assetsSent: intl.formatMessage(messages.assetsSent),
    stakingRewardsReceived: intl.formatMessage(messages.stakingRewardsReceived),
    bringBannerButton: intl.formatMessage(messages.bringBannerButton),
    bringBannerTitle: intl.formatMessage(messages.bringBannerTitle),
    bringBannerDesc: intl.formatMessage(messages.bringBannerDesc),
    usdaBannerTitle: intl.formatMessage(messages.usdaBannerTitle),
    usdaBannerDesc: intl.formatMessage(messages.usdaBannerDesc),
    usdaBannerButton: intl.formatMessage(messages.usdaBannerButton),
    receiverFieldLabelUnresolvedAddress: intl.formatMessage(messages.receiverFieldLabelUnresolvedAddress),
    receiverFieldLabelForbiddenAccess: intl.formatMessage(messages.receiverFieldLabelForbiddenAccess),
    receiverFieldLabelUnexpectedError: intl.formatMessage(messages.receiverFieldLabelUnexpectedError),
    adaHandle: intl.formatMessage(messages.adaHandle),
    cardanoCNS: intl.formatMessage(messages.cardanoCNS),
    unstoppableDomains: intl.formatMessage(messages.unstoppableDomains),
    transactionReview: intl.formatMessage(messages.transactionReview),
  }).current;
};
