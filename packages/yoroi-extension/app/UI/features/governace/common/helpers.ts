import BigNumber from 'bignumber.js';
import moment from 'moment';
import { genLookupOrFail } from '../../../../stores/stateless/tokenHelpers';
import { calculateAndFormatValue } from '../../../../utils/unit-of-account';
import { getNetworkById } from '../../../../api/ada/lib/storage/database/prepackaged/networks';

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

  const selectedWallet/*: WalletState */ = wallets.selectedOrFail;
  const walletAdaBalance/*: MultiToken */ = getWalletTotalAdaBalance(stores, selectedWallet);

  const isHardware: boolean = selectedWallet.isHardware;
  const walletId: number = selectedWallet.publicDeriverId;
  const networkId = selectedWallet.networkId;
  const networkInfo/*: $ReadOnly<NetworkRow> */ = getNetworkById(selectedWallet.networkId);
  const { BackendService, BackendServiceZero } = networkInfo.Backend;

  const groupedTx = groupTransactionsByDay(stores.transactions.recent);
  return {
    currentPool: walletCurrentPoolInfo,
    networkId,
    walletId,
    selectedWallet,
    walletAdaBalance: walletAdaBalance.toNumber(),
    unitOfAccount: stores.profile.unitOfAccount,
    defaultTokenInfo: stores.tokenInfoStore.getDefaultTokenInfoSummary(networkId),
    getCurrentPrice: stores.coinPriceStore.getCurrentPrice,
    recentTransactions: groupedTx ? groupedTx : [],
    submitedTransactions: stores.transactions.submitted,
    isHardwareWallet: isHardware,
    backendService: BackendService,
    backendServiceZero: BackendServiceZero,
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

const combinedMultiToken = (
  walletAmount/*: MultiToken */,
  rewards/*: MultiToken */,
)/*: MultiToken */ => {
  return walletAmount && rewards
    ? walletAmount.joinAddCopy(rewards)
    : (walletAmount ?? rewards);
};

const getWalletTotalAdaBalance = (stores, selectedWallet/*: WalletState */)/*: MultiToken */ => {
  const balance = selectedWallet.balance;
  const rewardBalance/*: MultiToken */ = stores.delegation.getRewardBalanceOrZero(selectedWallet);
  const totalBalance/*: MultiToken */ = combinedMultiToken(balance, rewardBalance);
  const defaultEntry = totalBalance?.getDefaultEntry();
  if (defaultEntry == null) return new BigNumber(0);
  const getTokenInfo = genLookupOrFail(stores.tokenInfoStore.tokenInfo);
  const tokenInfo = getTokenInfo(defaultEntry);
  return defaultEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);
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
