import BigNumber from 'bignumber.js';
import moment from 'moment';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { getNetworkById } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { maybe } from '../../coreUtils';
import { genLookupOrFail, getTokenIdentifierIfExists, getTokenStrictName } from '../../stores/stateless/tokenHelpers';
import { splitAmount, truncateToken } from '../../utils/formatters.js';
import { getImageFromTokenMetadata } from '../../utils/nftMetadata';
import { cardanoAdaBase64Logo } from '../features/portfolio/common/helpers/constants';
import { CurrentWalletType } from '../types/currrentWallet';
import { networkConfigs } from './network-config';

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

export const getTotalAmount = (walletAmount, rewards) => {
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

const getFTAssetWalletAssetList = (stores: any, noFilter: boolean) => {
  const spendableBalance = stores.transactions.balance;
  const getTokenInfo = genLookupOrFail(stores.tokenInfoStore.tokenInfo);
  if (spendableBalance == null) return [];
  return [spendableBalance.getDefaultEntry(), ...spendableBalance.nonDefaultEntries()]
    .map((entry: any) => ({
      entry,
      info: getTokenInfo(entry),
    }))
    .filter((item: any) => {
      if (noFilter) {
        return item;
      }
      return item.info.IsNFT === false;
    })

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
        shiftedAmount,
        info: {
          id: token.entry.identifier,
          name: tokenName,
          policyId: token.info.Metadata.policyId,
          fingerprint: tokenId,
          metadata: extractMetadataInfo({
            metadata:
              token.info.Metadata?.assetMintMetadata?.length > 0 ? token.info.Metadata?.assetMintMetadata[0] || null : null,
          }),
          numberOfDecimals,
          image: tokenLogo,
        },
      };
    });
};

const getNFTAssetWalletAssetList = (stores: any) => {
  const spendableBalance = stores.transactions.balance;
  const getTokenInfo = genLookupOrFail(stores.tokenInfoStore.tokenInfo);

  const nftsList = (() => {
    if (spendableBalance == null) return [];
    return [...spendableBalance.nonDefaultEntries()]
      .map(entry => ({
        entry,
        info: getTokenInfo(entry),
      }))
      .filter(item => item.info.IsNFT)
      .map(token => {
        const split = token.entry.identifier.split('.');
        const policyId = split[0];
        const hexName = split[1] ?? '';
        const fullName = getTokenStrictName(token.info).name;
        const name = truncateToken(fullName ?? '-');
        return {
          name,
          id: getTokenIdentifierIfExists(token.info) ?? '-',
          image: getImageFromTokenMetadata(policyId, hexName, token.info.Metadata),
        };
      });
  })();

  return nftsList;
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
  const { wallets, delegation, tokenInfoStore, explorers } = stores;

  try {
    const walletCurrentPoolInfo = getStakePoolMeta(stores);

    const selectedWallet /*: WalletState */ = wallets.selectedOrFail;
    const walletAdaBalance /*: MultiToken */ = getWalletTotalAdaBalance(stores, selectedWallet);

    if (selectedWallet == null) {
      throw new Error(`no selected Wallet. Should never happen`);
    }

    const allWalletAddresses = selectedWallet?.allAddresses?.utxoAddresses?.map(a => {
      if (a.address?.Hash) {
        return RustModule.WalletV4.Address.from_hex(a.address?.Hash).to_bech32();
      }
    });

    const isStakeRegistered = stores.delegation.isStakeRegistered(selectedWallet.publicDeriverId);
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

    // FT Asset List
    const ftAssetList = getFTAssetWalletAssetList(stores, false);
    // All Assets LIst
    const allAssetList = getFTAssetWalletAssetList(stores, true);
    // NFT Asset List
    const nftAssetList = getNFTAssetWalletAssetList(stores);

    const groupedTx = groupTransactionsByDay(stores.transactions.recent);

    const selectedExplorer = explorers.selectedExplorer.get(networkId);
    const explorerTransactionInfo = selectedExplorer.getOrDefault('token');
    const primaryTokenInfo = networkConfigs[networkId].primaryTokenInfo;
    const delegatedRewards = stores.delegation.getRewardBalanceOrZero(selectedWallet);

    const getRewardAmount = token => {
      return maybe(token, t => formatTokenEntry(t.getDefaultEntry(), getTokenInfo));
    };

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
      primaryTokenInfo: { ...primaryTokenInfo, quantity: shiftedAmount },
      stakingAddress: selectedWallet.stakingAddress,
      walletBalance: {
        ada: `${beforeDecimalRewards}${afterDecimalRewards}`,
      },
      ftAssetList: ftAssetList,
      nftAssetList: nftAssetList,
      allAssetList,
      walletAddresses: allWalletAddresses,
      explorer: { tokenInfo: explorerTransactionInfo },
      selectedExplorer: selectedExplorer,
      walletType: selectedWallet.type,
      isStakeRegistered,
      stakingRewards: getRewardAmount(delegatedRewards),
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

const formatTokenEntry = (tokenEntry, getTokenInfo) => {
  const tokenInfo = getTokenInfo(tokenEntry);
  return tokenEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);
};
