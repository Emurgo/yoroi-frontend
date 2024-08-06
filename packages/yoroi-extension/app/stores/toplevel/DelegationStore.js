// @flow

import { PoolInfoApi } from '@emurgo/yoroi-lib';
import { GovernanceApi } from '@emurgo/yoroi-lib/dist/governance/emurgo-api';
import { find } from 'lodash';
import { action, observable, runInAction } from 'mobx';
import type { ActionsMap } from '../../actions/index';
import { unwrapStakingKey } from '../../api/ada/lib/storage/bridge/utils';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { asGetStakingKey } from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { PoolMissingApiError } from '../../api/common/errors';
import { MultiToken } from '../../api/common/lib/MultiToken';
import { forceNonNull, maybe } from '../../coreUtils';
import LocalizableError from '../../i18n/LocalizableError';
import Store from '../base/Store';
import type { StoresMap } from '../index';
import type {
  GetDelegatedBalanceFunc,
  GetDelegatedBalanceResponse,
  RewardHistoryFunc,
} from '../../api/ada/lib/storage/bridge/delegationUtils';
import CachedRequest from '../lib/LocalizedCachedRequest';
import LocalizedRequest from '../lib/LocalizedRequest';
import type { MangledAmountsResponse, MangledAmountFunc } from '../stateless/mangledAddresses';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import type { ExplorerPoolInfo as PoolInfo } from '@emurgo/yoroi-lib';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';

