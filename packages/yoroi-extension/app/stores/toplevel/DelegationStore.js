// @flow

import { action, observable, } from 'mobx';
import { find } from 'lodash';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { PublicDeriver, } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import LocalizedRequest from '../lib/LocalizedRequest';
import Store from '../base/Store';
import type {
  GetCurrentDelegationFunc,
  GetDelegatedBalanceFunc,
  RewardHistoryFunc,
  GetDelegatedBalanceResponse,
} from '../../api/common/lib/storage/bridge/delegationUtils';
import CachedRequest from '../lib/LocalizedCachedRequest';
import LocalizableError from '../../i18n/LocalizableError';
import { PoolMissingApiError, } from '../../api/common/errors';
import type { MangledAmountFunc, MangledAmountsResponse } from '../stateless/mangledAddresses';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import type { PoolInfo } from '@emurgo/yoroi-lib';
import { MultiToken } from '../../api/common/lib/MultiToken';
import { maybe } from '../../coreUtils';

export type DelegationRequests = {|
  publicDeriver: PublicDeriver<>,
  getDelegatedBalance: CachedRequest<GetDelegatedBalanceFunc>,
  // <TODO:PENDING_REMOVAL> Legacy (local history tx)
  getCurrentDelegation: CachedRequest<GetCurrentDelegationFunc>,
  rewardHistory: CachedRequest<RewardHistoryFunc>,
  mangledAmounts: CachedRequest<MangledAmountFunc>,
  error: LocalizableError | any;
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

export default class DelegationStore extends Store<StoresMap, ActionsMap> {

  @observable delegationRequests: Array<DelegationRequests> = [];

  @observable poolInfoQuery: LocalizedRequest<Array<string> => Promise<void>>
    = new LocalizedRequest<Array<string> => Promise<void>>(async poolIds => {
      const { selectedNetwork } = this.stores.profile;
      if (selectedNetwork == null) throw new Error(`${nameof(DelegationStore)} no network selected`);
      if (this.stores.substores.ada.delegation) {
        await this.stores.substores.ada.delegation.updatePoolInfo({
          network: selectedNetwork,
          allPoolIds: poolIds,
        });
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
    this.registerReactions([
      this._changeWallets,
    ]);
    delegation.setSelectedPage.listen(this._setSelectedPage);
  }

  @action
  _setSelectedPage: number => void = (newPage) => {
    this.selectedPage = newPage;
  }

  @action.bound
  _changeWallets: void => void = () => {
    const { selected } = this.stores.wallets;
    if (selected == null) return;

    this.selectedPage = 0;
  }

  getDelegationRequests: PublicDeriver<> => void | DelegationRequests = (
    publicDeriver
  ) => {
    return find(this.delegationRequests, { publicDeriver });
  }

  _getDelegatedBalanceResult: PublicDeriver<> => ?GetDelegatedBalanceResponse = (publicDeriver) => {
    const delegationRequest = this.getDelegationRequests(publicDeriver);
    return delegationRequest?.getDelegatedBalance.result || null;
  }

  // <TODO:PENDING_REMOVAL> legacy after removing bip44
  isRewardWallet: PublicDeriver<> => boolean = (publicDeriver) => {
    return this.getDelegationRequests(publicDeriver) != null;
  }

  canUnmangleSomeUtxo: PublicDeriver<> => boolean = (publicDeriver) => {
    const canUnmangleAmount: ?MultiToken = this.getDelegationRequests(publicDeriver)
      ?.mangledAmounts.result?.canUnmangle;
    return maybe(canUnmangleAmount, t => t.getDefault().gt(0)) ?? false;
  }

  getMangledAmountsOrZero: PublicDeriver<> => MangledAmountsResponse = (publicDeriver) => {
    const resp: ?MangledAmountsResponse = this.getDelegationRequests(publicDeriver)?.mangledAmounts.result;
    return {
      canUnmangle: resp?.canUnmangle ?? publicDeriver.getParent().getDefaultMultiToken(),
      cannotUnmangle: resp?.cannotUnmangle ?? publicDeriver.getParent().getDefaultMultiToken(),
    };
  }

  hasRewardHistory: PublicDeriver<> => boolean = (publicDeriver) => {
    return this.getDelegationRequests(publicDeriver)?.rewardHistory.result != null;
  }

  isExecutedDelegatedBalance: PublicDeriver<> => boolean = (publicDeriver) => {
    return this.getDelegationRequests(publicDeriver)?.getDelegatedBalance.wasExecuted === true;
  }

  getRewardBalanceOrZero: PublicDeriver<> => MultiToken = (publicDeriver) => {
    if (this.stores.transactions.hasProcessedWithdrawals(publicDeriver)) {
      // In case we have a processed withdrawal for the wallet
      // We cancel out any still present reward, in case it has not synced yet
      return publicDeriver.getParent().getDefaultMultiToken();
    }
    return this._getDelegatedBalanceResult(publicDeriver)?.accountPart
      ?? publicDeriver.getParent().getDefaultMultiToken();
  }

  getDelegatedUtxoBalance: PublicDeriver<> => ?MultiToken = (publicDeriver) => {
    return this._getDelegatedBalanceResult(publicDeriver)?.utxoPart ?? null;
  }

  getDelegatedPoolId: PublicDeriver<> => ?string = (publicDeriver) => {
    return this._getDelegatedBalanceResult(publicDeriver)?.delegation ?? null;
  }

  isCurrentlyDelegating: PublicDeriver<> => boolean = (publicDeriver) => {
    return this.getDelegatedPoolId(publicDeriver) != null;
  }

  isStakeRegistered: PublicDeriver<> => ?boolean = (publicDeriver) => {
    return this._getDelegatedBalanceResult(publicDeriver)?.stakeRegistered ?? null;
  }

  getLocalPoolInfo: (
    $ReadOnly<NetworkRow>,
    string,
  ) => void | PoolMeta = (network, poolId) => {
    return find(this.poolInfo, { networkId: network.NetworkId, poolId })?.poolInfo;
  }

  getLocalRemotePoolInfo: (
    $ReadOnly<NetworkRow>,
    string,
  ) => void | PoolInfo = (network, poolId) => {
    return find(this.poolInfo, { networkId: network.NetworkId, poolId })?.poolRemoteInfo ?? undefined;
  }

  @action.bound
  reset(): void {
    this.delegationRequests = [];
  }
}
