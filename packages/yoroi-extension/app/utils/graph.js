// @flow
import type { GraphData } from '../components/wallet/staking/dashboard/StakingDashboard';
import type { GraphItems } from '../components/wallet/staking/dashboard/GraphWrapper';
import {
  getCardanoHaskellBaseConfig,
  isCardanoHaskell,
} from '../api/ada/lib/storage/database/prepackaged/networks';
import { MultiToken } from '../api/common/lib/MultiToken';
import { PublicDeriver } from '../api/ada/lib/storage/models/PublicDeriver/index';
import type { NetworkRow } from '../api/ada/lib/storage/database/primitives/tables';
import type { PoolMeta, DelegationRequests } from '../stores/toplevel/DelegationStore';
import type { TokenInfoMap } from '../stores/toplevel/TokenInfoStore';

const generateRewardGraphData: ({|
  delegationRequests: DelegationRequests,
  currentEpoch: number,
  publicDeriver: PublicDeriver<>,
  getLocalPoolInfo: ($ReadOnly<NetworkRow>, string) => void | PoolMeta,
  tokenInfo: TokenInfoMap,
|}) => ?{|
  totalRewards: Array<GraphItems>,
  perEpochRewards: Array<GraphItems>,
|} = request => {
  const defaultToken = request.publicDeriver.getParent().getDefaultToken();

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
    if (isCardanoHaskell(request.publicDeriver.getParent().getNetworkInfo())) {
      const shelleyConfig = getCardanoHaskellBaseConfig(
        request.publicDeriver.getParent().getNetworkInfo()
      )[1];
      return shelleyConfig.StartAt;
    }
    return 0;
  })();
  const endEpoch = (() => {
    if (isCardanoHaskell(request.publicDeriver.getParent().getNetworkInfo())) {
      // TODO: -1 since cardano-db-sync doesn't expose this information for some reason
      return request.currentEpoch - 1;
    }
    throw new Error(`${nameof(generateRewardGraphData)} can't compute endEpoch for rewards`);
  })();

  const getMiniPoolInfo = (poolHash: string) => {
    const meta = request.getLocalPoolInfo(
      request.publicDeriver.getParent().getNetworkInfo(),
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
  publicDeriver: PublicDeriver<>,
  currentEpoch: number,
  shouldHideBalance: boolean,
  getLocalPoolInfo: ($ReadOnly<NetworkRow>, string) => void | PoolMeta,
  tokenInfo: TokenInfoMap,
|}) => GraphData = request => {
  return {
    rewardsGraphData: {
      error: request.delegationRequests.rewardHistory.error,
      items: generateRewardGraphData({
        delegationRequests: request.delegationRequests,
        currentEpoch: request.currentEpoch,
        publicDeriver: request.publicDeriver,
        getLocalPoolInfo: request.getLocalPoolInfo,
        tokenInfo: request.tokenInfo,
      }),
      hideYAxis: request.shouldHideBalance,
    },
  };
};
