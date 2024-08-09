import BigNumber from 'bignumber.js';
import { WalletTypeOption } from '../../../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import { maybe } from '../../../../coreUtils';
import { genLookupOrFail } from '../../../../stores/stateless/tokenHelpers';
import { calculateAndFormatValue } from '../../../../utils/unit-of-account';

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

export const createCurrrentWalletInfo = (stores: any) => {
  const { wallets } = stores;
  const walletCurrentPoolInfo = getStakePoolMeta(stores);

  const selectedWallet = wallets.selected;
  if (selectedWallet == null) {
    throw new Error(`no selected Wallet. Should never happen`);
  }

  const walletAdaBalance = getWalletTotalAdaBalance(stores, selectedWallet);

  const isHardware = selectedWallet.getParent().getWalletType() === WalletTypeOption.HARDWARE_WALLET;
  const currentWalletId = selectedWallet.getPublicDeriverId();
  const networkInfo = selectedWallet.getParent().getNetworkInfo();
  const networkId = networkInfo.NetworkId;
  const backendService = selectedWallet.getParent().getNetworkInfo().Backend.BackendService;
  const backendServiceZero = selectedWallet.getParent().getNetworkInfo().Backend.BackendServiceZero;
  return {
    currentPool: walletCurrentPoolInfo,
    networkId,
    walletId: currentWalletId,
    selectedWallet: selectedWallet,
    walletAdaBalance: walletAdaBalance.toNumber(),
    unitOfAccount: stores.profile.unitOfAccount,
    defaultTokenInfo: stores.tokenInfoStore.getDefaultTokenInfoSummary(networkId),
    getCurrentPrice: stores.coinPriceStore.getCurrentPrice,
    isHardwareWallet: isHardware,
    backendService,
    backendServiceZero,
  };
};

// <TODO:DEDUPLICATE> extract this and fix all places where it's duplicated
export const getFormattedPairingValue = (getCurrentPrice, defaultTokenInfo, unitOfAccount, lovelaces: string): string => {
  const { currency } = unitOfAccount;
  if (currency == null || defaultTokenInfo.ticker == null) return '-';
  const price = getCurrentPrice(defaultTokenInfo.ticker, currency);
  const shiftedAmount = new BigNumber(lovelaces).shiftedBy(-(defaultTokenInfo.decimals ?? 0));
  const val = price ? calculateAndFormatValue(shiftedAmount, price) : '-';
  return `${val} ${currency}`;
};

const getTotalAmount = (walletAmount, rewards) => {
  return maybe(walletAmount, w => rewards.joinAddCopy(w));
};

const getWalletTotalAdaBalance = (stores, selectedWallet) => {
  const totalAmount = stores.transactions.getBalance(selectedWallet);
  const rewards = stores.delegation.getRewardBalanceOrZero(selectedWallet);
  const amount = getTotalAmount(totalAmount, rewards);
  const defaultEntry = amount.getDefaultEntry();
  const getTokenInfo = genLookupOrFail(stores.tokenInfoStore.tokenInfo);
  const tokenInfo = getTokenInfo(defaultEntry);
  return defaultEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);
};
