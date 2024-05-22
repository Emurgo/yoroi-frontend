// @flow

import { action, reaction, runInAction } from 'mobx';
import BigNumber from 'bignumber.js';
import Store from '../base/Store';
import { Logger, stringifyError } from '../../utils/logging';
import CachedRequest from '../lib/LocalizedCachedRequest';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { asGetStakingKey } from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { getDelegatedBalance } from '../../api/ada/lib/storage/bridge/delegationUtils';
import { isCardanoHaskell } from '../../api/ada/lib/storage/database/prepackaged/networks';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import type { MangledAmountFunc } from '../stateless/mangledAddresses';
import { getUnmangleAmounts } from '../stateless/mangledAddresses';
import { MultiToken } from '../../api/common/lib/MultiToken';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import { PoolInfoApi } from '@emurgo/yoroi-lib';
import { entriesIntoMap } from '../../coreUtils';
import type { PoolInfo } from '@emurgo/yoroi-lib';
import type { PoolInfoResponse, RemotePool } from '../../api/ada/lib/state-fetch/types';
import type {
  GetDelegatedBalanceFunc,
  RewardHistoryFunc,
} from '../../api/ada/lib/storage/bridge/delegationUtils';

export default class AdaDelegationStore extends Store<StoresMap, ActionsMap> {
  _recalculateDelegationInfoDisposer: Array<(void) => void> = [];

  @action addObservedWallet: (PublicDeriver<>) => void = publicDeriver => {
    this.stores.delegation.delegationRequests.push({
      publicDeriver,
      mangledAmounts: new CachedRequest<MangledAmountFunc>(getUnmangleAmounts),
      getDelegatedBalance: new CachedRequest<GetDelegatedBalanceFunc>(getDelegatedBalance),
      rewardHistory: new CachedRequest<RewardHistoryFunc>(async address => {
        // we need to defer this call because the store may not be initialized yet
        // by the time this constructor is called
        const stateFetcher = this.stores.substores.ada.stateFetchStore.fetcher;
        const historyResult = await stateFetcher.getRewardHistory({
          network: publicDeriver.getParent().getNetworkInfo(),
          addresses: [address],
        });

        const defaultToken = publicDeriver.getParent().getDefaultToken();
        const addressRewards = historyResult[address]
          ?.sort((a, b) => a.epoch - b.epoch)
          .map(
            info =>
              ([
                info.epoch,
                new MultiToken(
                  [
                    {
                      amount: new BigNumber(info.reward),
                      identifier: defaultToken.defaultIdentifier,
                      networkId: defaultToken.defaultNetworkId,
                    },
                  ],
                  defaultToken
                ),
                info.poolHash,
              ]: [number, MultiToken, string])
          );
        return addressRewards != null ? addressRewards : [];
      }),
      error: undefined,
    });
  };

  setup(): void {
    super.setup();
    this.reset();
    this._startWatch();
  }

  refreshDelegation: (PublicDeriver<>) => Promise<void> = async publicDeriver => {
    const delegationRequest = this.stores.delegation.getDelegationRequests(publicDeriver);
    if (delegationRequest == null) return;

    try {
      await delegationRequest.mangledAmounts.execute({
        publicDeriver,
      }).promise;

      runInAction(() => {
        delegationRequest.error = undefined;
      });

      const defaultToken = publicDeriver.getParent().getDefaultToken();

      const withStakingKey = asGetStakingKey(publicDeriver);
      if (withStakingKey == null) {
        throw new Error(`${nameof(this.refreshDelegation)} missing staking key functionality`);
      }

      const stakingKeyResp = await withStakingKey.getStakingKey();

      const accountStateCalcs = (async () => {
        try {
          const stateFetcher = this.stores.substores.ada.stateFetchStore.fetcher;
          const accountStateResp = await stateFetcher.getAccountState({
            network: publicDeriver.getParent().getNetworkInfo(),
            addresses: [stakingKeyResp.addr.Hash],
          });
          const stateForStakingKey = accountStateResp[stakingKeyResp.addr.Hash];
          const delegatedPoolId = stateForStakingKey?.delegation;
          const delegatedBalance = delegationRequest.getDelegatedBalance.execute({
            publicDeriver: withStakingKey,
            rewardBalance: new MultiToken(
              [
                {
                  amount: new BigNumber(stateForStakingKey?.remainingAmount ?? 0),
                  networkId: defaultToken.defaultNetworkId,
                  identifier: defaultToken.defaultIdentifier,
                },
              ],
              defaultToken
            ),
            stakingAddress: stakingKeyResp.addr.Hash,
            delegation: delegatedPoolId ?? null,
            allRewards: stateForStakingKey?.rewards ?? null,
            stakeRegistered: stateForStakingKey?.stakeRegistered,
          }).promise;
          if (delegatedBalance == null) throw new Error('Should never happen');

          const updatePool =
            delegatedPoolId != null
              ? this.updatePoolInfo({
                  network: publicDeriver.getParent().getNetworkInfo(),
                  allPoolIds: [delegatedPoolId],
                })
              : Promise.resolve();

          return await Promise.all([updatePool, delegatedBalance]);
        } catch (e) {
          runInAction(() => {
            delegationRequest.error = e;
          });
        }
      })();

      const rewardHistory = delegationRequest.rewardHistory.execute(stakingKeyResp.addr.Hash)
        .promise;

      await Promise.all([accountStateCalcs, rewardHistory]);
    } catch (e) {
      Logger.error(
        `${nameof(AdaDelegationStore)}::${nameof(this.refreshDelegation)} error: ` +
          stringifyError(e)
      );
    }
  };

