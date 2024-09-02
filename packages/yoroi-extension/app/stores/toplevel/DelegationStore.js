// @flow

import { action, observable, runInAction } from 'mobx';
import { find } from 'lodash';
import LocalizedRequest from '../lib/LocalizedRequest';
import Store from '../base/Store';
import { GovernanceApi } from '@emurgo/yoroi-lib/dist/governance/emurgo-api';
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
import { unwrapStakingKey } from '../../api/ada/lib/storage/bridge/utils';

import type {
  GetDelegatedBalanceFunc,
  GetDelegatedBalanceResponse,
  RewardHistoryFunc,
} from '../../api/ada/lib/storage/bridge/delegationUtils';
import { getNetworkById } from '../../api/ada/lib/storage/database/prepackaged/networks';
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

  @observable governanceStatus: any = null;

  @action setGovernanceStatus: any => void = (status: any) => {
    this.governanceStatus = status;
  };
  @observable poolTransitionRequestInfo: { [number]: ?PoolTransition } = {};
  @observable poolTransitionConfig: { [number]: ?PoolTransitionModal } = {};

  getPoolTransitionConfig(publicDeriver: ?{ publicDeriverId: number, ... }): PoolTransitionModal {
    return (
      maybe(publicDeriver, w => this.poolTransitionConfig[w.publicDeriverId]) ?? {
        show: 'closed',
        shouldUpdatePool: false,
      }
    );
  }

  @action setPoolTransitionConfig: (?{ publicDeriverId: number, ... }, PoolTransitionModal) => void = (
    publicDeriver, config
  ) => {
    if (publicDeriver != null) {
      this.poolTransitionConfig[publicDeriver.publicDeriverId] = {
        show: config.show,
        shouldUpdatePool: config.shouldUpdatePool,
      };
    }
  };

  @observable poolInfoQuery: LocalizedRequest<(Array<string>) => Promise<void>> = new LocalizedRequest(
    async poolIds => {
      const { selected } = this.stores.wallets;
      if (selected == null) throw new Error(`${nameof(DelegationStore)} no wallet selected`);
      const network = getNetworkById(selected.networkId);
      await this.stores.substores.ada.delegation.updatePoolInfo({
        network,
        allPoolIds: poolIds,
      });
      // make sure all the pools were found or throw an error
      for (const poolId of poolIds) {
        if (this.getLocalPoolInfo(selected.networkId, poolId) == null) {
          throw new PoolMissingApiError();
        }
      }
    }
  );

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

  getLocalPoolInfo: (number, string) => void | PoolMeta = (networkId, poolId) => {
    return find(this.poolInfo, { networkId, poolId })?.poolInfo;
  }

  getLocalRemotePoolInfo: (number, string) => void | PoolInfo = (networkId, poolId) => {
    return find(this.poolInfo, { networkId, poolId })?.poolRemoteInfo ?? undefined;
  }

  getPoolTransitionInfo(wallet: ?{ publicDeriverId: number, ... }): ?PoolTransition {
    return maybe(wallet, w => this.poolTransitionRequestInfo[w.publicDeriverId]);
  }

  disablePoolTransitionState(wallet: ?{ publicDeriverId: number, ... }): void {
    maybe(wallet, w => {
      runInAction(() => {
        const { publicDeriverId } = w;
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
    if (publicDeriver === null || this.poolTransitionRequestInfo[publicDeriver.publicDeriverId] != null) {
      return;
    }

    const isStakeRegistered = this.stores.delegation.isStakeRegistered(publicDeriver.publicDeriverId);
    const currentlyDelegating = this.stores.delegation.isCurrentlyDelegating(publicDeriver.publicDeriverId);
    const currentPool = this.getDelegatedPoolId(publicDeriver.publicDeriverId);

    if (currentPool == null) {
      return;
    }

    try {
      const { BackendService } = getNetworkById(publicDeriver.networkId).Backend;
      const transitionResult = await maybe(currentPool, p =>
        new PoolInfoApi(forceNonNull(BackendService) + '/api')
          // $FlowIgnore
          .getTransition(p, RustModule.CrossCsl.init)
      );

      const response = {
        currentPool: transitionResult?.current,
        suggestedPool: transitionResult?.suggested,
        deadlineMilliseconds: transitionResult?.deadlineMilliseconds,
        shouldShowTransitionFunnel: transitionResult !== null,
        deadlinePassed: Number(transitionResult?.deadlineMilliseconds) < Date.now(),
      };

      if (
        isStakeRegistered &&
        currentlyDelegating &&
        transitionResult &&
        this.getPoolTransitionConfig(publicDeriver).show === 'closed'
      ) {
        this.setPoolTransitionConfig(publicDeriver, { show: 'open' });
      }

      runInAction(() => {
        this.poolTransitionRequestInfo[publicDeriver.publicDeriverId] = { ...response };
      })
    } catch (error) {
      console.warn('Failed to check pool transition', error);
    }
  };

  createDelegationTransaction: string => Promise<void> = async poolId => {
    this.stores.delegation.poolInfoQuery.reset();
    await this.stores.delegation.poolInfoQuery.execute([poolId]);
    await this.stores.substores.ada.delegationTransaction.createTransaction({
      poolRequest: poolId,
      wallet: this.stores.wallets.selectedOrFail,
    });
  };

  createDrepDelegationTransaction: string => Promise<void> = async drepCredential => {
    await this.stores.substores.ada.delegationTransaction.createTransaction({
      drepCredential,
      publicDeriver: this.stores.wallets.selectedOrFail,
    });
  };

  checkGovernanceStatus: ({
    stakingAddress: string, networkId: number, ...
  }) => Promise<void> = async publicDeriver => {
    try {
      const skey = unwrapStakingKey(publicDeriver.stakingAddress).to_keyhash()?.to_hex();
      if (skey == null) {
        throw new Error('Cannot get staking key from the wallet!');
      }
      const { Backend }  = getNetworkById(publicDeriver.networkId);
      const { BackendService, BackendServiceZero } = Backend;
      if (!BackendService || !BackendServiceZero) {
        throw new Error('unexpectedly missing backend');
      }
      const govApi = new GovernanceApi({
        oldBackendUrl: BackendService,
        newBackendUrl: BackendServiceZero,
        networkId: publicDeriver.networkId,
        wasmFactory: RustModule.CrossCsl.init,
      });

      const governanceStatus = await govApi.getAccountState(skey, skey);

      this.setGovernanceStatus(governanceStatus);
    } catch (e) {
      console.warn(e);
    }
  };

  @action.bound
  reset(): void {
    this.delegationRequests = [];
  }
}
