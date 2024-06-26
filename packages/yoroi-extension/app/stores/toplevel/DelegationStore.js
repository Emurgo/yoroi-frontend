// @flow

import { action, observable, runInAction } from 'mobx';
import { find } from 'lodash';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import LocalizedRequest from '../lib/LocalizedRequest';
import Store from '../base/Store';
import CachedRequest from '../lib/LocalizedCachedRequest';
import LocalizableError from '../../i18n/LocalizableError';
import { PoolMissingApiError } from '../../api/common/errors';
import type { MangledAmountFunc, MangledAmountsResponse } from '../stateless/mangledAddresses';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import type { ExplorerPoolInfo as PoolInfo } from '@emurgo/yoroi-lib';
import { PoolInfoApi } from '@emurgo/yoroi-lib';
import { MultiToken } from '../../api/common/lib/MultiToken';
import { forceNonNull, maybe } from '../../coreUtils';
import type {
  GetDelegatedBalanceFunc,
  GetDelegatedBalanceResponse,
  RewardHistoryFunc,
} from '../../api/ada/lib/storage/bridge/delegationUtils';

import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';

export type DelegationRequests = {|
  publicDeriverId: number,
  getDelegatedBalance: CachedRequest<GetDelegatedBalanceFunc>,
  rewardHistory: CachedRequest<RewardHistoryFunc>,
  mangledAmounts: CachedRequest<MangledAmountFunc>,
  error: LocalizableError | any,
|};

export type PoolMeta = {|
  +poolId: string,
  +info: ?{|
    +name?: string,
    +ticker?: string,
    +description?: string,
    +homepage?: string,
  |},
  +history: $ReadOnlyArray<{|
    +epoch: number,
    +slot: number,
    +tx_ordinal: number,
    +cert_ordinal: number,
    +payload: any, // TODO: how to store this since different networks have different cert types
  |}>,
|};

export type PoolTransition = {|
  currentPool: ?PoolInfo,
  deadlineMilliseconds: ?number,
  shouldShowTransitionFunnel: boolean,
  suggestedPool: ?PoolInfo,
  deadlinePassed: boolean,
|};

export type PoolTransitionModal = {| show: 'open' | 'closed' | 'idle', shouldUpdatePool?: boolean |};

export default class DelegationStore extends Store<StoresMap, ActionsMap> {
  @observable delegationRequests: Array<DelegationRequests> = [];
  @observable poolTransitionRequestInfo: { [number]: ?PoolTransition } = {};
  @observable poolTransitionConfig: { [number]: ?PoolTransitionModal } = {};

  getPoolTransitionConfig(publicDeriver: ?PublicDeriver<>): PoolTransitionModal {
    return maybe(publicDeriver, w => this.poolTransitionConfig[w.getPublicDeriverId()]) ?? {
      show: 'closed',
      shouldUpdatePool: false,
    };
  }

  @action setPoolTransitionConfig: (?PublicDeriver<>, PoolTransitionModal) => void = (publicDeriver: ?PublicDeriver<>, config: PoolTransitionModal) => {
    if (publicDeriver != null) {
      this.poolTransitionConfig[publicDeriver.getPublicDeriverId()] = {
        show: config.show,
        shouldUpdatePool: config.shouldUpdatePool,
      };
    }
  };

