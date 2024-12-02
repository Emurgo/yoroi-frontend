import { useRef } from 'react';
import { defineMessages } from 'react-intl';
import { useIntl } from '../context/intl/IntlProvider.tsx';

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
    max: {
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
