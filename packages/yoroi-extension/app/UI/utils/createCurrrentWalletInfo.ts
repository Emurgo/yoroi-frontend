import { maybe } from '../../coreUtils';
import { genLookupOrFail, getTokenIdentifierIfExists, getTokenStrictName } from '../../stores/stateless/tokenHelpers';
import { splitAmount, truncateToken } from '../../utils/formatters.js';
import { calculateAndFormatValue } from '../../utils/unit-of-account';
import { cardanoAdaBase64Logo } from '../features/portfolio/common/helpers/contants';
import { createChartData } from '../features/portfolio/common/helpers/mockHelper';

export const mapStakingKeyStateToGovernanceAction = (state: any) => {
  if (!state.drepDelegation) return null;
  const vote = state.drepDelegation;
  return vote.action === 'abstain'
    ? { kind: 'abstain' }
    : vote.action === 'no-confidence'
    ? { kind: 'no-confidence' }
    : { kind: 'delegate', drepID: vote.drepID };
};

const getStakePoolMeta = (stores: any) => {
  const publicDeriver = stores.wallets.selected;
  const delegationStore = stores.delegation;
  const currentPool = delegationStore.getDelegatedPoolId(publicDeriver);
  if (currentPool == null) return null;
  const networkInfo = publicDeriver.getParent().getNetworkInfo();
  const poolMeta = delegationStore.getLocalPoolInfo(networkInfo, currentPool);
  const poolInfo = delegationStore.getLocalRemotePoolInfo(networkInfo, currentPool) ?? {};
  if (poolMeta == null) {
    // server hasn't returned information about the stake pool yet
    return null;
  }
  const name = poolMeta.info?.name ?? 'unknown';
  const delegatedPool = {
    id: String(currentPool),
    name,
    websiteUrl: poolMeta.info?.homepage,
    ticker: poolMeta.info?.ticker,
    ...poolInfo,
  };

  return {
    ...delegatedPool,
    ...poolMeta,
  };
};

const getTotalAmount = (walletAmount, rewards) => {
  return maybe(walletAmount, w => rewards.joinAddCopy(w));
};

const getAssetWalletAssetList = stores => {
  const spendableBalance = stores.transactions.balance;
  const getTokenInfo = genLookupOrFail(stores.tokenInfoStore.tokenInfo);
  if (spendableBalance == null) return [];
  return [spendableBalance.getDefaultEntry(), ...spendableBalance.nonDefaultEntries()]
    .map(entry => ({
      entry,
      info: getTokenInfo(entry),
    }))
    .filter(item => item.info.IsNFT === false)
    .map(token => {
      const numberOfDecimals = token.info?.Metadata.numberOfDecimals ?? 0;
      const shiftedAmount = token.entry.amount.shiftedBy(-numberOfDecimals);
      const [beforeDecimal, afterDecimal] = splitAmount(shiftedAmount, numberOfDecimals);
      const tokenName = truncateToken(getTokenStrictName(token.info).name ?? '-');
      const tokenId = getTokenIdentifierIfExists(token.info) ?? '-';
      const tokenLogo = `data:image/png;base64,${
        token.info.Metadata.policyId === '' ? cardanoAdaBase64Logo : token.info.Metadata.logo
      }`;

      return {
        name: tokenName,
        id: tokenId,
        totalAmount: [beforeDecimal, afterDecimal].join(''),
        amountForSorting: shiftedAmount,
        // fiatCurrency: currency,
        // fiatDisplay: fiatDisplay,
        tokenLogo: tokenLogo,
        ...token.info.Metadata,
        price: 0.123, // MOCKED
        '24h': -(10 * Math.random()), // MOCKED
        '1W': 10 * Math.random(), // MOCKED
        '1M': 10 * Math.random(), // MOCKED
        portfolioPercents: Math.round(100 * Math.random()), // MOCKED
        totalAmountUsd: Math.round(100000 * Math.random()), // MOCKED

        // The below properties are used only in token details page
        chartData: {
          start24HoursAgo: createChartData('24H'), // MOCKED
          start1WeekAgo: createChartData('1W'), // MOCKED
          start1MonthAgo: createChartData('1M'), // MOCKED
          start6MonthAgo: createChartData('6M'), // MOCKED
          start1YearAgo: createChartData('1Y'), // MOCKED
          ALL: createChartData('1Y'), // MOCKED
        },
        performance: [
          { value: Math.random() }, // MOCKED
          { value: Math.random() }, // MOCKED
          { value: `${Math.round(1000 * Math.random())}M` }, // MOCKED
          { value: `${Math.round(100 * Math.random())}M` }, // MOCKED
          { value: `${Math.round(100 * Math.random())}` }, // MOCKED
          { value: 100 * Math.random() }, // MOCKED
          { value: 1000 * Math.random() }, // MOCKED
          { value: '45B' }, // MOCKED
          { value: 10 * Math.random() }, // MOCKED
          { value: Math.random() / 100 }, // MOCKED
        ],
      };
    });
};

export const createCurrrentWalletInfo = (stores: any): any => {
  const { wallets, transactions, delegation, tokenInfoStore, coinPriceStore, profile } = stores;

  try {
    const walletCurrentPoolInfo = getStakePoolMeta(stores);

    const selectedWallet = wallets.selected;
    if (selectedWallet == null) {
      throw new Error(`no selected Wallet. Should never happen`);
    }

    const currentWalletId = selectedWallet.getPublicDeriverId();
    const networkInfo = selectedWallet.getParent().getNetworkInfo();
    const networkId = networkInfo.NetworkId;

    // Backend services
    const backendService = selectedWallet.getParent().getNetworkInfo().Backend.BackendService;
    const backendServiceZero = selectedWallet.getParent().getNetworkInfo().Backend.BackendServiceZero;

    // Total Ada balance calculation
    const balance = transactions.getBalance(selectedWallet);
    const rewards = delegation.getRewardBalanceOrZero(selectedWallet);
    const totalAmount = getTotalAmount(balance, rewards);
    const defaultEntry = totalAmount?.getDefaultEntry();
    const getTokenInfo = genLookupOrFail(tokenInfoStore?.tokenInfo);
    const tokenInfo = getTokenInfo(defaultEntry);
    console.log('tokenInfotokenInfotokenInfo', tokenInfo);
    const shiftedAmount = defaultEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);
    const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(shiftedAmount, tokenInfo.Metadata.numberOfDecimals);

    // Get Fiat price
    const ticker = tokenInfo.Metadata.ticker;
    const { currency } = profile.unitOfAccount;
    const getFiatCurrentPrice = coinPriceStore.getCurrentPrice;
    const fiatPrice = getFiatCurrentPrice(ticker, currency);
    const fiatDisplay = calculateAndFormatValue(shiftedAmount, fiatPrice);

    // Asset List
    const assetList = getAssetWalletAssetList(stores);

    return {
      currentPool: walletCurrentPoolInfo,
      networkId,
      walletId: currentWalletId,
      selectedWallet: selectedWallet,
      backendService,
      backendServiceZero,
      primaryTokenInfo: tokenInfo,
      walletBalance: {
        ada: `${beforeDecimalRewards}${afterDecimalRewards}`,
        fiatAmount: fiatDisplay || 0,
        currency: currency,
        percents: 0.0, //(Math.random()), NOT USED - will be deteled
        amount: 0.0, //(Math.random()), NOT USED - will be deteled
      },
      assetList: assetList,
      nftList: [],
    };
  } catch (error) {
    console.warn('ERROR trying to create wallet info', error);
  }
};
