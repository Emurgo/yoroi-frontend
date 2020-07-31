// @flow

import { observable, action, reaction, runInAction } from 'mobx';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import Store from '../base/Store';

// export type DelegationRequests = {|
//   publicDeriver: PublicDeriver<>,
//   getDelegatedBalance: CachedRequest<GetDelegatedBalanceFunc>,
//   getCurrentDelegation: CachedRequest<GetCurrentDelegationFunc>,
//   rewardHistory: CachedRequest<RewardHistoryForWallet>,
//   error: LocalizableError | any;
// |};

export default class DelegationStore extends Store {

  /**
    * Pool selected in the UI
    */
  @observable selectedPage: number = 0;

  _recalculateDelegationInfoDisposer: void => void = () => {};

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
}
