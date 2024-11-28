import { useRef } from 'react';
import { defineMessages } from 'react-intl';
import { useIntl } from '../context/intl/IntlProvider.tsx';

export const messages = Object.freeze(
  defineMessages({
    back: {
      id: 'global.labels.back',
      defaultMessage: '!!!Back',
    },
    continue: {
      id: 'global.labels.continue',
      defaultMessage: '!!!Continue',
    },
    cancel: {
      id: 'global.labels.cancel',
      defaultMessage: '!!!Cancel',
    },
    swap: {
      id: 'swap.swapLabel',
      defaultMessage: '!!!Swap',
    },
    slippageTolerance: {
      id: 'swap.actions.slippageTolerance',
      defaultMessage: '!!!Slippage Tolerance',
    },
    slippageToleranceTooltip: {
      id: 'swap.actions.slippageToleranceTooltip',
      defaultMessage:
        '!!!Slippage tolerance is set as a percentage of the total swap value. Your transactions will not be executed if the price moves by more than this amount',
    },
    clear: {
      id: 'swap.actions.clear',
      defaultMessage: '!!!Clear',
    },
    marketTabLabel: {
      id: 'swap.actions.marketTabLabel',
      defaultMessage: '!!!Market',
    },
    limitTabLabel: {
      id: 'swap.actions.limitTabLabel',
      defaultMessage: '!!!Limit',
    },
    swapToLabel: {
      id: 'swap.swapToLabel',
      defaultMessage: '!!!Swap to',
    },
    swapFromLabel: {
      id: 'swap.swapFromLabel',
      defaultMessage: '!!!Swap from',
    },
    dexLabel: {
      id: 'swap.dexLabel',
      defaultMessage: '!!!DEX',
    },
    sendUsingLedgerNano: {
      id: 'wallet.send.ledger.confirmationDialog.submit',
      defaultMessage: '!!!Send using Ledger',
    },
    sendUsingTrezorT: {
      id: 'wallet.send.trezor.confirmationDialog.submit',
      defaultMessage: '!!!Send using Trezor',
    },
    cancelOrderTitle: {
      id: 'swap.cancelOrder.title',
      defaultMessage: '!!!Cancel order',
    },
    cancelOrderContent: {
      id: 'swap.cancelOrder.content',
      defaultMessage: '!!!Are you sure you want to cancel this order?',
    },
    asset: {
      id: 'swap.asset',
      defaultMessage: '!!!Asset',
    },
    amount: {
      id: 'swap.amount',
      defaultMessage: '!!!Amount',
    },
    assetPrice: {
      id: 'swap.assetPrice',
      defaultMessage: '!!!Asset price',
    },
    assetAmount: {
      id: 'swap.assetAmount',
      defaultMessage: '!!!Asset amount',
    },
    totalReturned: {
      id: 'swap.totalReturned',
      defaultMessage: '!!!Total returned',
    },
    totalReturnedTooltip: {
      id: 'swap.totalReturnedTooltip',
      defaultMessage: '!!!The amount returned to your wallet after cancelling the order',
    },
    cancellationFee: {
      id: 'swap.cancellationFee',
      defaultMessage: '!!!Cancellation fee',
    },
    password: {
      id: 'global.labels.password',
      defaultMessage: '!!!Password',
    },
    passwordIncorrect: {
      id: 'api.errors.IncorrectPasswordError',
      defaultMessage: 'Incorrect password!',
    },
    limitPrice: {
      id: 'swap.limitPrice',
      defaultMessage: '!!!Limit price',
    },
    limitPriceContent: {
      id: 'swap.limitPriceContent',
      defaultMessage:
        '!!!Are you sure you want to proceed this order with the limit price that is 10% or more higher than the market price?',
    },
    yourLimitPrice: {
      id: 'swap.yourLimitPrice',
      defaultMessage: '!!!Your limit price',
    },
    marketPrice: {
      id: 'swap.marketPrice',
      defaultMessage: '!!!Market price',
    },
    priceImpact: {
      id: 'swap.priceImpact',
      defaultMessage: '!!!Price impact',
    },
    priceImpactSevere: {
      id: 'swap.priceImpactSevere',
      defaultMessage:
        '!!!<b>Price impact over 10%<b> may cause a significant loss of funds. Please bear this in mind and proceed with an extra caution.',
    },
    priceImpactNotSevere: {
      id: 'swap.priceImpactNotSevere',
      defaultMessage:
        '!!!<b>Price impact over 1%<b> may cause a difference in the amount you actually receive. Consider this at your own risk.',
    },
    numAssetsFound: {
      id: 'swap.numAssetsFound',
      defaultMessage: '!!!{num} assets found',
    },
    numAssetsAvailable: {
      id: 'swap.numAssetsAvailable',
      defaultMessage: '!!!{num} assets available',
    },
    noTokensFoundWithTerm: {
      id: 'swap.noTokensFoundWithTerms',
      defaultMessage: '!!!No tokens found for “{searchTerm}”',
    },
    noAssetFoundToSwap: {
      id: 'swap.noAssetFoundToSwap',
      defaultMessage: '!!!No asset was found to swap',
    },
  })
);

export const useStrings = () => {
  const { intl } = useIntl();

  return useRef({
    back: intl.formatMessage(messages.back),
    swap: intl.formatMessage(messages.swap),
    slippageTolerance: intl.formatMessage(messages.slippageTolerance),
    slippageToleranceTooltip: intl.formatMessage(messages.slippageToleranceTooltip),
    clear: intl.formatMessage(messages.clear),
    marketTabLabel: intl.formatMessage(messages.marketTabLabel),
    limitTabLabel: intl.formatMessage(messages.limitTabLabel),
    swapToLabel: intl.formatMessage(messages.swapToLabel),
    dexLabel: intl.formatMessage(messages.dexLabel),
    sendUsingLedgerNano: intl.formatMessage(messages.sendUsingLedgerNano),
    sendUsingTrezorT: intl.formatMessage(messages.sendUsingTrezorT),
    cancelOrderTitle: intl.formatMessage(messages.cancelOrderTitle),
    cancelOrderContent: intl.formatMessage(messages.cancelOrderContent),
    assetPrice: intl.formatMessage(messages.assetPrice),
    assetAmount: intl.formatMessage(messages.assetAmount),
    totalReturned: intl.formatMessage(messages.totalReturned),
    totalReturnedTooltip: intl.formatMessage(messages.totalReturnedTooltip),
    cancellationFee: intl.formatMessage(messages.cancellationFee),
    password: intl.formatMessage(messages.password),
    passwordIncorrect: intl.formatMessage(messages.passwordIncorrect),
    limitPrice: intl.formatMessage(messages.limitPrice),
    limitPriceContent: intl.formatMessage(messages.limitPriceContent),
    yourLimitPrice: intl.formatMessage(messages.yourLimitPrice),
    marketPrice: intl.formatMessage(messages.marketPrice),
  }).current;
};
