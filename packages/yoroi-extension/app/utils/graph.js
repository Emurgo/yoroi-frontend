// @flow
import type { GraphData } from '../components/wallet/staking/dashboard/StakingDashboard';
import type { GraphItems } from '../components/wallet/staking/dashboard/GraphWrapper';
import {
  getCardanoHaskellBaseConfig,
  isCardanoHaskell,
  getNetworkById,
} from '../api/ada/lib/storage/database/prepackaged/networks';
import { MultiToken } from '../api/common/lib/MultiToken';
import type { PoolMeta, DelegationRequests } from '../stores/toplevel/DelegationStore';
import type { TokenInfoMap } from '../stores/toplevel/TokenInfoStore';

const generateRewardGraphData: ({|
  delegationRequests: DelegationRequests,
  currentEpoch: number,
  networkId: number,
  defaultTokenId: string,
  getLocalPoolInfo: (number, string) => void | PoolMeta,
  tokenInfo: TokenInfoMap,
|}) => ?{|
  totalRewards: Array<GraphItems>,
  perEpochRewards: Array<GraphItems>,
|} = request => {
  const defaultToken = {
    defaultNetworkId: request.networkId,
    defaultIdentifier: request.defaultTokenId
  };
  const network = getNetworkById(request.networkId);

  const history = request.delegationRequests.rewardHistory.result;
  if (history == null) {
    return null;
  }
  let historyIterator = 0;

  // the reward history endpoint doesn't contain entries when the reward was 0
  // so we need to insert these manually
  const totalRewards: Array<GraphItems> = [];
  const perEpochRewards: Array<GraphItems> = [];
  let amountSum = new MultiToken([], defaultToken);

  const startEpoch = (() => {
    if (isCardanoHaskell(network)) {
      const shelleyConfig = getCardanoHaskellBaseConfig(
        network
      )[1];
      return shelleyConfig.StartAt;
    }
    return 0;
  })();
  const endEpoch = (() => {
    if (isCardanoHaskell(network)) {
      // TODO: -1 since cardano-db-sync doesn't expose this information for some reason
      return request.currentEpoch - 1;
    }
    throw new Error(`${nameof(generateRewardGraphData)} can't compute endEpoch for rewards`);
  })();

  const getMiniPoolInfo = (poolHash: string) => {
    const meta = request.getLocalPoolInfo(
      request.networkId,
      poolHash
    );
    if (meta == null || meta.info == null || meta.info.ticker == null || meta.info.name == null) {
      return poolHash;
    }
    return `[${meta.info.ticker}] ${meta.info.name}`;
  };

  const getNormalized = tokenEntry => {
    const tokenRow = request.tokenInfo
      .get(tokenEntry.networkId.toString())
      ?.get(tokenEntry.identifier);
    if (tokenRow == null)
      throw new Error(
        `${nameof(generateRewardGraphData)} no token info for ${JSON.stringify(tokenEntry)}`
      );
    return tokenEntry.amount.shiftedBy(-tokenRow.Metadata.numberOfDecimals);
  };
  for (let i = startEpoch; i < endEpoch; i++) {
    if (historyIterator < history.length && i === history[historyIterator][0]) {
      // exists a reward for this epoch
      const poolHash = history[historyIterator][2];
      const nextReward = history[historyIterator][1];
      amountSum = amountSum.joinAddMutable(nextReward);
      totalRewards.push({
        name: i,
        primary: getNormalized(amountSum.getDefaultEntry()).toNumber(),
        poolName: getMiniPoolInfo(poolHash),
      });
      perEpochRewards.push({
        name: i,
        primary: getNormalized(nextReward.getDefaultEntry()).toNumber(),
        poolName: getMiniPoolInfo(poolHash),
      });
      historyIterator++;
    } else {
      // no reward for this epoch
      totalRewards.push({
        name: i,
        primary: getNormalized(amountSum.getDefaultEntry()).toNumber(),
        poolName: '',
      });
      perEpochRewards.push({
        name: i,
        primary: 0,
        poolName: '',
      });
    }
  }

  return {
    totalRewards,
    perEpochRewards,
  };
};

export const generateGraphData: ({|
  delegationRequests: DelegationRequests,
  networkId: number,
  defaultTokenId: string,
  currentEpoch: number,
  shouldHideBalance: boolean,
  getLocalPoolInfo: (number, string) => void | PoolMeta,
  tokenInfo: TokenInfoMap,
|}) => GraphData = request => {
  return {
    rewardsGraphData: {
      error: request.delegationRequests.rewardHistory.error,
      items: generateRewardGraphData({
        delegationRequests: request.delegationRequests,
        currentEpoch: request.currentEpoch,
        networkId: request.networkId,
        defaultTokenId: request.defaultTokenId,
        getLocalPoolInfo: request.getLocalPoolInfo,
        tokenInfo: request.tokenInfo,
      }),
      hideYAxis: request.shouldHideBalance,
    },
  };
};
