import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

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
    routeLabel: {
      id: 'global.labels.route',
      defaultMessage: '!!!Route',
    },
    routeTvl: {
      id: 'global.labels.tvl',
      defaultMessage: '!!!TVL',
    },
    routePath: {
      id: 'swap.routePath',
      defaultMessage: '!!!Chosen path using Dexs and Pools for your swap to go through.',
    },
    priceLabel: {
      id: 'portfolio.statsTable.header.price',
      defaultMessage: '!!!Price',
    },
    feesIncluded: {
      id: 'swap.feesIncluded',
      defaultMessage: '!!!Fees included:',
    },
    feesLabel: {
      id: 'swap.fees',
      defaultMessage: '!!!Fees:',
    },
    dexFee: {
      id: 'swap.dexFee',
      defaultMessage: '!!!• DEX fee',
    },
    frontendFee: {
      id: 'swap.frontendFee',
      defaultMessage: '!!!• Frontend fee',
    },
    lpFee: {
      id: 'swap.lpFee',
      defaultMessage: '!!!Liquidity provider fee',
    },
    minReceived: {
      id: 'swap.minReceived',
      defaultMessage: '!!!Min received',
    },
    guaranteedMin: {
      id: 'swap.guaranteedMin',
      defaultMessage: '!!!Guaranteed minimum amount based on current liquidity and market conditions.',
    },
    slippage: {
      id: 'swap.slippage',
      defaultMessage: '!!!Slippage',
    },
    swapToLabel: {
      id: 'swap.swapToLabel',
      defaultMessage: '!!!Swap to',
    },
    slippageInfo: {
      id: 'swap.slippageInfo',
      defaultMessage:
        '!!!Maximum allowed difference between expected and final price. Higher slippage improves success but may result in worse rates.',
    },
    numYourAssets: {
      id: 'swap.numYourAssets',
      defaultMessage: '!!!Your assets {num}',
    },
    slippageTolerance: {
      id: 'swap.actions.slippageTolerance',
      defaultMessage: '!!!Slippage tolerance',
    },
    manualLabel: {
      id: 'swap.manual',
      defaultMessage: '!!!Manual',
    },
    routingPreference: {
      id: 'swap.routingPreference',
      defaultMessage: '!!!Routing preference',
    },
    autoLabel: {
      id: 'swap.auto',
      defaultMessage: '!!!Auto',
    },
    slippageInputInfo: {
      id: 'swap.slippageInputInfo',
      defaultMessage: '!!!Enter a value from 0% to 75%. You can also enter up to 1 decimal',
    },
    slippageToleranceHigh: {
      id: 'swap.actions.slippageToleranceHigh',
      defaultMessage:
        '!!!When the slippage tolerance is set really high, it allows the transaction to still complete despite large price swings. This can open the door to front-running and sandwich attacks.',
    },
    swapLabel: {
      id: 'swap.swapLabel',
      defaultMessage: '!!!Swap',
    },
    buyAt: {
      id: 'swap.buyAt',
      defaultMessage: '!!!Buy At',
    },
    selectRoute: {
      id: 'swap.selectRoute',
      defaultMessage: '!!!Select Route',
    },
    placeOrder: {
      id: 'swap.placeOrder',
      defaultMessage: '!!!Place Order',
    },
    allAssets: {
      id: 'swap.allAssets',
      defaultMessage: '!!!All assets',
    },
    applyLabel: {
      id: 'global.labels.apply',
      defaultMessage: '!!!Apply',
    },
    ordersPair: {
      id: 'swap.ordersPair',
      defaultMessage: '!!!Pair (From / To)',
    },
    assetPrice: {
      id: 'swap.assetPrice',
      defaultMessage: '!!!Asset price',
    },
    assetAmount: {
      id: 'swap.assetAmount',
      defaultMessage: '!!!Asset amount',
    },
    total: {
      id: 'swap.total',
      defaultMessage: '!!!Total',
    },
    timeExecuted: {
      id: 'swap.timeExecuted',
      defaultMessage: '!!!Time executed',
    },
    timeCreated: {
      id: 'swap.timeCreated',
      defaultMessage: '!!!Time created',
    },
    txId: {
      id: 'swap.txId',
      defaultMessage: '!!!Transaction ID',
    },
    ordersCompletedLabel: {
      id: 'swap.ordersCompletedLabel',
      defaultMessage: '!!!Completed orders',
    },
    openOrdersLabel: {
      id: 'swap.openOrdersLabel',
      defaultMessage: '!!!Open orders',
    },
    cancel: {
      id: 'global.labels.cancel',
      defaultMessage: '!!!Cancel',
    },
    noOrdersCompleted: {
      id: 'swap.noOrdersCompleted',
      defaultMessage: '!!!No orders completed yet',
    },
    noOrdersAvailable: {
      id: 'swap.noOrdersAvailable',
      defaultMessage: '!!!No orders available yet',
    },
    startDoingSwaps: {
      id: 'swap.startDoingSwaps',
      defaultMessage: '!!!Start doing the swap operations to see your open orders here',
    },
    selectToken: {
      id: 'swap.selectToken',
      defaultMessage: '!!!Select token',
    },
    buyAndSellToken: {
      id: 'swap.buyAndSellToken',
      defaultMessage: '!!!Buy and sell tokens must be different',
    },
    notEnoughBalance: {
      id: 'buysell.dialog.error.not.enough',
      defaultMessage: '!!!Not enough balance',
    },
    disclaimerTitle: {
      id: 'buySell.disclaimer.title',
      defaultMessage: '!!!Disclaimer',
    },
    disclaimerDescription: {
      id: 'buySell.disclaimer.description',
      defaultMessage:
        '!!!By clicking "Proceed," you acknowledge that you will be redirected to a third-party service provider offering Web3 on-and-off ramp solutions for fiat-to-ADA exchanges. You may be required to agree to the terms, conditions, and privacy policies of the third-party provider to complete the transaction. Yoroi Wallet does not control, endorse, or assume responsibility for the content, security, policies, or services provided by the third party.',
    },
    disclaimerPleaseNote: {
      id: 'buySell.disclaimer.pleaseNote',
      defaultMessage: '!!!Please note:',
    },
    disclaimerNote1: {
      id: 'buySell.disclaimer.note1',
      defaultMessage:
        '!!!Yoroi Wallet is not liable for any losses, delays, or errors that may occur while using the third-party service.',
    },
    disclaimerNote2: {
      id: 'buySell.disclaimer.note2',
      defaultMessage:
        "!!!Transactions may be subject to restrictions based on your geographic location, applicable laws, financial institution policies, or the service provider's limitations.",
    },
    disclaimerNote3: {
      id: 'buySell.disclaimer.note3',
      defaultMessage:
        "!!!Ensure you review and understand the third party's terms, as your interactions are solely governed by their agreements.",
    },
    disclaimerNote4: {
      id: 'buySell.disclaimer.note4',
      defaultMessage:
        '!!!Yoroi Wallet does not collect or store any personal or financial data submitted through the third-party platform.',
    },
    disclaimerCheckboxLabel: {
      id: 'swap.swapDisclamerCheckbox',
      defaultMessage: '!!!I understand this disclaimer',
    },
    disclaimerProceed: {
      id: 'buySell.actions.proceed',
      defaultMessage: '!!!Proceed',
    },
    priceImpact: {
      id: 'swap.priceImpact',
      defaultMessage: '!!!Price impact',
    },
    priceImpactSevere: {
      id: 'swap.priceImpactSevere',
      defaultMessage:
        '!!!<strong>Price impact over 10%</strong> may cause a significant loss of funds. Please bear this in mind and proceed with an extra caution.',
    },
    priceImpactModerate: {
      id: 'swap.priceImpactNotSevere',
      defaultMessage:
        '!!!<strong>Price impact over 1%</strong> may cause a difference in the amount you actually receive. Consider this at your own risk.',
    },
    swapFromLabel: {
      id: 'swap.swapFromLabel',
      defaultMessage: '!!!Swap from',
    },
    swapDetails: {
      id: 'swap.swapDetails',
      defaultMessage: '!!!Swap details',
    },
    back: {
      id: 'global.labels.back',
      defaultMessage: '!!!Back',
    },
    confirm: {
      id: 'global.labels.confirm',
      defaultMessage: '!!!Confirm',
    },
    assetDetails: {
      id: 'swap.assetDetails',
      defaultMessage: '!!!Asset details',
    },
    overviewLabel: {
      id: 'portfolio.tokenInfo.menuLabel.overview',
      defaultMessage: '!!!Overview',
    },
    detailsOn: {
      id: 'wallet.assets.detailsOn',
      defaultMessage: '!!!Details on',
    },
  })
);

