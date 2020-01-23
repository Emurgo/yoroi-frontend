// @flow

import { observable, action, reaction, runInAction } from 'mobx';
import { find } from 'lodash';
import Store from '../base/Store';
import CachedRequest from '../lib/LocalizedCachedRequest';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetAllAccounting,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import {
  getDelegatedBalance,
  getCurrentDelegation,
} from '../../api/ada/lib/storage/bridge/delegationUtils';
import type {
  GetDelegatedBalanceFunc,
  GetCurrentDelegationFunc,
} from '../../api/ada/lib/storage/bridge/delegationUtils';
import environment from '../../environment';
import type {
  AccountStateSuccess,
  RemotePoolMetaSuccess,
} from '../../api/ada/lib/state-fetch/types';
import LocalizableError from '../../i18n/LocalizableError';
import PublicDeriverWithCachedMeta from '../../domain/PublicDeriverWithCachedMeta';
import {
  genToRelativeSlotNumber,
  genTimeToSlot,
} from '../../api/ada/lib/storage/bridge/timeUtils';


type StakingKeyState = {|
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

type DelegationRequests = {|
  publicDeriver: PublicDeriver<>,
  getDelegatedBalance: CachedRequest<GetDelegatedBalanceFunc>,
  getCurrentDelegation: CachedRequest<GetCurrentDelegationFunc>,
  error: LocalizableError | any;
  stakingKeyState: void | StakingKeyState;
|};

export default class DelegationStore extends Store {

  /** Track transactions for a set of wallets */
  @observable delegationRequests: Array<DelegationRequests> = [];

  _recalculateDelegationInfoDisposer: void => void = () => {};

  getRequests: PublicDeriver<> => void | DelegationRequests = (
    publicDeriver
  ) => {
    const foundRequest = find(this.delegationRequests, { publicDeriver });
    if (foundRequest) return foundRequest;

    return undefined; // can happen if the wallet is not a Shelley wallet
  }

  @action addObservedWallet: PublicDeriverWithCachedMeta => void = (
    publicDeriver
  ) => {
    const newObserved = {
      publicDeriver: publicDeriver.self,
      getDelegatedBalance: new CachedRequest<GetDelegatedBalanceFunc>(getDelegatedBalance),
      getCurrentDelegation: new CachedRequest<GetCurrentDelegationFunc>(getCurrentDelegation),
      stakingKeyState: undefined,
      error: undefined,
    };
    this.delegationRequests.push(newObserved);
  }

  setup(): void {
    super.setup();
    this.reset();
    this._startWatch();
  }

  refreshDelegation: PublicDeriverWithCachedMeta => Promise<void> = async (
    publicDeriver
  ) => {
    const delegationRequest = this.getRequests(publicDeriver.self);
    if (delegationRequest == null) return;

    try {
      delegationRequest.getDelegatedBalance.reset();
      delegationRequest.getCurrentDelegation.reset();
      runInAction(() => {
        delegationRequest.error = undefined;
        delegationRequest.stakingKeyState = undefined;
      });

      const withStakingKey = asGetAllAccounting(publicDeriver.self);
      if (withStakingKey == null) {
        throw new Error(`${nameof(this.refreshDelegation)} missing staking key functionality`);
      }

      const stakingKeyResp = await withStakingKey.getStakingKey();

      const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
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
      const poolInfoResp = await stateFetcher.getPoolInfo({
        ids: stateForStakingKey.delegation.pools.map(delegation => delegation[0]),
      });
      const meta = new Map(stateForStakingKey.delegation.pools.map(delegation => {
        const info = poolInfoResp[delegation[0]];
        if (!info.history) {
          return runInAction(() => {
            delegationRequest.stakingKeyState = undefined;
            throw new Error(`${nameof(this.refreshDelegation)} pool info missing ${info.error}`);
          });
        }
        return [delegation[0], info];
      }));
      runInAction(() => {
        delegationRequest.stakingKeyState = {
          state: stateForStakingKey,
          selectedPool: 0,
          poolInfo: meta,
        };
      });

      const delegatedBalance = delegationRequest.getDelegatedBalance.execute({
        publicDeriver: withStakingKey,
        accountState: stateForStakingKey,
        stakingPubKey: stakingKeyResp.addr.Hash,
      }).promise;
      if (delegatedBalance == null) throw new Error('Should never happen');

      const toRelativeSlotNumber = await genToRelativeSlotNumber();
      const timeToSlot = await genTimeToSlot();
      const currentEpoch = toRelativeSlotNumber(
        timeToSlot({
          time: new Date(),
        }).slot
      ).epoch;

      const currentDelegation = delegationRequest.getCurrentDelegation.execute({
        publicDeriver: withStakingKey,
        stakingKeyAddressId: stakingKeyResp.addr.AddressId,
        toRelativeSlotNumber,
        currentEpoch,
      }).promise;
      if (currentDelegation == null) throw new Error('Should never happen');

      await Promise.all([
        delegatedBalance,
        currentDelegation,
      ]);
    } catch (e) {
      runInAction(() => {
        delegationRequest.error = e;
      });
    }
  }

  @action.bound
  _startWatch: void => void = () => {
    this._recalculateDelegationInfoDisposer = reaction(
      () => [
        this.stores.substores.ada.wallets.selected,
        // num tx sync changed => valid inputs may have changed
        this.stores.substores.ada.transactions.totalAvailable,
        // need to recalculate when there are no more pending transactions
        this.stores.substores.ada.transactions.hasAnyPending,
        // if query failed due to server issue, need to re-query when it comes back online
        this.stores.substores.ada.serverConnectionStore.checkAdaServerStatus,
      ],
      // $FlowFixMe error in mobx types
      async () => {
        const selected = this.stores.substores.ada.wallets.selected;
        if (selected == null) return;
        await this.refreshDelegation(selected);
      },
    );
  }

  @action.bound
  reset(): void {
    this._recalculateDelegationInfoDisposer();
    this._recalculateDelegationInfoDisposer = () => {};
    this.delegationRequests = [];
  }
}
