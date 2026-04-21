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
      defaultMessage: '!!!🧩  Phase 2 of midnight claiming is now live - The scavenger mine',
    },
    midnightDappConnect: {
      id: 'banners.midnight.dappConnect',
      defaultMessage: '!!!Go to the midnight Dapp and connect your Yoroi wallet to start earning <strong>NIGHT</strong>.',
    },
    goToMidnight: {
      id: 'banners.midnight.goToMidnight',
      defaultMessage: '!!!Go to midnight',
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
    stakingUpdates: {
      id: 'staking.dialog.stakingUpdates',
      defaultMessage: '!!!Staking updates',
    },
    upcomingUpdate: {
      id: 'staking.dialog.upcomingUpdate',
      defaultMessage: '!!!Upcoming update to EMURGO and Yoroi stakepools',
    },
    updateDetails: {
      id: 'staking.dialog.updateDetails',
      defaultMessage: '!!!EMURGO is updating the margin fee on its stakepools as a part of a broader 2026 modernization effort.',
    },
    earnRewards: {
      id: 'banners.rewards.earn',
      defaultMessage: '!!! Earn Rewards with Yoroi',
    },
    delegateRewards: {
      id: 'banners.rewards.delegate',
      defaultMessage:
        '!!! Delegate your ADA to our stake pool and DRep in one step. Support Cardano governance, strengthen the network, and earn rewards along the way.',
    },
    rewardsButton: {
      id: 'banners.rewards.button',
      defaultMessage: '!!! Earn ADA',
    },
    cardanoCard: {
      id: 'banners.cardanoCard.desc',
      defaultMessage: '!!!Pay. Earn. Borrow. Stake. Access the new era of crypto spending. Activate your Cardano Card today.',
    },
    cardanoCardTitle: {
      id: 'banners.cardanoCard.title',
      defaultMessage: '!!!Cardano Card',
    },
    cardanoCardSubtitle: {
      id: 'banners.cardanoCard.subtitle',
      defaultMessage: '!!!Cardano Card Has Arrived',
    },
    cardanoCardGetTheCard: {
      id: 'banners.cardanoCard.getTheCard',
      defaultMessage: '!!!Get the card',
    },
    secondFiPage1Title: {
      id: 'secondfi.teasing.page1.title',
      defaultMessage: '!!!Yoroi is reaching further.',
    },
    secondFiPage1Description: {
      id: 'secondfi.teasing.page1.description',
      defaultMessage: '!!!More chains, more of your financial life, all in one place.',
    },
    secondFiPage2Title: {
      id: 'secondfi.teasing.page2.title',
      defaultMessage: "!!!Soon, you'll have more options to grow.",
    },
    secondFiPage2Description: {
      id: 'secondfi.teasing.page2.description',
      defaultMessage: '!!!Your assets will be ready to get to work more, for you.',
    },
    secondFiPage3Title: {
      id: 'secondfi.teasing.page3.title',
      defaultMessage: '!!!Your wallet in real life.',
    },
    secondFiPage3Description: {
      id: 'secondfi.teasing.page3.description',
      defaultMessage: '!!!Some upgrades you download. This one, you carry.',
    },
    secondFiPage4Title: {
      id: 'secondfi.teasing.page4.title',
      defaultMessage: '!!!Your Yoroi wallet is getting bigger.',
    },
    secondFiPage4Description: {
      id: 'secondfi.teasing.page4.description',
      defaultMessage: '!!!Think neofinance that belongs entirely to you.',
    },
    secondFiNext: {
      id: 'secondfi.teasing.next',
      defaultMessage: '!!!Next',
    },
    secondFiClose: {
      id: 'secondfi.teasing.close',
      defaultMessage: '!!!Close',
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
    assetReceived: (asset: string) => intl.formatMessage(messages.assetReceived, { asset }),
    assetSent: (asset: string) => intl.formatMessage(messages.assetSent, { asset }),
    multipleAssetsReceived: intl.formatMessage(messages.multipleAssetsReceived),
    multipleAssetsSent: intl.formatMessage(messages.multipleAssetsSent),
    understandLabel: intl.formatMessage(messages.understandLabel),
    midnightDappConnect: intl.formatMessage(messages.midnightDappConnect, {
      strong: chunks => React.createElement('strong', null, chunks),
    }),
    goToMidnight: intl.formatMessage(messages.goToMidnight),
    claimAnnouncementPhase2: intl.formatMessage(messages.claimAnnouncementPhase2),
    stakingUpdates: intl.formatMessage(messages.stakingUpdates),
    upcomingUpdate: intl.formatMessage(messages.upcomingUpdate),
    updateDetails: intl.formatMessage(messages.updateDetails),
    earnRewards: intl.formatMessage(messages.earnRewards),
    delegateRewards: intl.formatMessage(messages.delegateRewards),
    rewardsButton: intl.formatMessage(messages.rewardsButton),
    cardanoCard: intl.formatMessage(messages.cardanoCard),
    cardanoCardTitle: intl.formatMessage(messages.cardanoCardTitle),
    cardanoCardSubtitle: intl.formatMessage(messages.cardanoCardSubtitle),
    cardanoCardGetTheCard: intl.formatMessage(messages.cardanoCardGetTheCard),
    secondFiPage1Title: intl.formatMessage(messages.secondFiPage1Title),
    secondFiPage1Description: intl.formatMessage(messages.secondFiPage1Description),
    secondFiPage2Title: intl.formatMessage(messages.secondFiPage2Title),
    secondFiPage2Description: intl.formatMessage(messages.secondFiPage2Description),
    secondFiPage3Title: intl.formatMessage(messages.secondFiPage3Title),
    secondFiPage3Description: intl.formatMessage(messages.secondFiPage3Description),
    secondFiPage4Title: intl.formatMessage(messages.secondFiPage4Title),
    secondFiPage4Description: intl.formatMessage(messages.secondFiPage4Description),
    secondFiNext: intl.formatMessage(messages.secondFiNext),
    secondFiClose: intl.formatMessage(messages.secondFiClose),
  }).current;
};
