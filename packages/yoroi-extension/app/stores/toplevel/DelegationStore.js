// @flow

import { action, observable } from 'mobx';
import { find } from 'lodash';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import LocalizedRequest from '../lib/LocalizedRequest';
import Store from '../base/Store';
import CachedRequest from '../lib/LocalizedCachedRequest';
import LocalizableError from '../../i18n/LocalizableError';
import { PoolMissingApiError } from '../../api/common/errors';
import type { MangledAmountFunc, MangledAmountsResponse } from '../stateless/mangledAddresses';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import type { PoolInfo } from '@emurgo/yoroi-lib';
import { PoolInfoApi } from '@emurgo/yoroi-lib';
import { MultiToken } from '../../api/common/lib/MultiToken';
import { maybe } from '../../coreUtils';
import type {
  GetDelegatedBalanceFunc,
  GetDelegatedBalanceResponse,
  RewardHistoryFunc,
} from '../../api/ada/lib/storage/bridge/delegationUtils';

import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { environment } from '../../environment';
import { runInAction } from 'mobx';
import { addressBech32ToHex } from '../../api/ada/lib/cardanoCrypto/utils';
import { bech32 } from 'bech32';

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

type Pool = {|
  id: string,
  hash: string,
  ticker: string,
  name: string,
  pic: ?string,
  stake: string,
  share: string,
  roa: string,
  saturation: string,
  taxFix: string,
  taxRatio: string,
|};

export type PoolTransition = {|
  currentPool: ?PoolInfo,
  deadlineMilliseconds: ?number,
  shouldShowTransitionFunnel: boolean,
  suggestedPool: ?PoolInfo,
|};

type PoolTransitionModal = {| show: 'open' | 'closed' | 'idle', shouldUpdatePool: boolean |};

export default class DelegationStore extends Store<StoresMap, ActionsMap> {
  @observable delegationRequests: Array<DelegationRequests> = [];
  @observable poolTransitionRequestInfo: ?PoolTransition = null;
  @observable poolTransitionConfig: PoolTransitionModal = {
    show: 'closed',
    shouldUpdatePool: false,
  };

  @action setPoolTransitionConfig: any => void = (config: PoolTransitionModal) => {
    this.poolTransitionConfig.show = config.show;
    this.poolTransitionConfig.shouldUpdatePool = config.shouldUpdatePool;
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
    this.checkPoolTransition();
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
    const canUnmangleAmount: ?MultiToken = this.getDelegationRequests(publicDeriver)?.mangledAmounts
      .result?.canUnmangle;
    return maybe(canUnmangleAmount, t => t.getDefault().gt(0)) ?? false;
  };

  getMangledAmountsOrZero: (PublicDeriver<>) => MangledAmountsResponse = publicDeriver => {
    const resp: ?MangledAmountsResponse = this.getDelegationRequests(publicDeriver)?.mangledAmounts
      .result;
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
    return (
      this._getDelegatedBalanceResult(publicDeriver)?.accountPart ??
      publicDeriver.getParent().getDefaultMultiToken()
    );
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

  getLocalRemotePoolInfo: ($ReadOnly<NetworkRow>, string) => void | PoolInfo = (
    network,
    poolId
  ) => {
    return (
      find(this.poolInfo, { networkId: network.NetworkId, poolId })?.poolRemoteInfo ?? undefined
    );
  };

  //   exports.EMURGO_POOLS = {
  //     old: {
  //         emurgo: [
  //             'pool14u30jkg45xwd27kmznz43hxy596lvrrpj0wz8w9a9k97kmt4p2d',
  //             'pool1qs6h0y7czzt605kptmrv6cr85kxd6tajr2hs0etvxphv7tr7nqu',
  //             'pool1cd987kw92e3nmjywcfwfws79a09rwp0p0xj5mdtr39qukxgp9uf',
  //             'pool1c55n72ag3tz8g7rntzuu9a86u7eugsy008xl3xsje8kwgvz2vdz',
  //             'pool13mas2wthxs28zftxskcsd8t87jk2w9ntc0u5uflt45sh7lcvs8h',
  //             'pool1pmm654jfx088td54ekkkd0j28x6r5gnjdhnutzggursrxjnpk2y' // Pool [EMUR8] Emurgo #8
  //         ],
  //         yoroi: [
  //             'pool1mut4phum9hegtl8m2r68gpjh5x8w8t6zwf75zrphhp3qwwrrpgt' // Pool [YOROI] Yoroi
  //         ]
  //     },
  //     new: {
  //         emurgo: [
  //             'pool1m0drnjxsvnlesq0rwmur2rh6lenuql57jfzd6cf6aegj2cv7ugy',
  //             'pool1xkwnlr34tjrnkz6u4c0p36cju3xuls4dyynsdkf6cv22ksuhz6q' // Pool [EMURB] Emurgo B
  //         ],
  //         yoroi: [
  //             'pool192pfftt48zc4x5aellvpufk6l6zxllpldw0rx82vrhqrqfhhqs2',
  //             'pool1kx0jm9ycs3t99tnwafw6w72jkdlzhj5ltxe2nrzkd9x2u5x343h' // Pool [YORO2] Yoroi pool 2
  //         ]
  //     }
  // };

  checkPoolTransition: () => Promise<void> = async () => {
    const publicDeriver = this.stores.wallets.selected;
    if (publicDeriver === null) {
      return;
    }

    const isStakeRegistered = this.stores.delegation.isStakeRegistered(publicDeriver);
    const currentlyDelegating = this.stores.delegation.isCurrentlyDelegating(publicDeriver);
    const currentPool = this.getDelegatedPoolId(publicDeriver);

    try {
      const remotePoolTransitionInfoPromises = new PoolInfoApi()
        .getTransition(String(currentPool), RustModule.CrossCsl.init)
        .then(res => res);

      const transitionResult = await Promise.resolve(remotePoolTransitionInfoPromises);

      const response = {
        currentPool: transitionResult?.current,
        suggestedPool: transitionResult?.suggested,
        deadlineMilliseconds: transitionResult?.deadlineMilliseconds,
        shouldShowTransitionFunnel: environment.isDev(),
      };

      if (
        isStakeRegistered &&
        currentlyDelegating &&
        transitionResult &&
        this.poolTransitionConfig.show === 'closed'
      ) {
        this.setPoolTransitionConfig({ show: 'open' });
      }

      runInAction(() => {
        this.poolTransitionRequestInfo = { ...response };
      });
    } catch (error) {
      console.warn(error);
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
