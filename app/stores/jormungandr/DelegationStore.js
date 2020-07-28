// @flow

import { observable, action, reaction, runInAction } from 'mobx';
import { find } from 'lodash';
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
} from '../../api/jormungandr/lib/storage/bridge/delegationUtils';
import type {
  AccountStateSuccess,
  RemotePoolMetaSuccess,
  ReputationFunc,
  RewardTuple,
} from '../../api/jormungandr/lib/state-fetch/types';
import LocalizableError from '../../i18n/LocalizableError';
import {
  genToRelativeSlotNumber,
  genTimeToSlot,
} from '../../api/jormungandr/lib/storage/bridge/timeUtils';
import { isJormungandr, getJormungandrBaseConfig } from '../../api/ada/lib/storage/database/prepackaged/networks';

export type StakingKeyState = {|
  state: AccountStateSuccess,
  /**
    * Pool selected in the UI
    */
  selectedPool: number;
  /**
    * careful: there may be less entries in this map than # of pools in a certificate
    * I think you can use ratio stake to stake to the same stake pool multiple times
    */
  poolInfo: Map<string, RemotePoolMetaSuccess>
|};

export type RewardHistoryForWallet = string => Promise<Array<RewardTuple>>;

export type DelegationRequests = {|
  publicDeriver: PublicDeriver<>,
  getDelegatedBalance: CachedRequest<GetDelegatedBalanceFunc>,
  getCurrentDelegation: CachedRequest<GetCurrentDelegationFunc>,
  rewardHistory: CachedRequest<RewardHistoryForWallet>,
  error: LocalizableError | any;
  stakingKeyState: void | StakingKeyState;
|};

export default class DelegationStore extends Store {

  @observable delegationRequests: Array<DelegationRequests> = [];

  @observable poolReputation: CachedRequest<ReputationFunc>
    = new CachedRequest<ReputationFunc>(() => {
      // we need to defer this call because the store may not be initialized yet
      // by the time this constructor is called
      const stateFetcher = this.stores.substores.jormungandr.stateFetchStore.fetcher;
      return stateFetcher.getReputation();
    });

  _recalculateDelegationInfoDisposer: void => void = () => {};

  // TODO: refine input type to staking key wallets only
  getDelegationRequests: PublicDeriver<> => void | DelegationRequests = (
    publicDeriver
  ) => {
    const foundRequest = find(this.delegationRequests, { publicDeriver });
    if (foundRequest) return foundRequest;

    return undefined; // can happen if the wallet is not a Shelley wallet
  }

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
        const stateFetcher = this.stores.substores.jormungandr.stateFetchStore.fetcher;
        const result = await stateFetcher.getRewardHistory({ addresses: [address] });
        return result[address] ?? [];
      }),
      stakingKeyState: undefined,
      error: undefined,
    };
    this.delegationRequests.push(newObserved);
  }

  setup(): void {
    super.setup();
    this.reset();
    this._startWatch();
    this.registerReactions([
      this._loadPoolReputation,
    ]);
  }

  refreshDelegation: PublicDeriver<> => Promise<void> = async (
    publicDeriver
  ) => {
    const delegationRequest = this.getDelegationRequests(publicDeriver);
    if (delegationRequest == null) return;

    try {
      delegationRequest.getDelegatedBalance.reset();
      delegationRequest.getCurrentDelegation.reset();
      runInAction(() => {
        delegationRequest.error = undefined;
        delegationRequest.stakingKeyState = undefined;
      });

      const withStakingKey = asGetStakingKey(publicDeriver);
      if (withStakingKey == null) {
        throw new Error(`${nameof(this.refreshDelegation)} missing staking key functionality`);
      }

      const stakingKeyResp = await withStakingKey.getStakingKey();

      const accountStateCalcs = (async () => {
        try {
          const stateFetcher = this.stores.substores.jormungandr.stateFetchStore.fetcher;
          const accountStateResp = await stateFetcher.getAccountState({
            addresses: [stakingKeyResp.addr.Hash],
          });
          const stateForStakingKey = accountStateResp[stakingKeyResp.addr.Hash];
          if (!stateForStakingKey.delegation) {
            return runInAction(() => {
              delegationRequest.stakingKeyState = undefined;
              throw new Error(`${nameof(this.refreshDelegation)} stake key invalid - ${stateForStakingKey.comment}`);
            });
          }
          const delegatedBalance = delegationRequest.getDelegatedBalance.execute({
            publicDeriver: withStakingKey,
            accountState: stateForStakingKey,
            stakingAddress: stakingKeyResp.addr.Hash,
          }).promise;
          if (delegatedBalance == null) throw new Error('Should never happen');

          const poolInfoRequest = this._getPoolInfo({ delegationRequest, stateForStakingKey });
          return await Promise.all([
            delegatedBalance,
            poolInfoRequest,
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
      });

      const rewardHistory = delegationRequest.rewardHistory.execute(
        stakingKeyResp.addr.Hash
      ).promise;

      await Promise.all([
        accountStateCalcs,
        delegationHistory,
        rewardHistory,
      ]);
    } catch (e) {
      Logger.error(`${nameof(DelegationStore)}::${nameof(this.refreshDelegation)} error: ` + stringifyError(e));
    }
  }

  _getPoolInfo: {|
    delegationRequest: DelegationRequests,
    stateForStakingKey: AccountStateSuccess,
  |} => Promise<void> = async (request) => {
    const stateFetcher = this.stores.substores.jormungandr.stateFetchStore.fetcher;
    const poolInfoResp = await stateFetcher.getPoolInfo({
      ids: request.stateForStakingKey.delegation.pools.map(delegation => delegation[0]),
    });
    const meta = new Map(request.stateForStakingKey.delegation.pools.map(delegation => {
      const info = poolInfoResp[delegation[0]];
      if (!info.history) {
        return runInAction(() => {
          request.delegationRequest.stakingKeyState = undefined;
          throw new Error(`${nameof(this.refreshDelegation)} pool info missing ${info.error}`);
        });
      }
      return [delegation[0], info];
    }));
    runInAction(() => {
      request.delegationRequest.stakingKeyState = {
        state: request.stateForStakingKey,
        selectedPool: 0,
        poolInfo: meta,
      };
    });
  }

  _getDelegationHistory: {|
    publicDeriver: PublicDeriver<> & IGetStakingKey,
    stakingKeyAddressId: number,
    delegationRequest: DelegationRequests,
  |} => Promise<void> = async (request) => {
    const jormungandrConfig = getJormungandrBaseConfig(
      request.publicDeriver.getParent().getNetworkInfo()
    );
    const toRelativeSlotNumber = await genToRelativeSlotNumber(jormungandrConfig);
    const timeToSlot = await genTimeToSlot(jormungandrConfig);
    const currentEpoch = toRelativeSlotNumber(
      timeToSlot({
        time: new Date(),
      }).slot
    ).epoch;

    const currentDelegation = request.delegationRequest.getCurrentDelegation.execute({
      publicDeriver: request.publicDeriver,
      stakingKeyAddressId: request.stakingKeyAddressId,
      toRelativeSlotNumber,
      currentEpoch,
    }).promise;
    if (currentDelegation == null) throw new Error('Should never happen');
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
    this.delegationRequests = [];
  }

  _loadPoolReputation: void => Promise<void> = async () => {
    const { selected } = this.stores.wallets;
    if (selected == null) return undefined;
    if (!isJormungandr(selected.getParent().getNetworkInfo())) return undefined;
    if (!this.poolReputation.wasExecuted && !this.poolReputation.isExecuting) {
      await this.poolReputation.execute();
    }
  }
}