  updatePoolInfo: ({|
    network: $ReadOnly<NetworkRow>,
    allPoolIds: Array<string>,
  |}) => Promise<void> = async request => {
    // update pool information
    const poolsCachedForNetwork = new Set<string>(
      this.stores.delegation.poolInfo
        .filter(next => next.networkId === request.network.NetworkId)
        .map(next => next.poolId)
    );
    const poolsToQuery = request.allPoolIds.filter(pool => !poolsCachedForNetwork.has(pool));
    const stateFetcher = this.stores.substores.ada.stateFetchStore.fetcher;
    const poolInfoPromise: Promise<PoolInfoResponse> = stateFetcher.getPoolInfo({
      network: request.network,
      poolIds: poolsToQuery,
    });
    const remotePoolInfoPromises: Array<Promise<[string, PoolInfo | null]>> = poolsToQuery.map(id =>
      new PoolInfoApi().getPool(id).then(res => [id, res])
    );
    const [poolInfoResp, remotePoolInfoResps]: [
      PoolInfoResponse,
      Array<[string, PoolInfo | null]>
    ] = await Promise.all([poolInfoPromise, Promise.all(remotePoolInfoPromises)]);
    const remoteInfoMap = entriesIntoMap<string, PoolInfo | null>(remotePoolInfoResps);
    runInAction(() => {
      for (const poolId of Object.keys(poolInfoResp)) {
        const poolInfo: RemotePool | null = poolInfoResp[poolId];
        const poolRemoteInfo = remoteInfoMap[poolId];
        if (poolInfo == null) continue;
        this.stores.delegation.poolInfo.push({
          networkId: request.network.NetworkId,
          poolId,
          poolInfo: {
            poolId,
            info: {
              name: poolInfo.info.name,
              ticker: poolInfo.info.ticker,
              description: poolInfo.info.description,
              homepage: poolInfo.info.homepage,
            },
            history: poolInfo.history,
          },
          poolRemoteInfo,
        });
      }
    });
  };

  @action.bound
  _startWatch: void => void = () => {
    const triggerRefresh = async () => {
      if (!this.stores.serverConnectionStore.checkAdaServerStatus) {
        // don't re-query when server goes offline -- only when it comes back online
        return;
      }
      const selected = this.stores.wallets.selected;
      if (selected == null) return;
      if (!isCardanoHaskell(selected.getParent().getNetworkInfo())) {
        return;
      }
      if (asGetStakingKey(selected) != null) {
        await this.refreshDelegation(selected);
      }
    };
    this._recalculateDelegationInfoDisposer.push(
      reaction(() => [this.stores.wallets.selected], triggerRefresh)
    );
    this._recalculateDelegationInfoDisposer.push(
      reaction(
        () => [
          // update if tx history changes
          this.stores.transactions.recent,
        ],
        async () => {
          for (const requests of this.stores.delegation.delegationRequests) {
            requests.mangledAmounts.invalidate();
            requests.getDelegatedBalance.invalidate();
          }
          await triggerRefresh();
        }
      )
    );
    this._recalculateDelegationInfoDisposer = reaction(
      () => [
        // if query failed due to server issue, need to re-query when it comes back online
        this.stores.serverConnectionStore.checkAdaServerStatus,
        // reward grows every epoch so we have to refresh
        this.stores.substores.ada.time.currentTime?.currentEpoch,
      ],
      async () => {
        for (const requests of this.stores.delegation.delegationRequests) {
          requests.mangledAmounts.invalidate();
          requests.getDelegatedBalance.invalidate();
          requests.rewardHistory.invalidate();
        }
        await triggerRefresh();
      }
    );
  };

  @action.bound
  reset(): void {
    while (this._recalculateDelegationInfoDisposer.length > 0) {
      const disposer = this._recalculateDelegationInfoDisposer.pop();
      disposer();
    }
  }
}