  @observable poolInfoQuery: LocalizedRequest<
    (Array<string>) => Promise<void>
  > = new LocalizedRequest<(Array<string>) => Promise<void>>(async poolIds => {
    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null) throw new Error(`${nameof(DelegationStore)} no network selected`);
    await this.stores.substores.ada.delegation.updatePoolInfo({
      network: selectedNetwork,
      allPoolIds: poolIds,
    });
    if (this.stores.substores.ada.delegation) {
      // make sure all the pools were found or throw an error
      for (const poolId of poolIds) {
        if (this.getLocalPoolInfo(selectedNetwork, poolId) == null) {
          throw new PoolMissingApiError();
        }
      }
    }
  });

  @observable poolInfo: Array<{|
    // it's possible somebody creates a pool with the same ID on a testnet, etc. so we need this key
    networkId: number,
    poolId: string,
    poolInfo: PoolMeta,
    poolRemoteInfo: PoolInfo | null,
  |}> = [];

  /**
   * Pool selected in the UI
   */
  @observable selectedPage: number = 0;

  setup(): void {
    super.setup();
    const { delegation } = this.actions;
    this.registerReactions([this._changeWallets]);
    delegation.setSelectedPage.listen(this._setSelectedPage);
  }

  @action
  _setSelectedPage: number => void = newPage => {
    this.selectedPage = newPage;
  };

  @action.bound
  _changeWallets: void => void = () => {
    const { selected } = this.stores.wallets;
    if (selected == null) return;

    this.selectedPage = 0;
  };

  getDelegationRequests: number => void | DelegationRequests = (publicDeriverId) => {
    return find(this.delegationRequests, { publicDeriverId });
  }

  _getDelegatedBalanceResult: number => ?GetDelegatedBalanceResponse = (publicDeriverId) => {
    const delegationRequest = this.getDelegationRequests(publicDeriverId);
    return delegationRequest?.getDelegatedBalance.result || null;
  };

  // <TODO:PENDING_REMOVAL> legacy after removing bip44
  isRewardWallet: number => boolean = (publicDeriverId) => {
    return this.getDelegationRequests(publicDeriverId) != null;
  }

  canUnmangleSomeUtxo: number => boolean = (publicDeriverId) => {
    const canUnmangleAmount: ?MultiToken = this.getDelegationRequests(publicDeriverId)
      ?.mangledAmounts.result?.canUnmangle;
    return maybe(canUnmangleAmount, t => t.getDefault().gt(0)) ?? false;
  };

  getMangledAmountsOrZero: (number, number, string) => MangledAmountsResponse = (
    publicDeriverId,
    networkId,
    defaultTokenId,
  ) => {
    const defaultMultiToken = new MultiToken(
      [],
      {
        defaultNetworkId: networkId,
        defaultIdentifier: defaultTokenId,
      }
    );
    const resp: ?MangledAmountsResponse = this.getDelegationRequests(publicDeriverId)?.mangledAmounts.result;
    return {
      canUnmangle: resp?.canUnmangle ?? defaultMultiToken,
      cannotUnmangle: resp?.cannotUnmangle ?? defaultMultiToken,
    };
  };

  hasRewardHistory: number => boolean = (publicDeriverId) => {
    return this.getDelegationRequests(publicDeriverId)?.rewardHistory.result != null;
  }

  isExecutedDelegatedBalance: number => boolean = (publicDeriverId) => {
    return this.getDelegationRequests(publicDeriverId)?.getDelegatedBalance.wasExecuted === true;
  }

  getRewardBalanceOrZero: ({
    publicDeriverId: number,
    networkId: number,
    defaultTokenId: string,
    ...
  }) => MultiToken = ({ publicDeriverId, networkId, defaultTokenId, }) => {
    const defaultMultiToken = new MultiToken(
      [],
      {
        defaultNetworkId: networkId,
        defaultIdentifier: defaultTokenId,
      }
    );

    if (this.stores.transactions.hasProcessedWithdrawals({ publicDeriverId })) {
      // In case we have a processed withdrawal for the wallet
      // We cancel out any still present reward, in case it has not synced yet
      return defaultMultiToken;
    }
    return this._getDelegatedBalanceResult(publicDeriverId)?.accountPart ?? defaultMultiToken;
  }

  getDelegatedUtxoBalance: number => ?MultiToken = (publicDeriverId) => {
    return this._getDelegatedBalanceResult(publicDeriverId)?.utxoPart ?? null;
  }

  getDelegatedPoolId: number => ?string = (publicDeriverId) => {
    return this._getDelegatedBalanceResult(publicDeriverId)?.delegation ?? null;
  }

  isCurrentlyDelegating: number => boolean = (publicDeriverId) => {
    return this.getDelegatedPoolId(publicDeriverId) != null;
  }

  isStakeRegistered: number => ?boolean = (publicDeriverId) => {
    return this._getDelegatedBalanceResult(publicDeriverId)?.stakeRegistered ?? null;
  }

  getLocalPoolInfo: (
    number,
    string,
  ) => void | PoolMeta = (networkId, poolId) => {
    return find(this.poolInfo, { networkId, poolId })?.poolInfo;
  }

  getLocalRemotePoolInfo: (
    number,
    string,
  ) => void | PoolInfo = (networkId, poolId) => {
    return find(this.poolInfo, { networkId, poolId })?.poolRemoteInfo ?? undefined;
  }

  disablePoolTransitionState(publicDeriver: ?PublicDeriver<>): void {
    maybe(publicDeriver, w => {
      runInAction(() => {
        const publicDeriverId = w.getPublicDeriverId();
        this.poolTransitionConfig[publicDeriverId] = undefined;
        if (this.poolTransitionRequestInfo[publicDeriverId] != null) {
          // we don't delete the suggestion state because then it would get fetched again automatically
          // so just flag it as completely disabled for that wallet
          this.poolTransitionRequestInfo[publicDeriverId].shouldShowTransitionFunnel = false;
        }
      });
    });
  }

  @action checkPoolTransition: () => Promise<void> = async () => {
    const publicDeriver = this.stores.wallets.selected;
    if (publicDeriver === null || this.poolTransitionRequestInfo[publicDeriver.getPublicDeriverId()] != null) {
      return;
    }

    const isStakeRegistered = this.stores.delegation.isStakeRegistered(publicDeriver);
    const currentlyDelegating = this.stores.delegation.isCurrentlyDelegating(publicDeriver);
    const currentPool = this.getDelegatedPoolId(publicDeriver);

    if (currentPool == null) {
      return;
    }

    try {

      const { BackendService } = publicDeriver.getParent().getNetworkInfo().Backend;
      const transitionResult = await maybe(currentPool, p =>
        new PoolInfoApi(forceNonNull(BackendService) + '/api').getTransition(p, RustModule.CrossCsl.init)
      );

      const response = {
        currentPool: transitionResult?.current,
        suggestedPool: transitionResult?.suggested,
        deadlineMilliseconds: transitionResult?.deadlineMilliseconds,
        shouldShowTransitionFunnel: transitionResult !== null,
        deadlinePassed: Number(transitionResult?.deadlineMilliseconds) < Date.now(),
      };

      const walletId = publicDeriver.getPublicDeriverId();

      if (
        isStakeRegistered &&
        currentlyDelegating &&
        transitionResult &&
        this.getPoolTransitionConfig(publicDeriver).show === 'closed'
      ) {
        this.setPoolTransitionConfig(publicDeriver, { show: 'open' });
      }

      runInAction(() => {
        this.poolTransitionRequestInfo[walletId] = { ...response };
      })
    } catch (error) {
      console.warn('Failed to check pool transition', error);
    }
  };

  delegateToSpecificPool: (?string) => Promise<void> = async poolId => {
    this.stores.delegation.poolInfoQuery.reset();
    if (poolId == null) {
      await this.actions.ada.delegationTransaction.setPools.trigger([]);
      return;
    }
    await this.actions.ada.delegationTransaction.setPools.trigger([poolId]);
  };

  createDelegationTransaction: void => Promise<void> = async () => {
    const selectedWallet = this.stores.wallets.selected;
    if (selectedWallet == null) {
      return;
    }
    const { delegationTransaction } = this.stores.substores.ada;
    if (delegationTransaction.selectedPools.length === 0) {
      return;
    }
    await this.actions.ada.delegationTransaction.createTransaction.trigger({
      poolRequest: delegationTransaction.selectedPools[0],
      publicDeriver: selectedWallet,
    });
  };

  @action.bound
  reset(): void {
    this.delegationRequests = [];
  }
}
