import React from 'react';
import { defineMessages } from 'react-intl';
import { useIntl } from '../../../../context/IntlProvider';

export const messages = Object.freeze(
  defineMessages({
    mainHeaderText: {
      id: 'portfolio.main.header.text',
      defaultMessage: '!!!Tokens',
    },
    detailHeaderText: {
      id: 'portfolio.detail.header.text',
      defaultMessage: '!!!Token details',
    },
    menuWallet: {
      id: 'portfolio.menu.wallet.link.label',
      defaultMessage: '!!!Wallet',
    },
    menuDapps: {
      id: 'portfolio.menu.dapps.link.label',
      defaultMessage: '!!!Dapps',
    },
    dapps: {
      id: 'portfolio.tooltip.dapps',
      defaultMessage: '!!!DApps',
    },
    copyToClipboard: {
      id: 'widgets.copyableaddress.addressCopyTooltipMessage',
      defaultMessage: '!!!Copy to clipboard',
    },
    copied: {
      id: 'widgets.copyableaddress.copied',
      defaultMessage: '!!!Copied',
    },
    soonAvailable: {
      id: 'portfolio.common.soonAvailable',
      defaultMessage: '!!!Soon available',
    },
    dex: {
      id: 'portfolio.common.dex',
      defaultMessage: '!!!DEX',
    },
    totalValue: {
      id: 'portfolio.common.totalValue',
      defaultMessage: '!!!Total value',
    },
    noResultsForThisSearch: {
      id: 'portfolio.common.noResultsForThisSearch',
      defaultMessage: '!!!No results for this search',
    },
    search: {
      id: 'portfolio.main.search.text',
      defaultMessage: '!!!Search by asset name or ID',
    },
    balancePerformance: {
      id: 'portfolio.tooltip.balancePerformance',
      defaultMessage: '!!!Balance performance',
    },
    balanceChange: {
      id: 'portfolio.tooltip.balanceChange',
      defaultMessage: '!!!Balance change',
    },
    tokenPriceChange: {
      id: 'portfolio.tooltip.tokenPriceChange',
      defaultMessage: '!!!Token price change',
    },
    in24hours: {
      id: 'portfolio.tooltip.in24hours',
      defaultMessage: '!!!in 24 hours',
    },
    backToPortfolio: {
      id: 'portfolio.button.backToPortfolio',
      defaultMessage: '!!!Back to portfolio',
    },
    swap: {
      id: 'portfolio.button.swap',
      defaultMessage: '!!!Swap',
    },
    send: {
      id: 'portfolio.button.send',
      defaultMessage: '!!!Send',
    },
    receive: {
      id: 'portfolio.button.receive',
      defaultMessage: '!!!Receive',
    },
    liquidityPool: {
      id: 'portfolio.button.liquidityPool',
      defaultMessage: '!!!Liquidity pool',
    },
    openOrders: {
      id: 'portfolio.button.openOrders',
      defaultMessage: '!!!Open orders',
    },
    lendAndBorrow: {
      id: 'portfolio.button.lendAndBorrow',
      defaultMessage: '!!!Lend & Borrow',
    },
    balance: {
      id: 'portfolio.tokenInfo.balance',
      defaultMessage: '!!!balance',
    },
    marketPrice: {
      id: 'portfolio.tokenInfo.marketPrice',
      defaultMessage: '!!!Market price',
    },
    description: {
      id: 'portfolio.tokenInfo.overview.description',
      defaultMessage: '!!!Description',
    },
    website: {
      id: 'portfolio.tokenInfo.overview.website',
      defaultMessage: '!!!Website',
    },
    policyId: {
      id: 'portfolio.tokenInfo.overview.policyId',
      defaultMessage: '!!!Policy ID',
    },
    fingerprint: {
      id: 'portfolio.tokenInfo.overview.fingerprint',
      defaultMessage: '!!!Fingerprint',
    },
    detailsOn: {
      id: 'portfolio.tokenInfo.overview.detailsOn',
      defaultMessage: '!!!Details on',
    },
    overview: {
      id: 'portfolio.tokenInfo.menuLabel.overview',
      defaultMessage: '!!!Overview',
    },
    performance: {
      id: 'portfolio.tokenInfo.menuLabel.performance',
      defaultMessage: '!!!Performance',
    },
    marketData: {
      id: 'portfolio.tokenInfo.performance.marketData',
      defaultMessage: '!!!Market data',
    },
    tokenPrice: {
      id: 'portfolio.tokenInfo.performance.tokenPrice',
      defaultMessage: '!!!Token price',
    },
    marketCap: {
      id: 'portfolio.tokenInfo.performance.marketCap',
      defaultMessage: '!!!Market cap',
    },
    '24hVolumn': {
      id: 'portfolio.tokenInfo.performance.24hVolumn',
      defaultMessage: '!!!24h volumn',
    },
    rank: {
      id: 'portfolio.tokenInfo.performance.rank',
      defaultMessage: '!!!Rank',
    },
    circulating: {
      id: 'portfolio.tokenInfo.performance.circulating',
      defaultMessage: '!!!Circulating',
    },
    totalSupply: {
      id: 'portfolio.tokenInfo.performance.totalSupply',
      defaultMessage: '!!!Total supply',
    },
    maxSupply: {
      id: 'portfolio.tokenInfo.performance.maxSupply',
      defaultMessage: '!!!Max supply',
    },
    allTimeHigh: {
      id: 'portfolio.tokenInfo.performance.allTimeHigh',
      defaultMessage: '!!!All time high',
    },
    allTimeLow: {
      id: 'portfolio.tokenInfo.performance.allTimeLow',
      defaultMessage: '!!!All time low',
    },
    name: {
      id: 'portfolio.statsTable.header.name',
      defaultMessage: '!!!Name',
    },
    price: {
      id: 'portfolio.statsTable.header.price',
      defaultMessage: '!!!Price',
    },
    '24H': {
      id: 'portfolio.chart.button.24H',
      defaultMessage: '!!!24H',
    },
    '1W': {
      id: 'portfolio.chart.button.1W',
      defaultMessage: '!!!1W',
    },
    '1M': {
      id: 'portfolio.chart.button.1M',
      defaultMessage: '!!!1M',
    },
    '6M': {
      id: 'portfolio.chart.button.6M',
      defaultMessage: '!!!6M',
    },
    '1Y': {
      id: 'portfolio.chart.button.1Y',
      defaultMessage: '!!!1W',
    },
    ALL: {
      id: 'portfolio.chart.button.ALL',
      defaultMessage: '!!!ALL',
    },
    portfolio: {
      id: 'portfolio.statsTable.header.portfolio',
      defaultMessage: '!!!Portfolio',
    },
    totalAmount: {
      id: 'portfolio.statsTable.header.totalAmount',
      defaultMessage: '!!!Total amount',
    },
    transactionHistory: {
      id: 'portfolio.transactionTable.title',
      defaultMessage: '!!!Transaction history',
    },
    transactionType: {
      id: 'portfolio.transactionTable.header.transactionType',
      defaultMessage: '!!!Transaction type',
    },
    status: {
      id: 'portfolio.transactionTable.header.status',
      defaultMessage: '!!!Status',
    },
    fee: {
      id: 'portfolio.transactionTable.header.fee',
      defaultMessage: '!!!Fee',
    },
    amount: {
      id: 'portfolio.transactionTable.header.amount',
      defaultMessage: '!!!Amount',
    },
    today: {
      id: 'portfolio.transactionTable.timestamp.today',
      defaultMessage: '!!!Today',
    },
    yesterday: {
      id: 'portfolio.transactionTable.timestamp.yesterday',
      defaultMessage: '!!!Amount',
    },
    sent: {
      id: 'portfolio.transactionTable.label.sent',
      defaultMessage: '!!!Sent',
    },
    received: {
      id: 'portfolio.transactionTable.label.received',
      defaultMessage: '!!!Received',
    },
    transactionError: {
      id: 'portfolio.transactionTable.label.transactionError',
      defaultMessage: '!!!Transaction error',
    },
    rewardWithdraw: {
      id: 'portfolio.transactionTable.label.rewardWithdraw',
      defaultMessage: '!!!Reward withdrawn',
    },
    stakeDelegate: {
      id: 'portfolio.transactionTable.label.stakeDelegate',
      defaultMessage: '!!!Stake delegated',
    },
    low: {
      id: 'portfolio.transactionTable.status.low',
      defaultMessage: '!!!Low',
    },
    high: {
      id: 'portfolio.transactionTable.status.high',
      defaultMessage: '!!!High',
    },
    failed: {
      id: 'portfolio.transactionTable.status.failed',
      defaultMessage: '!!!Failed',
    },
    assets: {
      id: 'portfolio.transactionTable.amount.assets',
      defaultMessage: '!!!assets',
    },
    tokenPair: {
      id: 'portfolio.liquidityTable.header.tokenPair',
      defaultMessage: '!!!Token pair',
    },
    firstTokenValue: {
      id: 'portfolio.liquidityTable.header.firstTokenValue',
      defaultMessage: '!!!Token value 1',
    },
    secondTokenValue: {
      id: 'portfolio.liquidityTable.header.secondTokenValue',
      defaultMessage: '!!!Token value 2',
    },
    lpTokens: {
      id: 'portfolio.liquidityTable.header.lpTokens',
      defaultMessage: '!!!LP tokens',
    },
    pair: {
      id: 'portfolio.orderTable.header.pair',
      defaultMessage: '!!!Pair (From / To)',
    },
    assetPrice: {
      id: 'portfolio.orderTable.header.assetPrice',
      defaultMessage: '!!!Asset price',
    },
    assetAmount: {
      id: 'portfolio.orderTable.header.assetAmount',
      defaultMessage: '!!!Asset amount',
    },
    transactionId: {
      id: 'portfolio.orderTable.header.transactionId',
      defaultMessage: '!!!Transaction ID',
    },
    welcomeBannerTitle: {
      id: 'portfolio.welcomeBanner.title',
      defaultMessage: '!!!Welcome to Yoroi',
    },
    welcomeBannerDesc: {
      id: 'portfolio.welcomeBanner.description',
      defaultMessage:
        '!!!With new features and upgraded performance, transactions can be done faster and more securely than ever before.',
    },
  })
);

