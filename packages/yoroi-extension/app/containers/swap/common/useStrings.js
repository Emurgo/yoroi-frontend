import { useRef } from 'react';
import { defineMessages, FormattedHTMLMessage } from 'react-intl';
import { useIntl } from '../context/intl/IntlProvider.js';

export const messages = Object.freeze(
  defineMessages({
    back: {
      id: 'global.labels.back',
      defaultMessage: '!!!Back',
    },
    apply: {
      id: 'global.labels.apply',
      defaultMessage: '!!!Apply',
    },
    confirm: {
      id: 'global.labels.confirm',
      defaultMessage: '!!!Confirm',
    },
    continue: {
      id: 'global.labels.continue',
      defaultMessage: '!!!Continue',
    },
    cancel: {
      id: 'global.labels.cancel',
      defaultMessage: '!!!Cancel',
    },
    total: {
      id: 'swap.total',
      defaultMessage: '!!!Total',
    },
    manual: {
      id: 'swap.manual',
      defaultMessage: '!!!Manual',
    },
    max: {
      id: 'swap.max',
      defaultMessage: '!!!MAX',
    },
    currentBalance: {
      id: 'swap.currentBalance',
      defaultMessage: '!!!Current balance:',
    },
    swap: {
      id: 'swap.swapLabel',
      defaultMessage: '!!!Swap',
    },
    auto: {
      id: 'swap.auto',
      defaultMessage: '!!!(Auto)',
    },
    assetSwapLabel: {
      id: 'swap.menu.swap',
      defaultMessage: '!!!Asset swap',
    },
    orderSwapLabel: {
      id: 'swap.menu.orders',
      defaultMessage: '!!!Orders',
    },
    slippageTolerance: {
      id: 'swap.actions.slippageTolerance',
      defaultMessage: '!!!Slippage Tolerance',
    },
    defaultSlippageTolerance: {
      id: 'swap.actions.defaultSlippageTolerance',
      defaultMessage: '!!!Default Slippage Tolerance',
    },
    slippageToleranceTooltip: {
      id: 'swap.actions.slippageToleranceTooltip',
      defaultMessage:
        '!!!Slippage tolerance is set as a percentage of the total swap value. Your transactions will not be executed if the price moves by more than this amount',
    },
    slippageToleranceHigh: {
      id: 'swap.actions.slippageToleranceHigh',
      defaultMessage:
        '!!!When the slippage tolerance is set really high, it allows the transaction to still complete despite large price swings. This can open the door to front-running and sandwich attacks.',
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
    timeExecuted: {
      id: 'swap.timeExecuted',
      defaultMessage: '!!!Time executed',
    },
    timeCreated: {
      id: 'swap.timeCreated',
      defaultMessage: '!!!Time created',
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
      defaultMessage: 'Incorrect password. Please retype.',
    },
    limitPrice: {
      id: 'swap.limitPrice',
      defaultMessage: '!!!Limit price',
    },
    limitPriceTooltip: {
      id: 'swap.limitPriceTooltip',
      defaultMessage:
        "!!!Limit price in a DEX is a specific pre-set price at which you can trade an asset. Unlike market orders, which execute immediately at the current market price, limit orders are set to execute only when the market reaches the trader's specified price.",
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
    marketPriceTooltip: {
      id: 'swap.marketPriceTooltip',
      defaultMessage:
        '!!!Market price is the best price available on the market among several DEXes that lets you buy or sell an asset instantly',
    },
    priceImpact: {
      id: 'swap.priceImpact',
      defaultMessage: '!!!Price impact',
    },
    priceImpactTooltip: {
      id: 'swap.priceImpactTooltip',
      defaultMessage: '!!!Price impact is a difference between the actual market price and your price due to trade size.',
    },
    priceImpactSevere: {
      id: 'swap.priceImpactSevere',
      defaultMessage:
        '!!!<strong>Price impact over 10%</strong> may cause a significant loss of funds. Please bear this in mind and proceed with an extra caution.',
    },
    priceImpactNotSevere: {
      id: 'swap.priceImpactNotSevere',
      defaultMessage:
        '!!!<strong>Price impact over 1%</strong> may cause a difference in the amount you actually receive. Consider this at your own risk.',
    },
    numAssetsFound: {
      id: 'swap.numAssetsFound',
      defaultMessage: '!!!{num} assets found',
    },
    numAssetsAvailable: {
      id: 'swap.numAssetsAvailable',
      defaultMessage: '!!!{num} assets available',
    },
    noAssetFoundWithTerm: {
      id: 'swap.noAssetFoundWithTerm',
      defaultMessage: '!!!No tokens found for “{searchTerm}”',
    },
    noAssetFoundToSwap: {
      id: 'swap.noAssetFoundToSwap',
      defaultMessage: '!!!No asset was found to swap',
    },
    swapDisclamerInfo: {
      id: 'swap.swapDisclamerInfo',
      defaultMessage:
        '!!!Please be aware that by proceeding to use the SWAP functionality within Yoroi, you acknowledge and understand that any actions taken are solely your responsibility.<br /><br /> The assets available in this functionality are Cardano Native Assets and not subject to a verification process. Additionally, the asset price indication is subject to rapid fluctuations based on market conditions.<br /><br />We strongly advise conducting thorough research and exercising caution before engaging in any SWAP transactions. Yoroi and EMURGO cannot be held liable for any potential risks, losses, or damages that may arise from your use of the SWAP functionality.',
    },
    swapDisclamerButton: {
      id: 'swap.swapDisclamerButton',
      defaultMessage: '!!!I understand this disclaimer',
    },
    pairNotAvailable: {
      id: 'swap.pairNotAvailable',
      defaultMessage: '!!!Selected pair is not available in any liquidity pool',
    },
    noPoolFound: {
      id: 'swap.noPoolFound',
      defaultMessage: '!!!No pool found',
    },
    adaDepositTooltip: {
      id: 'swap.adaDepositTooltip',
      defaultMessage: '!!!A small ADA deposit that will be returned when your order is processed or canceled',
    },
    minAda: {
      id: 'swap.minAda',
      defaultMessage: '!!!Min ADA',
    },
    fees: {
      id: 'swap.fees',
      defaultMessage: '!!!Fees',
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
    minimumAssets: {
      id: 'swap.minimumAssets',
      defaultMessage: '!!!Minimum assets received',
    },
    minimumAssetsTooltip: {
      id: 'swap.minimumAssetsTooltip',
      defaultMessage: '!!!The minimum amount you are guaranteed to receive in case of price slippage',
    },
    lpFee: {
      id: 'swap.lpFee',
      defaultMessage: '!!!Liquidity provider fee',
    },
    lpFeeTooltip: {
      id: 'swap.lpFeeTooltip',
      defaultMessage:
        '!!!A fixed 0.3% operational fee paid to liquidity providers as a reward for supplying tokens, enabling traders to buy and sell assets on the decentralized Cardano network',
    },
    confirmSwapTx: {
      id: 'swap.confirmSwapTx',
      defaultMessage: '!!!Confirm swap transaction',
    },
    txSubmitted: {
      id: 'swap.txSubmitted',
      defaultMessage: '!!!Transaction submitted',
    },
    txFailed: {
      id: 'swap.txFailed',
      defaultMessage: '!!!Transaction failed',
    },
    txId: {
      id: 'swap.txId',
      defaultMessage: '!!!Transaction ID',
    },
    checkTx: {
      id: 'swap.checkTx',
      defaultMessage: '!!!Check this transaction in the list of wallet transactions',
    },
    txNotProcessed: {
      id: 'swap.txNotProcessed',
      defaultMessage: '!!!Your transaction has not been processed properly due to technical issues',
    },
    goToTxs: {
      id: 'swap.goToTxs',
      defaultMessage: '!!!Go to transactions',
    },
    tryAgain: {
      id: 'wallet.transaction.tryAgain',
      defaultMessage: '!!!Try again',
    },
    downloadLogFile: {
      id: 'swap.downloadLogFile',
      defaultMessage: '!!!Download log file',
    },
    notEnoughBalance: {
      id: 'swap.notEnoughBalance',
      defaultMessage: '!!!Not enough balance',
    },
    notEnoughBalanceFees: {
      id: 'swap.notEnoughBalanceFees',
      defaultMessage: '!!!Not enough balance, please consider the fees',
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
    ordersPairs: {
      id: 'swap.ordersPair',
      defaultMessage: '!!!Pair (From / To)',
    },
    ordersCompletedLabel: {
      id: 'swap.ordersCompletedLabel',
      defaultMessage: '!!!Completed orders',
    },
    openOrdersLabel: {
      id: 'swap.openOrdersLabel',
      defaultMessage: '!!!Open orders',
    },
  })
);

export const useStrings = () => {
  const { intl } = useIntl();

  return useRef({
    back: intl.formatMessage(messages.back),
    apply: intl.formatMessage(messages.apply),
    confirm: intl.formatMessage(messages.confirm),
    continue: intl.formatMessage(messages.continue),
    cancel: intl.formatMessage(messages.cancel),
    total: intl.formatMessage(messages.total),
    manual: intl.formatMessage(messages.manual),
    max: intl.formatMessage(messages.max),
    currentBalance: intl.formatMessage(messages.currentBalance),
    swap: intl.formatMessage(messages.swap),
    auto: intl.formatMessage(messages.auto),
    assetSwapLabel: intl.formatMessage(messages.assetSwapLabel),
    orderSwapLabel: intl.formatMessage(messages.orderSwapLabel),
    slippageTolerance: intl.formatMessage(messages.slippageTolerance),
    defaultSlippageTolerance: intl.formatMessage(messages.defaultSlippageTolerance),
    slippageToleranceTooltip: intl.formatMessage(messages.slippageToleranceTooltip),
    slippageToleranceHigh: intl.formatMessage(messages.slippageToleranceHigh),
    clear: intl.formatMessage(messages.clear),
    marketTabLabel: intl.formatMessage(messages.marketTabLabel),
    limitTabLabel: intl.formatMessage(messages.limitTabLabel),
    swapToLabel: intl.formatMessage(messages.swapToLabel),
    swapFromLabel: intl.formatMessage(messages.swapFromLabel),
    dexLabel: intl.formatMessage(messages.dexLabel),
    sendUsingLedgerNano: intl.formatMessage(messages.sendUsingLedgerNano),
    sendUsingTrezorT: intl.formatMessage(messages.sendUsingTrezorT),
    cancelOrderTitle: intl.formatMessage(messages.cancelOrderTitle),
    cancelOrderContent: intl.formatMessage(messages.cancelOrderContent),
    asset: intl.formatMessage(messages.asset),
    amount: intl.formatMessage(messages.amount),
    assetPrice: intl.formatMessage(messages.assetPrice),
    assetAmount: intl.formatMessage(messages.assetAmount),
    totalReturned: intl.formatMessage(messages.totalReturned),
    timeExecuted: intl.formatMessage(messages.timeExecuted),
    timeCreated: intl.formatMessage(messages.timeCreated),
    totalReturnedTooltip: intl.formatMessage(messages.totalReturnedTooltip),
    cancellationFee: intl.formatMessage(messages.cancellationFee),
    password: intl.formatMessage(messages.password),
    passwordIncorrect: intl.formatMessage(messages.passwordIncorrect),
    limitPrice: intl.formatMessage(messages.limitPrice),
    limitPriceTooltip: intl.formatMessage(messages.limitPriceTooltip),
    limitPriceContent: intl.formatMessage(messages.limitPriceContent),
    yourLimitPrice: intl.formatMessage(messages.yourLimitPrice),
    marketPrice: intl.formatMessage(messages.marketPrice),
    marketPriceTooltip: intl.formatMessage(messages.marketPriceTooltip),
    priceImpact: intl.formatMessage(messages.priceImpact),
    priceImpactTooltip: intl.formatMessage(messages.priceImpactTooltip),
    priceImpactSevere: <FormattedHTMLMessage {...messages.priceImpactSevere} />,
    priceImpactNotSevere: <FormattedHTMLMessage {...messages.priceImpactNotSevere} />,
    numAssetsFound: num => intl.formatMessage(messages.numAssetsFound, { num }),
    numAssetsAvailable: num => intl.formatMessage(messages.numAssetsAvailable, { num }),
    noAssetFoundWithTerm: term => intl.formatMessage(messages.noAssetFoundWithTerm, { searchTerm: term }),
    noAssetFoundToSwap: intl.formatMessage(messages.noAssetFoundToSwap),
    swapDisclamerInfo: <FormattedHTMLMessage {...messages.swapDisclamerInfo} />,
    swapDisclamerButton: intl.formatMessage(messages.swapDisclamerButton),
    pairNotAvailable: intl.formatMessage(messages.pairNotAvailable),
    noPoolFound: intl.formatMessage(messages.noPoolFound),
    adaDepositTooltip: intl.formatMessage(messages.adaDepositTooltip),
    minAda: intl.formatMessage(messages.minAda),
    fees: intl.formatMessage(messages.fees),
    feesIncluded: intl.formatMessage(messages.feesIncluded),
    dexFee: intl.formatMessage(messages.dexFee),
    frontendFee: intl.formatMessage(messages.frontendFee),
    minimumAssets: intl.formatMessage(messages.minimumAssets),
    minimumAssetsTooltip: intl.formatMessage(messages.minimumAssetsTooltip),
    lpFee: intl.formatMessage(messages.lpFee),
    lpFeeTooltip: intl.formatMessage(messages.lpFeeTooltip),
    confirmSwapTx: intl.formatMessage(messages.confirmSwapTx),
    txSubmitted: intl.formatMessage(messages.txSubmitted),
    txFailed: intl.formatMessage(messages.txFailed),
    txId: intl.formatMessage(messages.txId),
    checkTx: intl.formatMessage(messages.checkTx),
    txNotProcessed: intl.formatMessage(messages.txNotProcessed),
    goToTxs: intl.formatMessage(messages.goToTxs),
    tryAgain: intl.formatMessage(messages.tryAgain),
    downloadLogFile: intl.formatMessage(messages.downloadLogFile),
    notEnoughBalance: intl.formatMessage(messages.notEnoughBalance),
    notEnoughBalanceFees: intl.formatMessage(messages.notEnoughBalanceFees),
    noOrdersCompleted: intl.formatMessage(messages.noOrdersCompleted),
    noOrdersAvailable: intl.formatMessage(messages.noOrdersAvailable),
    startDoingSwaps: intl.formatMessage(messages.startDoingSwaps),
    ordersPairs: intl.formatMessage(messages.ordersPairs),
    ordersCompletedLabel: intl.formatMessage(messages.ordersCompletedLabel),
    openOrdersLabel: intl.formatMessage(messages.openOrdersLabel),
  }).current;
};