export type DelegationRequests = {|
  publicDeriver: PublicDeriver<>,
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

  getPoolTransitionConfig(publicDeriver: ?PublicDeriver<>): PoolTransitionModal {
    return (
      maybe(publicDeriver, w => this.poolTransitionConfig[w.getPublicDeriverId()]) ?? {
        show: 'closed',
        shouldUpdatePool: false,
      }
    );
  }

  @action setPoolTransitionConfig: (?PublicDeriver<>, PoolTransitionModal) => void = (
    publicDeriver: ?PublicDeriver<>,
    config: PoolTransitionModal
  ) => {
    if (publicDeriver != null) {
      this.poolTransitionConfig[publicDeriver.getPublicDeriverId()] = {
        show: config.show,
        shouldUpdatePool: config.shouldUpdatePool,
      };
    }
  };

  @observable poolInfoQuery: LocalizedRequest<(Array<string>) => Promise<void>> = new LocalizedRequest<
    (Array<string>) => Promise<void>
  >(async poolIds => {
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

  getDelegationRequests: (PublicDeriver<>) => void | DelegationRequests = publicDeriver => {
    return find(this.delegationRequests, { publicDeriver });
  };

  _getDelegatedBalanceResult: (PublicDeriver<>) => ?GetDelegatedBalanceResponse = publicDeriver => {
    const delegationRequest = this.getDelegationRequests(publicDeriver);
    return delegationRequest?.getDelegatedBalance.result || null;
  };

  // <TODO:PENDING_REMOVAL> legacy after removing bip44
  isRewardWallet: (PublicDeriver<>) => boolean = publicDeriver => {
    return this.getDelegationRequests(publicDeriver) != null;
  };

  canUnmangleSomeUtxo: (PublicDeriver<>) => boolean = publicDeriver => {
    const canUnmangleAmount: ?MultiToken = this.getDelegationRequests(publicDeriver)?.mangledAmounts.result?.canUnmangle;
    return maybe(canUnmangleAmount, t => t.getDefault().gt(0)) ?? false;
  };

  getMangledAmountsOrZero: (PublicDeriver<>) => MangledAmountsResponse = publicDeriver => {
    const resp: ?MangledAmountsResponse = this.getDelegationRequests(publicDeriver)?.mangledAmounts.result;
    return {
      canUnmangle: resp?.canUnmangle ?? publicDeriver.getParent().getDefaultMultiToken(),
      cannotUnmangle: resp?.cannotUnmangle ?? publicDeriver.getParent().getDefaultMultiToken(),
    };
  };

  hasRewardHistory: (PublicDeriver<>) => boolean = publicDeriver => {
    return this.getDelegationRequests(publicDeriver)?.rewardHistory.result != null;
  };

  isExecutedDelegatedBalance: (PublicDeriver<>) => boolean = publicDeriver => {
    return this.getDelegationRequests(publicDeriver)?.getDelegatedBalance.wasExecuted === true;
  };

  getRewardBalanceOrZero: (PublicDeriver<>) => MultiToken = publicDeriver => {
    if (this.stores.transactions.hasProcessedWithdrawals(publicDeriver)) {
      // In case we have a processed withdrawal for the wallet
      // We cancel out any still present reward, in case it has not synced yet
      return publicDeriver.getParent().getDefaultMultiToken();
    }
    return this._getDelegatedBalanceResult(publicDeriver)?.accountPart ?? publicDeriver.getParent().getDefaultMultiToken();
  };

  getDelegatedUtxoBalance: (PublicDeriver<>) => ?MultiToken = publicDeriver => {
    return this._getDelegatedBalanceResult(publicDeriver)?.utxoPart ?? null;
  };

  getDelegatedPoolId: (PublicDeriver<>) => ?string = publicDeriver => {
    return this._getDelegatedBalanceResult(publicDeriver)?.delegation ?? null;
  };

  isCurrentlyDelegating: (PublicDeriver<>) => boolean = publicDeriver => {
    return this.getDelegatedPoolId(publicDeriver) != null;
  };

  isStakeRegistered: (PublicDeriver<>) => ?boolean = publicDeriver => {
    return this._getDelegatedBalanceResult(publicDeriver)?.stakeRegistered ?? null;
  };

  getLocalPoolInfo: ($ReadOnly<NetworkRow>, string) => void | PoolMeta = (network, poolId) => {
    return find(this.poolInfo, { networkId: network.NetworkId, poolId })?.poolInfo;
  };

  getLocalRemotePoolInfo: ($ReadOnly<NetworkRow>, string) => void | PoolInfo = (network, poolId) => {
    return find(this.poolInfo, { networkId: network.NetworkId, poolId })?.poolRemoteInfo ?? undefined;
  };

  getPoolTransitionInfo(publicDeriver: ?PublicDeriver<>): ?PoolTransition {
    return maybe(publicDeriver, w => this.poolTransitionRequestInfo[w.getPublicDeriverId()]);
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
      });
    } catch (error) {
      console.warn('Failed to check pool transition', error);
    }
  };

  createDelegationTransaction: string => Promise<void> = async poolId => {
    this.stores.delegation.poolInfoQuery.reset();
    await this.stores.delegation.poolInfoQuery.execute([poolId]);
    await this.stores.substores.ada.delegationTransaction.createTransaction({
      poolRequest: poolId,
      publicDeriver: this.stores.wallets.selectedOrFail,
    });
  };

  createDrepDelegationTransaction: string => Promise<void> = async drepCredential => {
    await this.stores.substores.ada.delegationTransaction.createTransaction({
      drepCredential,
      publicDeriver: this.stores.wallets.selectedOrFail,
    });
  };

  checkGovernanceStatus: (PublicDeriver<any>) => any = async publicDeriver => {
    try {
      const withStakingKey = asGetStakingKey(publicDeriver);
      if (withStakingKey == null) {
        throw new Error(`missing staking key functionality`);
      }

      const networkInfo = publicDeriver.getParent().getNetworkInfo();
      const networkId = networkInfo.NetworkId;

      const stakingKeyResp = await withStakingKey.getStakingKey();

      const skey = unwrapStakingKey(stakingKeyResp.addr.Hash).to_keyhash()?.to_hex();
      if (skey == null) {
        throw new Error('Cannot get staking key from the wallet!');
      }
      const backendService = publicDeriver.getParent().getNetworkInfo().Backend.BackendService;
      const backendServiceZero = publicDeriver.getParent().getNetworkInfo().Backend.BackendServiceZero;

      const govApi = new GovernanceApi({
        oldBackendUrl: String(backendService),
        newBackendUrl: String(backendServiceZero),
        networkId,
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
