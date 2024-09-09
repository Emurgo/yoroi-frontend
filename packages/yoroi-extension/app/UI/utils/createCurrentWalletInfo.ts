import BigNumber from 'bignumber.js';
import moment from 'moment';
import { getNetworkById } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { maybe } from '../../coreUtils';
import { genLookupOrFail, getTokenIdentifierIfExists, getTokenStrictName } from '../../stores/stateless/tokenHelpers';
import { splitAmount, truncateToken } from '../../utils/formatters.js';
import { calculateAndFormatValue } from '../../utils/unit-of-account';
import { cardanoAdaBase64Logo } from '../features/portfolio/common/helpers/constants';

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

const combinedMultiToken = (walletAmount /*: MultiToken */, rewards /*: MultiToken */) /*: MultiToken */ => {
  return walletAmount && rewards ? walletAmount.joinAddCopy(rewards) : walletAmount ?? rewards;
};

const getWalletTotalAdaBalance = (stores, selectedWallet /*: WalletState */) /*: MultiToken */ => {
  const balance = selectedWallet.balance;
  const rewardBalance /*: MultiToken */ = stores.delegation.getRewardBalanceOrZero(selectedWallet);
  const totalBalance /*: MultiToken */ = combinedMultiToken(balance, rewardBalance);
  const defaultEntry = totalBalance?.getDefaultEntry();
  if (defaultEntry == null) return new BigNumber(0);
  const getTokenInfo = genLookupOrFail(stores.tokenInfoStore.tokenInfo);
  const tokenInfo = getTokenInfo(defaultEntry);
  return defaultEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);
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
        tokenLogo: tokenLogo,
        ...token.info.Metadata,
        totalAmountFiat: Math.round(100000 * Math.random()), // MOCKED
        price: 0.223, // MOCKED
        '24h': -(10 * Math.random()), // MOCKED
        '1W': 10 * Math.random(), // MOCKED
        '1M': 10 * Math.random(), // MOCKED
        portfolioPercents: Math.round(100 * Math.random()), // MOCKED

        // The below properties are used only in token details page
        chartData: {},
        performance: [],
        overview: {
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, ",
          website: 'https://www.cardano.org',
          detailOn: 'https://www.yoroiwallet.com',
          policyId: '2aa9c1557fcf8e7caa049fa0911a8724a1cdaf8037fe0b431c6ac664',
          fingerprint:
            'asset311q8dhlxmgagkx0ldt4xc7wzdv2wza8gu2utxw294sr23zuc8dhlxmgagkx0ldt4xc7wzk8213yjnad98h1n1j99naskajsj6789',
        },
      };
    });
};

const dateFormat = 'YYYY-MM-DD';

const groupTransactionsByDay = transactions => {
  const groups: any = [];
  for (const transaction of transactions) {
    const date: string = moment(transaction.date).format(dateFormat);
    // find the group this transaction belongs in
    let group = groups.find(g => g.date === date);
    // if first transaction in this group, create the group
    if (!group) {
      group = { date, transactions: [] };
      groups.push(group);
    }
    group.transactions.push(transaction);
  }
  return groups.sort((a, b) => b.transactions[0].date.getTime() - a.transactions[0].date.getTime());
};

export const createCurrrentWalletInfo = (stores: any): any => {
  const { wallets, delegation, tokenInfoStore, coinPriceStore, profile } = stores;

  try {
    const walletCurrentPoolInfo = getStakePoolMeta(stores);

    const selectedWallet /*: WalletState */ = wallets.selectedOrFail;
    const walletAdaBalance /*: MultiToken */ = getWalletTotalAdaBalance(stores, selectedWallet);

    if (selectedWallet == null) {
      throw new Error(`no selected Wallet. Should never happen`);
    }

    const currentWalletId = selectedWallet.publicDeriverId;
    const networkId = selectedWallet.networkId;

    // Backend services
    const { Backend } = getNetworkById(networkId);
    const { BackendService, BackendServiceZero } = Backend;

    // Total Ada balance calculation
    const rewards = delegation.getRewardBalanceOrZero(selectedWallet);
    const balance = selectedWallet.balance;
    const totalBalanceAmount = getTotalAmount(balance, rewards);

    const defaultEntry = totalBalanceAmount?.getDefaultEntry();
    const getTokenInfo = genLookupOrFail(tokenInfoStore?.tokenInfo);
    const tokenInfo = getTokenInfo(defaultEntry);
    const shiftedAmount = defaultEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);
    const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(shiftedAmount, tokenInfo.Metadata.numberOfDecimals);

    // Get Fiat price
    const ticker = tokenInfo.Metadata.ticker;
    const { currency } = profile.unitOfAccount;
    const getFiatCurrentPrice = coinPriceStore.getCurrentPrice;
    const fiatPrice = getFiatCurrentPrice(ticker, currency === null ? 'USD' : currency);
    const fiatDisplay = calculateAndFormatValue(shiftedAmount, fiatPrice);
    const isHardware: boolean = selectedWallet.isHardware;

    // Asset List
    const assetList = getAssetWalletAssetList(stores);

    const groupedTx = groupTransactionsByDay(stores.transactions.recent);

    return {
      currentPool: walletCurrentPoolInfo,
      networkId,
      walletId: currentWalletId,
      selectedWallet: selectedWallet,
      walletAdaBalance: walletAdaBalance.toNumber(),
      unitOfAccount: stores.profile.unitOfAccount,
      defaultTokenInfo: stores.tokenInfoStore.getDefaultTokenInfoSummary(networkId),
      getCurrentPrice: stores.coinPriceStore.getCurrentPrice,
      recentTransactions: groupedTx ? groupedTx : [],
      submitedTransactions: selectedWallet.submittedTransactions,
      backendService: BackendService,
      backendServiceZero: BackendServiceZero,
      isHardwareWallet: isHardware,
      primaryTokenInfo: tokenInfo,
      walletBalance: {
        ada: `${beforeDecimalRewards}${afterDecimalRewards}`,
        fiatAmount: fiatDisplay || 0,
        currency: currency === null ? 'USD' : currency,
      },
      assetList: assetList,
      nftList: [],
    };
  } catch (error) {
    console.warn('ERROR trying to create wallet info', error);
  }
};
