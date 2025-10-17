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
      defaultMessage: '!!!route',
    },
    routeTvl: {
      id: 'global.labels.tvl',
      defaultMessage: '!!!TVL',
    },
    routePath: {
      id: 'swap.routePath',
      defaultMessage: '!!!routePath',
    },
    priceLabel: {
      id: 'portfolio.statsTable.header.price',
      defaultMessage: '!!!price',
    },
    feesIncluded: {
      id: 'swap.feesIncluded',
      defaultMessage: '!!!Fees included:',
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
      defaultMessage: '!!!minReceived',
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
      defaultMessage: '!!!Slippage tolerance',
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
      defaultMessage: '!!! Swap',
    },
    buyAt: {
      id: 'swap.buyAt',
      defaultMessage: '!!! Buy At',
    },
    selectRoute: {
      id: 'swap.selectRoute',
      defaultMessage: '!!! Select Route',
    },
    placeOrder: {
      id: 'swap.placeOrder',
      defaultMessage: '!!! Place Order',
    },
    allAssets: {
      id: 'swap.allAssets',
      defaultMessage: '!!! All Assets',
    },
    applyLabel: {
      id: 'global.labels.apply',
      defaultMessage: '!!! Apply',
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
      defaultMessage: '!!Buy and sell tokens must be different',
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
    noOrdersCompleted: intl.formatMessage(messages.noOrdersCompleted),
    noOrdersAvailable: intl.formatMessage(messages.noOrdersAvailable),
    startDoingSwaps: intl.formatMessage(messages.startDoingSwaps),
    selectToken: intl.formatMessage(messages.selectToken),
    buyAndSellToken: intl.formatMessage(messages.buyAndSellToken),
    numYourAssets: num => intl.formatMessage(messages.numYourAssets, { num }),
  }).current;
};
