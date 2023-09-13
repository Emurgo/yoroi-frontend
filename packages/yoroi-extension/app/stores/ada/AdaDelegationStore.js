// @flow

import { action, observable, reaction, runInAction } from 'mobx';
import BigNumber from 'bignumber.js';
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
  getRegistrationHistory,
} from '../../api/ada/lib/storage/bridge/delegationUtils';
import type {
  GetDelegatedBalanceFunc,
  GetCurrentDelegationFunc,
  GetCurrentDelegationResponse,
  RewardHistoryFunc
} from '../../api/common/lib/storage/bridge/delegationUtils';
import {
  genToRelativeSlotNumber,
  genTimeToSlot,
} from '../../api/ada/lib/storage/bridge/timeUtils';
import { isCardanoHaskell, getCardanoHaskellBaseConfig } from '../../api/ada/lib/storage/database/prepackaged/networks';
import type { DelegationRequests, } from '../toplevel/DelegationStore';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import type { GetRegistrationHistoryResponse, GetRegistrationHistoryFunc } from '../../api/ada/lib/storage/bridge/delegationUtils';
import type { MangledAmountFunc } from '../stateless/mangledAddresses';
import { getUnmangleAmounts } from '../stateless/mangledAddresses';
import { MultiToken } from '../../api/common/lib/MultiToken';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';

export type AdaDelegationRequests = {|
  publicDeriver: PublicDeriver<>,
  getRegistrationHistory: CachedRequest<GetRegistrationHistoryFunc>,
|};

export default class AdaDelegationStore extends Store<StoresMap, ActionsMap> {

  @observable delegationRequests: Array<AdaDelegationRequests> = [];

  _recalculateDelegationInfoDisposer: Array<void => void> = [];

  @action addObservedWallet: PublicDeriver<> => void = (
    publicDeriver
  ) => {
    this.stores.delegation.delegationRequests.push({
      publicDeriver,
      mangledAmounts: new CachedRequest<MangledAmountFunc>(getUnmangleAmounts),
      getDelegatedBalance: new CachedRequest<GetDelegatedBalanceFunc>(getDelegatedBalance),
      getCurrentDelegation: new CachedRequest<GetCurrentDelegationFunc>(getCurrentDelegation),
      rewardHistory: new CachedRequest<RewardHistoryFunc>(async (address) => {
        // we need to defer this call because the store may not be initialized yet
        // by the time this constructor is called
        const stateFetcher = this.stores.substores.ada.stateFetchStore.fetcher;
        const historyResult = await stateFetcher.getRewardHistory({
          network: publicDeriver.getParent().getNetworkInfo(),
          addresses: [address],
        });

        const defaultToken = publicDeriver.getParent().getDefaultToken();
        const addressRewards = historyResult[address]
          ?.sort((a,b) => a.epoch - b.epoch)
          .map(info => (
            ([info.epoch, new MultiToken(
              [{
                amount: new BigNumber(info.reward),
                identifier: defaultToken.defaultIdentifier,
                networkId: defaultToken.defaultNetworkId,
              }],
              defaultToken
            ),
            info.poolHash]: [number, MultiToken, string])
          ));
        return addressRewards != null
          ? addressRewards
          : [];
      }),
      error: undefined,
    });
    this.delegationRequests.push({
      publicDeriver,
      getRegistrationHistory: new CachedRequest<GetRegistrationHistoryFunc>(getRegistrationHistory),
    });
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
          const delegatedBalance = delegationRequest.getDelegatedBalance.execute({
            publicDeriver: withStakingKey,
            rewardBalance: new MultiToken(
              [{
                amount: new BigNumber(stateForStakingKey == null
                  ? 0
                  : stateForStakingKey.remainingAmount),
                networkId: defaultToken.defaultNetworkId,
                identifier: defaultToken.defaultIdentifier,
              }],
              defaultToken
            ),
            stakingAddress: stakingKeyResp.addr.Hash,
            delegation: stateForStakingKey?.delegation ?? null,
            allRewards: stateForStakingKey?.rewards ?? null,
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

      const adaSpecific = (async () => {
        const adaDelegationRequest = this.getDelegationRequests(publicDeriver);
        if (adaDelegationRequest == null) {
          return Promise.resolve();
        }
        const registrationHistory = await this._getRegistrationHistory({
          publicDeriver: withStakingKey,
          stakingKeyAddressId: stakingKeyResp.addr.AddressId,
          delegationRequest: adaDelegationRequest,
        });
        return registrationHistory;
      })();

      const rewardHistory = delegationRequest.rewardHistory.execute(
        stakingKeyResp.addr.Hash
      ).promise;

      await Promise.all([
        accountStateCalcs,
        delegationHistory,
        rewardHistory,
        adaSpecific,
      ]);
    } catch (e) {
      Logger.error(`${nameof(AdaDelegationStore)}::${nameof(this.refreshDelegation)} error: ` + stringifyError(e));
    }
  }

  _getRegistrationHistory: {|
    publicDeriver: PublicDeriver<> & IGetStakingKey,
    stakingKeyAddressId: number,
    delegationRequest: AdaDelegationRequests,
  |} => Promise<GetRegistrationHistoryResponse> = async (request) => {
    const currentDelegation = await request.delegationRequest.getRegistrationHistory.execute({
      publicDeriver: request.publicDeriver,
      stakingKeyAddressId: request.stakingKeyAddressId,
    }).promise;
    if (currentDelegation == null) throw new Error('Should never happen');
    return currentDelegation;
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
    const stateFetcher = this.stores.substores.ada.stateFetchStore.fetcher;
    const poolInfoResp = await stateFetcher.getPoolInfo({
      network: request.network,
      poolIds: poolsToQuery,
    });
    runInAction(() => {
      for (const poolId of Object.keys(poolInfoResp)) {
        const poolInfo = poolInfoResp[poolId];
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
        });
      }
    });
  }

  // TODO: refine input type to staking key wallets only
  getDelegationRequests: PublicDeriver<> => void | AdaDelegationRequests = (
    publicDeriver
  ) => {
    const foundRequest = find(this.delegationRequests, { publicDeriver });
    if (foundRequest) return foundRequest;

    return undefined; // can happen if the wallet is not a Shelley wallet
  }

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
    this._recalculateDelegationInfoDisposer.push(reaction(
      () => [
        this.stores.wallets.selected,
      ],
      triggerRefresh,
    ));
    this._recalculateDelegationInfoDisposer.push(reaction(
      () => [
        // update if tx history changes
        this.stores.transactions.recent,
      ],
      async () => {
        for (const requests of this.stores.delegation.delegationRequests) {
          requests.mangledAmounts.invalidate();
          requests.getDelegatedBalance.invalidate();
          requests.getCurrentDelegation.invalidate();
        }
        for (const requests of this.delegationRequests) {
          requests.getRegistrationHistory.invalidate();
        }
        await triggerRefresh();
      },
    ));
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
          requests.getCurrentDelegation.invalidate();
          requests.rewardHistory.invalidate();
        }
        for (const requests of this.delegationRequests) {
          requests.getRegistrationHistory.invalidate();
        }
        await triggerRefresh();
      },
    );
  }

  @action.bound
  reset(): void {
    while (this._recalculateDelegationInfoDisposer.length > 0) {
      const disposer = this._recalculateDelegationInfoDisposer.pop();
      disposer();
    }
  }
}
