import { maybe } from '../../coreUtils';
import { genLookupOrFail } from '../../stores/stateless/tokenHelpers';
import { splitAmount } from '../../utils/formatters.js';
import { calculateAndFormatValue } from '../../utils/unit-of-account';

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
    const shiftedAmount = defaultEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);
    const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(shiftedAmount, tokenInfo.Metadata.numberOfDecimals);

    // Get Fiat price
    const ticker = tokenInfo.Metadata.ticker;
    const getFiatCurrentPrice = coinPriceStore.getCurrentPrice;
    const { currency } = profile.unitOfAccount;
    const fiatPrice = getFiatCurrentPrice(ticker, currency);
    const fiatDisplay = calculateAndFormatValue(shiftedAmount, fiatPrice);

    console.log('tokenInfo', tokenInfo);

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
        percents: 0.0, //(Math.random()),
        amount: 0.0, //(Math.random()),
      },
    };
  } catch (error) {
    console.warn('ERROR trying to create wallet info', error);
  }
};
