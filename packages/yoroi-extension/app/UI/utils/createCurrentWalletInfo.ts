import BigNumber from 'bignumber.js';
import moment from 'moment';
import { getNetworkById } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { maybe } from '../../coreUtils';
import { genLookupOrFail, getTokenIdentifierIfExists, getTokenStrictName } from '../../stores/stateless/tokenHelpers';
import { splitAmount, truncateToken } from '../../utils/formatters.js';
import { cardanoAdaBase64Logo } from '../features/portfolio/common/helpers/constants';
import { CurrentWalletType } from '../types/currrentWallet';

// TODO To be added and constructed from wallet apo
const primaryTokenFullInfo = {
  application: 'coin',
  decimals: 6,
  description: 'Cardano',
  fingerprint: '',
  id: '.',
  name: 'ADA',
  nature: 'primary',
  originalImage: '',
  reference: '',
  status: 'valid',
  symbol: '₳',
  tag: '',
  ticker: 'ADA',
  type: 'ft',
  website: 'https://www.cardano.org/',
};

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

const getAssetWalletAssetList = (stores: any) => {
  const spendableBalance = stores.transactions.balance;
  const getTokenInfo = genLookupOrFail(stores.tokenInfoStore.tokenInfo);
  if (spendableBalance == null) return [];
  return [spendableBalance.getDefaultEntry(), ...spendableBalance.nonDefaultEntries()]
    .map((entry: any) => ({
      entry,
      info: getTokenInfo(entry),
    }))
    .filter((item: any) => item.info.IsNFT === false)
    .map((token: any) => {
      const numberOfDecimals = token.info?.Metadata.numberOfDecimals ?? 0;
      const tokenName = truncateToken(getTokenStrictName(token.info).name ?? '-');
      const tokenId = getTokenIdentifierIfExists(token.info) ?? '-';
      const tokenLogo = `data:image/png;base64,${
        token.info.Metadata.policyId === '' ? cardanoAdaBase64Logo : token.info.Metadata.logo
      }`;
      const shiftedAmount = token.entry.amount.shiftedBy(-numberOfDecimals);
      const [beforeDecimal, afterDecimal] = splitAmount(shiftedAmount, numberOfDecimals);

      return {
        assetName: token.info.Metadata.assetName,
        quantity: asQuantity(token.entry.amount),
        id: tokenId,
        formatedAmount: [beforeDecimal, afterDecimal].join(''),

        info: {
          id: token.entry.identifier,
          name: tokenName,
          policyId: token.info.Metadata.policyId,
          fingerprint: tokenId,
          metadata: extractMetadataInfo({ metadata: token.info.Metadata?.assetMintMetadata?.[0] || null }),
          numberOfDecimals,
          image: tokenLogo,
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

export const createCurrrentWalletInfo = (stores: any): CurrentWalletType | undefined => {
  const { wallets, delegation, tokenInfoStore } = stores;

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

    const isHardware: boolean = selectedWallet.isHardware;

    // Asset List
    const ftAssetList = getAssetWalletAssetList(stores);

    const groupedTx = groupTransactionsByDay(stores.transactions.recent);

    return {
      currentPool: walletCurrentPoolInfo,
      networkId,
      walletId: currentWalletId,
      selectedWallet: selectedWallet,
      walletAdaBalance: walletAdaBalance.toNumber(),
      unitOfAccount: stores.profile.unitOfAccount,
      defaultTokenInfo: stores.tokenInfoStore.getDefaultTokenInfoSummary(networkId),
      recentTransactions: groupedTx ? groupedTx : [],
      submitedTransactions: selectedWallet.submittedTransactions,
      backendService: BackendService,
      backendServiceZero: BackendServiceZero,
      isHardwareWallet: isHardware,
      primaryTokenInfo: { ...primaryTokenFullInfo, quantity: shiftedAmount },
      stakingAddress: selectedWallet.stakingAddress,
      walletBalance: {
        ada: `${beforeDecimalRewards}${afterDecimalRewards}`,
      },
      ftAssetList: ftAssetList,
    };
  } catch (error) {
    console.warn('ERROR trying to create wallet info', error);
    return undefined;
  }
};

export const asQuantity = (value: BigNumber | number | string) => {
  const bn = new BigNumber(value);
  if (bn.isNaN() || !bn.isFinite()) {
    throw new Error('Invalid quantity');
  }
  return bn;
};

type Metadata = {
  metadata?: {
    [key: string]: {
      [key: string]: {
        [tokenName: string]: {
          name?: string;
          website?: string;
          description?: string;
          desc?: string;
          url?: string;
        };
      };
    };
  };
};

export const extractMetadataInfo = (metadataObj: Metadata) => {
  if (!metadataObj.metadata) {
    return { name: null, website: null, description: null };
  }
  const tokenInfo = Object.values(metadataObj.metadata).flatMap(chain =>
    Object.values(chain).flatMap(tokens => Object.values(tokens))
  );
  for (const info of tokenInfo) {
    return { website: info?.url || info?.website, description: info?.desc };
  }

  return null;
};
