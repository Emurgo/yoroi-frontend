import React from 'react';
import { defineMessages } from 'react-intl';
import { useIntl } from '../../../../context/IntlProvider';

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
    routingPreferance: {
      id: 'swap.routingPreferance',
      defaultMessage: '!!!Slippage tolerance',
    },
  })
);

export const useStrings = () => {
  const { intl } = useIntl();
  return React.useRef({
    assetSwapLabel: intl.formatMessage(messages.assetSwapLabel),
    orderSwapLabel: intl.formatMessage(messages.orderSwapLabel),
    limitTabLabel: intl.formatMessage(messages.limitTabLabel),
    marketTabLabel: intl.formatMessage(messages.marketTabLabel),
    routeLabel: intl.formatMessage(messages.routeLabel),
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
    manualLabel: intl.formatMessage(messages.manualLabel),
    routingPreferance: intl.formatMessage(messages.routingPreferance),
    numYourAssets: num => intl.formatMessage(messages.numYourAssets, { num }),
  }).current;
};
