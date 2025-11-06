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
    firefoxNoSupport: {
      id: 'banners.firefox.noSupport',
      defaultMessage: '!!!Firefox is no longer supporting hardware wallets. Please consider another browser to continue.',
    },
    cardanoCard: {
      id: 'banners.cardanoCard.register',
      defaultMessage:
        '!!!Register here for the upcoming Cardano Card — a next-gen crypto card built to make your digital assets more useful in everyday life.',
    },
    cardanoCardTitle: {
      id: 'banners.cardanoCard.title',
      defaultMessage: '!!!Cardano Card',
    },
    cardanoCardJoin: {
      id: 'banners.cardanoCard.join',
      defaultMessage: '!!!Join the future of finance',
    },
    cardanoCardLearnMore: {
      id: 'banners.cardanoCard.learnMore',
      defaultMessage: '!!!Register Interest',
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
    learnMore: {
      id: 'global.labels.LearnMore',
      defaultMessage: '!!!Learn More',
    },
    importantUpdates: {
      id: 'global.labels.importantUpdates',
      defaultMessage: '!!!Important updates',
    },
    skip: {
      id: 'global.labels.skip',
      defaultMessage: '!!!Skip',
    },
    claimAnnouncementPhase2: {
      id: 'banners.midnight.claimAnnouncementPhase2',
      defaultMessage: '!!!🧩  Phase 2 of midnight claiming is now live - The scavenger mine"',
    },
    midnightDappConnect: {
      id: 'banners.midnight.dappConnect',
      defaultMessage: '!!!Go to the midnight Dapp and connect your Yoroi wallet to start earning NIGHT."',
    },
    goToMidnight: {
      id: 'banners.midnight.goToMidnight',
      defaultMessage: '!!!Go to midnight"',
    },
    surveyTitle: {
      id: 'survey.title',
      defaultMessage: '!!!We’d love your feedback!',
    },
    surveyDescription: {
      id: 'survey,description',
      defaultMessage: '!!!Take our quick survey to help shape the future of Yoroi.',
    },
    surveyButton: {
      id: 'survey.button',
      defaultMessage: '!!!take survey',
    },
    assetReceived: {
      id: 'notification.assetReceived',
      defaultMessage: '!!!{ asset } received',
    },
    assetSent: {
      id: 'notification.assetSent',
      defaultMessage: '!!!{ asset } sent',
    },
    multipleAssetsReceived: {
      id: 'notification.multipleAssetsReceived',
      defaultMessage: '!!!Multiple assets received',
    },
    multipleAssetsSent: {
      id: 'notification.multiplesAssetSent',
      defaultMessage: '!!!Multiple assets sent',
    },
    understandLabel: {
      id: 'global.labels.understand',
      defaultMessage: '!!!I understand',
    },
    firefoxSupportSubtitle: {
      id: 'banners.firefoxSupport.subtitle',
      defaultMessage: '!!!Firefox support ending for updates',
    },
    firefoxSupportDescription: {
      id: 'banners.firefoxSupport.description',
      defaultMessage:
        '!!!We’ve stopped pushing updates to Firefox because hardware wallets aren’t supported. To keep using hardware wallets, open the app in a supported browser.',
    },
    firefoxSupportLearnMore: {
      id: 'banners.firefoxSupport.learnMore',
      defaultMessage: '!!!Learn more about Firefox deprecation',
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
    learnMore: intl.formatMessage(messages.learnMore),
    importantUpdates: intl.formatMessage(messages.importantUpdates),
    skip: intl.formatMessage(messages.skip),
    surveyTitle: intl.formatMessage(messages.surveyTitle),
    surveyDescription: intl.formatMessage(messages.surveyDescription),
    surveyButton: intl.formatMessage(messages.surveyButton),
    cardanoCard: intl.formatMessage(messages.cardanoCard),
    cardanoCardTitle: intl.formatMessage(messages.cardanoCardTitle),
    cardanoCardJoin: intl.formatMessage(messages.cardanoCardJoin),
    cardanoCardLearnMore: intl.formatMessage(messages.cardanoCardLearnMore),
    assetReceived: (asset: string) => intl.formatMessage(messages.assetReceived, { asset }),
    assetSent: (asset: string) => intl.formatMessage(messages.assetSent, { asset }),
    multipleAssetsReceived: intl.formatMessage(messages.multipleAssetsReceived),
    multipleAssetsSent: intl.formatMessage(messages.multipleAssetsSent),
    understandLabel: intl.formatMessage(messages.understandLabel),
    firefoxSupportSubtitle: intl.formatMessage(messages.firefoxSupportSubtitle),
    firefoxSupportDescription: intl.formatMessage(messages.firefoxSupportDescription),
    firefoxSupportLearnMore: intl.formatMessage(messages.firefoxSupportLearnMore),
    firefoxNoSupport: intl.formatMessage(messages.firefoxNoSupport),
    midnightDappConnect: intl.formatMessage(messages.midnightDappConnect),
    goToMidnight: intl.formatMessage(messages.goToMidnight),
    claimAnnouncementPhase2: intl.formatMessage(messages.claimAnnouncementPhase2),
  }).current;
};