export const useStrings = () => {
  const intl = useIntl();
  return React.useRef({
    assetSwapLabel: intl.formatMessage(messages.assetSwapLabel),
    orderSwapLabel: intl.formatMessage(messages.orderSwapLabel),
    limitTabLabel: intl.formatMessage(messages.limitTabLabel),
    marketTabLabel: intl.formatMessage(messages.marketTabLabel),
    routeLabel: intl.formatMessage(messages.routeLabel),
    routeTvl: intl.formatMessage(messages.routeTvl),
    priceLabel: intl.formatMessage(messages.priceLabel),
    routePath: intl.formatMessage(messages.routePath),
    dexFee: intl.formatMessage(messages.dexFee),
    feesIncluded: intl.formatMessage(messages.feesIncluded),
    feesLabel: intl.formatMessage(messages.feesLabel),
    frontendFee: intl.formatMessage(messages.frontendFee),
    lpFee: intl.formatMessage(messages.lpFee),
    minReceived: intl.formatMessage(messages.minReceived),
    guaranteedMin: intl.formatMessage(messages.guaranteedMin),
    slippageLabel: intl.formatMessage(messages.slippage),
    slippageInfo: intl.formatMessage(messages.slippageInfo),
    slippageTolerance: intl.formatMessage(messages.slippageTolerance),
    slippageInputInfo: intl.formatMessage(messages.slippageInputInfo),
    manualLabel: intl.formatMessage(messages.manualLabel),
    applyLabel: intl.formatMessage(messages.applyLabel),
    routingPreference: intl.formatMessage(messages.routingPreference),
    autoLabel: intl.formatMessage(messages.autoLabel),
    slippageToleranceHigh: intl.formatMessage(messages.slippageToleranceHigh),
    swapLabel: intl.formatMessage(messages.swapLabel),
    placeOrder: intl.formatMessage(messages.placeOrder),
    selectRoute: intl.formatMessage(messages.selectRoute),
    buyAt: intl.formatMessage(messages.buyAt),
    allAssets: intl.formatMessage(messages.allAssets),
    ordersPair: intl.formatMessage(messages.ordersPair),
    assetPrice: intl.formatMessage(messages.assetPrice),
    assetAmount: intl.formatMessage(messages.assetAmount),
    timeExecuted: intl.formatMessage(messages.timeExecuted),
    timeCreated: intl.formatMessage(messages.timeCreated),
    total: intl.formatMessage(messages.total),
    txId: intl.formatMessage(messages.txId),
    ordersCompletedLabel: intl.formatMessage(messages.ordersCompletedLabel),
    openOrdersLabel: intl.formatMessage(messages.openOrdersLabel),
    cancel: intl.formatMessage(messages.cancel),
    swapToLabel: intl.formatMessage(messages.swapToLabel),
    swapFromLabel: intl.formatMessage(messages.swapFromLabel),
    noOrdersCompleted: intl.formatMessage(messages.noOrdersCompleted),
    noOrdersAvailable: intl.formatMessage(messages.noOrdersAvailable),
    startDoingSwaps: intl.formatMessage(messages.startDoingSwaps),
    selectToken: intl.formatMessage(messages.selectToken),
    buyAndSellToken: intl.formatMessage(messages.buyAndSellToken),
    notEnoughBalance: intl.formatMessage(messages.notEnoughBalance),
    disclaimerTitle: intl.formatMessage(messages.disclaimerTitle),
    disclaimerDescription: intl.formatMessage(messages.disclaimerDescription),
    disclaimerPleaseNote: intl.formatMessage(messages.disclaimerPleaseNote),
    disclaimerNote1: intl.formatMessage(messages.disclaimerNote1),
    disclaimerNote2: intl.formatMessage(messages.disclaimerNote2),
    disclaimerNote3: intl.formatMessage(messages.disclaimerNote3),
    disclaimerNote4: intl.formatMessage(messages.disclaimerNote4),
    disclaimerCheckboxLabel: intl.formatMessage(messages.disclaimerCheckboxLabel),
    disclaimerProceed: intl.formatMessage(messages.disclaimerProceed),
    priceImpact: intl.formatMessage(messages.priceImpact),
    swapDetails: intl.formatMessage(messages.swapDetails),
    backLabel: intl.formatMessage(messages.back),
    confirmLabel: intl.formatMessage(messages.confirm),
    assetDetails: intl.formatMessage(messages.assetDetails),
    overviewLabel: intl.formatMessage(messages.overviewLabel),
    detailsOn: intl.formatMessage(messages.detailsOn),
    numYourAssets: num => intl.formatMessage(messages.numYourAssets, { num }),
    priceImpactSevere: intl.formatMessage(messages.priceImpactSevere, {
      strong: chunks => React.createElement('strong', null, chunks),
    }),
    priceImpactModerate: intl.formatMessage(messages.priceImpactModerate, {
      strong: chunks => React.createElement('strong', null, chunks),
    }),
  }).current;
};
