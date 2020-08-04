// @flow

import { action, reaction, runInAction } from 'mobx';
import BigNumber from 'bignumber.js';
import Store from '../base/Store';
import {
  Logger,
  stringifyError,
} from '../../utils/logging';
import CachedRequest from '../lib/LocalizedCachedRequest';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetStakingKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import type {
  IGetStakingKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import {
  getDelegatedBalance,
  getCurrentDelegation,
} from '../../api/ada/lib/storage/bridge/delegationUtils';
import type {
  GetDelegatedBalanceFunc,
  GetCurrentDelegationFunc,
  GetCurrentDelegationResponse,
} from '../../api/common/lib/storage/bridge/delegationUtils';
import {
  genToRelativeSlotNumber,
  genTimeToSlot,
} from '../../api/ada/lib/storage/bridge/timeUtils';
import { isCardanoHaskell, getCardanoHaskellBaseConfig } from '../../api/ada/lib/storage/database/prepackaged/networks';
import type { DelegationRequests, RewardHistoryForWallet } from '../toplevel/DelegationStore';

export default class AdaDelegationStore extends Store {

  _recalculateDelegationInfoDisposer: void => void = () => {};

  @action addObservedWallet: PublicDeriver<> => void = (
    publicDeriver
  ) => {
    const newObserved = {
      publicDeriver,
      getDelegatedBalance: new CachedRequest<GetDelegatedBalanceFunc>(getDelegatedBalance),
      getCurrentDelegation: new CachedRequest<GetCurrentDelegationFunc>(getCurrentDelegation),
      rewardHistory: new CachedRequest<RewardHistoryForWallet>(async (address) => {
        // we need to defer this call because the store may not be initialized yet
        // by the time this constructor is called
        const stateFetcher = this.stores.substores.ada.stateFetchStore.fetcher;
        const result = await stateFetcher.getRewardHistory({ addresses: [address] });
        return result[address] ?? [];
      }),
      error: undefined,
    };
    this.stores.delegation.delegationRequests.push(newObserved);
  }

  setup(): void {
    super.setup();
    this.reset();
    this._startWatch();
  }

  refreshDelegation: PublicDeriver<> => Promise<void> = async (
    publicDeriver
  ) => {
    const delegationRequest = this.stores.delegation.getDelegationRequests(publicDeriver);
    if (delegationRequest == null) return;

    try {
      delegationRequest.getDelegatedBalance.reset();
      delegationRequest.getCurrentDelegation.reset();
      runInAction(() => {
        delegationRequest.error = undefined;
      });

      const withStakingKey = asGetStakingKey(publicDeriver);
      if (withStakingKey == null) {
        throw new Error(`${nameof(this.refreshDelegation)} missing staking key functionality`);
      }

      const stakingKeyResp = await withStakingKey.getStakingKey();

      const accountStateCalcs = (async () => {
        try {
          const stateFetcher = this.stores.substores.ada.stateFetchStore.fetcher;
          const accountStateResp = await stateFetcher.getAccountState({
            addresses: [stakingKeyResp.addr.Hash],
          });
          const stateForStakingKey = accountStateResp[stakingKeyResp.addr.Hash];
          const delegatedBalance = delegationRequest.getDelegatedBalance.execute({
            publicDeriver: withStakingKey,
            rewardBalance: new BigNumber(stateForStakingKey.value),
            stakingAddress: stakingKeyResp.addr.Hash,
          }).promise;
          if (delegatedBalance == null) throw new Error('Should never happen');

          return await Promise.all([
            delegatedBalance,
          ]);
        } catch (e) {
          runInAction(() => {
            delegationRequest.error = e;
          });
        }
      })();

      const delegationHistory = this._getDelegationHistory({
        publicDeriver: withStakingKey,
        stakingKeyAddressId: stakingKeyResp.addr.AddressId,
        delegationRequest,
      }).then(currentDelegation => this._updatePoolInfo({
        publicDeriver: withStakingKey,
        allPoolIds: currentDelegation.allPoolIds,
      }));

      const rewardHistory = delegationRequest.rewardHistory.execute(
        stakingKeyResp.addr.Hash
      ).promise;

      await Promise.all([
        accountStateCalcs,
        delegationHistory,
        rewardHistory,
      ]);
    } catch (e) {
      Logger.error(`${nameof(AdaDelegationStore)}::${nameof(this.refreshDelegation)} error: ` + stringifyError(e));
    }
  }

  _getDelegationHistory: {|
    publicDeriver: PublicDeriver<> & IGetStakingKey,
    stakingKeyAddressId: number,
    delegationRequest: DelegationRequests,
  |} => Promise<GetCurrentDelegationResponse> = async (request) => {
    const adaConfig = getCardanoHaskellBaseConfig(
      request.publicDeriver.getParent().getNetworkInfo()
    );
    // TODO: use time store instead?
    const toRelativeSlotNumber = await genToRelativeSlotNumber(adaConfig);
    const timeToSlot = await genTimeToSlot(adaConfig);
    const currentEpoch = toRelativeSlotNumber(
      timeToSlot({
        time: new Date(),
      }).slot
    ).epoch;

    // re-calculate which pools we've delegated to
    const currentDelegation = await request.delegationRequest.getCurrentDelegation.execute({
      publicDeriver: request.publicDeriver,
      stakingKeyAddressId: request.stakingKeyAddressId,
      toRelativeSlotNumber,
      currentEpoch,
    }).promise;
    if (currentDelegation == null) throw new Error('Should never happen');
    return currentDelegation;
  }

  _updatePoolInfo: {|
    publicDeriver: PublicDeriver<> & IGetStakingKey,
    allPoolIds: Array<string>,
  |} => Promise<void> = async (request) => {
    // update pool information
    const poolsCachedForNetwork = this.stores.delegation.poolInfo
      .reduce(
        (acc, next) => {
          if (
            next.network.NetworkId === request.publicDeriver.getParent().getNetworkInfo().NetworkId
          ) {
            acc.add(next.poolId);
            return acc;
          }
          return acc;
        },
        (new Set<string>())
      );
    const poolsToQuery = request.allPoolIds.filter(
      pool => !poolsCachedForNetwork.has(pool)
    );
    const stateFetcher = this.stores.substores.ada.stateFetchStore.fetcher;
    const poolInfoResp = await stateFetcher.getPoolInfo({
      ids: poolsToQuery,
    });
    for (const poolId of Object.keys(poolInfoResp)) {
      const poolInfo = poolInfoResp[poolId];
      this.stores.delegation.poolInfo.push({
        network: request.publicDeriver.getParent().getNetworkInfo(),
        poolId,
        poolInfo: {
          info: {
            name: poolInfo.info.name,
            ticker: poolInfo.info.ticker,
            description: poolInfo.info.description,
            homepage: poolInfo.info.homepage,
          },
          history: poolInfo.history,
          reputation: Object.freeze({}),
        },
      });
    }
  }

  @action.bound
  _startWatch: void => void = () => {
    this._recalculateDelegationInfoDisposer = reaction(
      () => [
        this.stores.wallets.selected,
        // update if tx history changes
        this.stores.transactions.hash,
        // if query failed due to server issue, need to re-query when it comes back online
        this.stores.serverConnectionStore.checkAdaServerStatus,
        // reward grows every epoch so we have to refresh
        this.stores.substores.ada.time.currentTime?.currentEpoch,
      ],
      async () => {
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
      },
    );
  }

  @action.bound
  reset(): void {
    this._recalculateDelegationInfoDisposer();
    this._recalculateDelegationInfoDisposer = () => {};
  }
}
