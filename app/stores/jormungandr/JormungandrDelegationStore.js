// @flow

import BigNumber from 'bignumber.js';
import { action, reaction, runInAction } from 'mobx';
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
} from '../../api/jormungandr/lib/storage/bridge/delegationUtils';
import type {
  GetDelegatedBalanceFunc,
  GetCurrentDelegationFunc,
  GetCurrentDelegationResponse,
  RewardHistoryFunc,
} from '../../api/common/lib/storage/bridge/delegationUtils';
import {
  genToRelativeSlotNumber,
  genTimeToSlot,
} from '../../api/jormungandr/lib/storage/bridge/timeUtils';
import { isJormungandr, getJormungandrBaseConfig, } from '../../api/ada/lib/storage/database/prepackaged/networks';
import type { DelegationRequests } from '../toplevel/DelegationStore';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import type { MangledAmountFunc } from '../stateless/mangledAddresses';
import { getUnmangleAmounts } from '../stateless/mangledAddresses';
import { MultiToken } from '../../api/common/lib/MultiToken';

export default class JormungandrDelegationStore extends Store {

  _recalculateDelegationInfoDisposer: void => void = () => {};

  @action addObservedWallet: PublicDeriver<> => void = (
    publicDeriver
  ) => {
    const newObserved = {
      publicDeriver,
      mangledAmounts: new CachedRequest<MangledAmountFunc>(getUnmangleAmounts),
      getDelegatedBalance: new CachedRequest<GetDelegatedBalanceFunc>(getDelegatedBalance),
      getCurrentDelegation: new CachedRequest<GetCurrentDelegationFunc>(getCurrentDelegation),
      rewardHistory: new CachedRequest<RewardHistoryFunc>(async (address) => {
        // we need to defer this call because the store may not be initialized yet
        // by the time this constructor is called
        const { BackendService } = publicDeriver.getParent().getNetworkInfo().Backend;
        if (BackendService == null) throw new Error(`rewardHistory missing backend url`);
        const stateFetcher = this.stores.substores.jormungandr.stateFetchStore.fetcher;
        const historyResult = await stateFetcher.getRewardHistory({
          network: publicDeriver.getParent().getNetworkInfo(),
          addresses: [address]
        });

        const defaultToken = publicDeriver.getParent().getDefaultToken();

        // flowlint-next-line unnecessary-optional-chain:off
        const addressRewards = historyResult[address]?.map(info => (
          ([info[0], new MultiToken(
            [{
              amount: new BigNumber(info[1]),
              identifier: defaultToken.defaultIdentifier,
              networkId: defaultToken.defaultNetworkId,
            }],
            defaultToken
          )]: [number, MultiToken])
        ));
        return addressRewards != null
          ? addressRewards
          : [];
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
      await delegationRequest.mangledAmounts.execute({
        publicDeriver,
      }).promise;

      delegationRequest.getDelegatedBalance.reset();
      delegationRequest.getCurrentDelegation.reset();
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
          const stateFetcher = this.stores.substores.jormungandr.stateFetchStore.fetcher;
          const accountStateResp = await stateFetcher.getAccountState({
            network: publicDeriver.getParent().getNetworkInfo(),
            addresses: [stakingKeyResp.addr.Hash],
          });
          const stateForStakingKey = accountStateResp[stakingKeyResp.addr.Hash];
          if (!stateForStakingKey.delegation) {
            throw new Error(`${nameof(this.refreshDelegation)} stake key invalid - ${stateForStakingKey.comment}`);
          }
          const delegatedBalance = delegationRequest.getDelegatedBalance.execute({
            publicDeriver: withStakingKey,
            rewardBalance: new MultiToken(
              [{
                amount: new BigNumber(stateForStakingKey.value),
                networkId: defaultToken.defaultNetworkId,
                identifier: defaultToken.defaultIdentifier,
              }],
              defaultToken
            ),
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
      }).then(currentDelegation => this.updatePoolInfo({
        network: publicDeriver.getParent().getNetworkInfo(),
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
      Logger.error(`${nameof(JormungandrDelegationStore)}::${nameof(this.refreshDelegation)} error: ` + stringifyError(e));
    }
  }

  _getDelegationHistory: {|
    publicDeriver: PublicDeriver<> & IGetStakingKey,
    stakingKeyAddressId: number,
    delegationRequest: DelegationRequests,
  |} => Promise<GetCurrentDelegationResponse> = async (request) => {
    const jormungandrConfig = getJormungandrBaseConfig(
      request.publicDeriver.getParent().getNetworkInfo()
    );
    // TODO: use time store instead?
    const toRelativeSlotNumber = await genToRelativeSlotNumber(jormungandrConfig);
    const timeToSlot = await genTimeToSlot(jormungandrConfig);
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

  updatePoolInfo: {|
    network: $ReadOnly<NetworkRow>,
    allPoolIds: Array<string>,
  |} => Promise<void> = async (request) => {
    // update pool information
    const poolsCachedForNetwork = this.stores.delegation.poolInfo
      .reduce(
        (acc, next) => {
          if (
            next.networkId === request.network.NetworkId
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
    const stateFetcher = this.stores.substores.jormungandr.stateFetchStore.fetcher;
    const poolInfoResp = await stateFetcher.getPoolInfo({
      network: request.network,
      ids: poolsToQuery,
    });
    const reputation = await stateFetcher.getReputation({
      network: request.network,
    });
    runInAction(() => {
      for (const poolId of Object.keys(poolInfoResp)) {
        const poolInfo = poolInfoResp[poolId];
        if (!poolInfo.info) continue; // skip pools that error out
        this.stores.delegation.poolInfo.push({
          networkId: request.network.NetworkId,
          poolId,
          poolInfo: {
            poolId,
            info: poolInfo.info,
            history: poolInfo.history,
            reputation: reputation[poolId] ?? Object.freeze({}),
          },
        });
      }
    });
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
        this.stores.substores.jormungandr.time.currentTime?.currentEpoch,
      ],
      async () => {
        if (!this.stores.serverConnectionStore.checkAdaServerStatus) {
          // don't re-query when server goes offline -- only when it comes back online
          return;
        }
        const selected = this.stores.wallets.selected;
        if (selected == null) return;
        if (!isJormungandr(selected.getParent().getNetworkInfo())) {
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
