// @flow

import { action, observable, } from 'mobx';
import { find } from 'lodash';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import LocalizedRequest from '../lib/LocalizedRequest';
import Store from '../base/Store';
import CachedRequest from '../lib/LocalizedCachedRequest';
import LocalizableError from '../../i18n/LocalizableError';
import { PoolMissingApiError, } from '../../api/common/errors';
import type { MangledAmountFunc, MangledAmountsResponse } from '../stateless/mangledAddresses';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import type { PoolInfo } from '@emurgo/yoroi-lib';
import { MultiToken } from '../../api/common/lib/MultiToken';
import { maybe } from '../../coreUtils';
import type {
  GetDelegatedBalanceFunc,
  GetDelegatedBalanceResponse,
  RewardHistoryFunc
} from '../../api/ada/lib/storage/bridge/delegationUtils';

export type DelegationRequests = {|
  publicDeriverId: number,
  getDelegatedBalance: CachedRequest<GetDelegatedBalanceFunc>,
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
          if (this.getLocalPoolInfo(selectedNetwork.NetworkId, poolId) == null) {
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

  getDelegationRequests: number => void | DelegationRequests = (
    publicDeriverId
  ) => {
    return find(this.delegationRequests, { publicDeriverId });
  }

  _getDelegatedBalanceResult: number => ?GetDelegatedBalanceResponse = (publicDeriverId) => {
    const delegationRequest = this.getDelegationRequests(publicDeriverId);
    return delegationRequest?.getDelegatedBalance.result || null;
  }

  // <TODO:PENDING_REMOVAL> legacy after removing bip44
  isRewardWallet: number => boolean = (publicDeriverId) => {
    return this.getDelegationRequests(publicDeriverId) != null;
  }

  canUnmangleSomeUtxo: number => boolean = (publicDeriverId) => {
    const canUnmangleAmount: ?MultiToken = this.getDelegationRequests(publicDeriverId)
      ?.mangledAmounts.result?.canUnmangle;
    return maybe(canUnmangleAmount, t => t.getDefault().gt(0)) ?? false;
  }

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
  }

  hasRewardHistory: number => boolean = (publicDeriverId) => {
    return this.getDelegationRequests(publicDeriverId)?.rewardHistory.result != null;
  }

  isExecutedDelegatedBalance: number => boolean = (publicDeriverId) => {
    return this.getDelegationRequests(publicDeriverId)?.getDelegatedBalance.wasExecuted === true;
  }

  getRewardBalanceOrZero: (number, number, string) => MultiToken = (
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

    if (this.stores.transactions.hasProcessedWithdrawals(publicDeriverId)) {
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

  @action.bound
  reset(): void {
    this.delegationRequests = [];
  }
}