export const useStrings = () => {
  const { intl } = useIntl();
  return React.useRef({
    mainHeaderText: intl.formatMessage(messages.mainHeaderText),
    detailHeaderText: intl.formatMessage(messages.detailHeaderText),
    menuWallet: intl.formatMessage(messages.menuWallet),
    menuDapps: intl.formatMessage(messages.menuDapps),
    dapps: intl.formatMessage(messages.dapps),
    copyToClipboard: intl.formatMessage(messages.copyToClipboard),
    copied: intl.formatMessage(messages.copied),
    soonAvailable: intl.formatMessage(messages.soonAvailable),
    noResultsForThisSearch: intl.formatMessage(messages.noResultsForThisSearch),
    search: intl.formatMessage(messages.search),
    balancePerformance: intl.formatMessage(messages.balancePerformance),
    balanceChange: intl.formatMessage(messages.balanceChange),
    tokenPriceChange: intl.formatMessage(messages.tokenPriceChange),
    in24hours: intl.formatMessage(messages.in24hours),
    backToPortfolio: intl.formatMessage(messages.backToPortfolio),
    swap: intl.formatMessage(messages.swap),
    send: intl.formatMessage(messages.send),
    receive: intl.formatMessage(messages.receive),
    liquidityPool: intl.formatMessage(messages.liquidityPool),
    openOrders: intl.formatMessage(messages.openOrders),
    lendAndBorrow: intl.formatMessage(messages.lendAndBorrow),
    balance: intl.formatMessage(messages.balance),
    marketPrice: intl.formatMessage(messages.marketPrice),
    description: intl.formatMessage(messages.description),
    website: intl.formatMessage(messages.website),
    policyId: intl.formatMessage(messages.policyId),
    fingerprint: intl.formatMessage(messages.fingerprint),
    detailsOn: intl.formatMessage(messages.detailsOn),
    overview: intl.formatMessage(messages.overview),
    performance: intl.formatMessage(messages.performance),
    marketData: intl.formatMessage(messages.marketData),
    tokenPrice: intl.formatMessage(messages.tokenPrice),
    marketCap: intl.formatMessage(messages.marketCap),
    '24hVolumn': intl.formatMessage(messages['24hVolumn']),
    rank: intl.formatMessage(messages.rank),
    circulating: intl.formatMessage(messages.circulating),
    totalSupply: intl.formatMessage(messages.totalSupply),
    maxSupply: intl.formatMessage(messages.maxSupply),
    allTimeHigh: intl.formatMessage(messages.allTimeHigh),
    allTimeLow: intl.formatMessage(messages.allTimeLow),
    name: intl.formatMessage(messages.name),
    price: intl.formatMessage(messages.price),
    '24H': intl.formatMessage(messages['24H']),
    '1W': intl.formatMessage(messages['1W']),
    '1M': intl.formatMessage(messages['1M']),
    '6M': intl.formatMessage(messages['6M']),
    '1Y': intl.formatMessage(messages['1Y']),
    ALL: intl.formatMessage(messages['ALL']),
    portfolio: intl.formatMessage(messages.portfolio),
    totalAmount: intl.formatMessage(messages.totalAmount),
    transactionHistory: intl.formatMessage(messages.transactionHistory),
    transactionType: intl.formatMessage(messages.transactionType),
    status: intl.formatMessage(messages.status),
    fee: intl.formatMessage(messages.fee),
    amount: intl.formatMessage(messages.amount),
    today: intl.formatMessage(messages.today),
    yesterday: intl.formatMessage(messages.yesterday),
    sent: intl.formatMessage(messages.sent),
    received: intl.formatMessage(messages.received),
    transactionError: intl.formatMessage(messages.transactionError),
    rewardWithdraw: intl.formatMessage(messages.rewardWithdraw),
    stakeDelegate: intl.formatMessage(messages.stakeDelegate),
    low: intl.formatMessage(messages.low),
    high: intl.formatMessage(messages.high),
    failed: intl.formatMessage(messages.failed),
    assets: intl.formatMessage(messages.assets),
    tokenPair: intl.formatMessage(messages.tokenPair),
    dex: intl.formatMessage(messages.dex),
    firstTokenValue: intl.formatMessage(messages.firstTokenValue),
    secondTokenValue: intl.formatMessage(messages.secondTokenValue),
    lpTokens: intl.formatMessage(messages.lpTokens),
    totalValue: intl.formatMessage(messages.totalValue),
    pair: intl.formatMessage(messages.pair),
    assetPrice: intl.formatMessage(messages.assetPrice),
    assetAmount: intl.formatMessage(messages.assetAmount),
    transactionId: intl.formatMessage(messages.transactionId),
    welcomeBannerTitle: intl.formatMessage(messages.welcomeBannerTitle),
    welcomeBannerDesc: intl.formatMessage(messages.welcomeBannerDesc),
  }).current;
};
