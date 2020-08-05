// @flow

import { observable, action, } from 'mobx';
import { find } from 'lodash';
import type { NetworkRow } from '../../api/ada/lib/storage/database/primitives/tables';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import LocalizedRequest from '../lib/LocalizedRequest';
import Store from '../base/Store';
import type {
  GetDelegatedBalanceFunc,
  GetCurrentDelegationFunc,
} from '../../api/common/lib/storage/bridge/delegationUtils';
import CachedRequest from '../lib/LocalizedCachedRequest';
import LocalizableError from '../../i18n/LocalizableError';
import type {
  RewardTuple, ReputationObject,
} from '../../api/jormungandr/lib/state-fetch/types';
import { getApiForNetwork } from '../../api/common/utils';
import {
  PoolMissingApiError,
} from '../../api/common/errors';

export type RewardHistoryForWallet = string => Promise<Array<RewardTuple>>;

export type DelegationRequests = {|
  publicDeriver: PublicDeriver<>,
  getDelegatedBalance: CachedRequest<GetDelegatedBalanceFunc>,
  getCurrentDelegation: CachedRequest<GetCurrentDelegationFunc>,
  rewardHistory: CachedRequest<RewardHistoryForWallet>,
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
  // TODO: we need to get information about how much pledge and whether the pledge is met
  +reputation: ReputationObject, // TODO: decide what to do. Replace with community standard?
|};

export default class DelegationStore extends Store {

  @observable delegationRequests: Array<DelegationRequests> = [];

  @observable poolInfoQuery: LocalizedRequest<Array<string> => Promise<void>>
    = new LocalizedRequest<Array<string> => Promise<void>>(async poolIds => {
      const { selectedNetwork } = this.stores.profile;
      if (selectedNetwork == null) throw new Error(`${nameof(DelegationStore)} no network selected`);
      const api = getApiForNetwork(selectedNetwork);
      if (this.stores.substores[api].delegation) {
        await this.stores.substores[api].delegation.updatePoolInfo({
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

  // TODO: refine input type to staking key wallets only
  getDelegationRequests: PublicDeriver<> => void | DelegationRequests = (
    publicDeriver
  ) => {
    const foundRequest = find(this.delegationRequests, { publicDeriver });
    if (foundRequest) return foundRequest;

    return undefined; // can happen if the wallet is not a Shelley wallet
  }

  getLocalPoolInfo: (
    $ReadOnly<NetworkRow>,
    string,
  ) => void | PoolMeta = (network, poolId) => {
    return find(this.poolInfo, { networkId: network.NetworkId, poolId })?.poolInfo;
  }

  @action.bound
  reset(): void {
    this.delegationRequests = [];
  }
}
