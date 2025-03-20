import React from 'react';
import { defineMessages } from 'react-intl';
import { useIntl } from '../../context/IntlProvider';

export const messages = Object.freeze(
  defineMessages({
    clickToView: {
      id: 'notifications.description.clickToView',
      defaultMessage: '!!!Click to view',
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
  })
);

export const useStrings = () => {
  const { intl } = useIntl();

  return React.useRef({
    clickToView: intl.formatMessage(messages.clickToView),
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
  }).current;
};
