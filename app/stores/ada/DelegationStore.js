// @flow

import { observable, action, reaction, runInAction } from 'mobx';
import Store from '../base/Store';
import LocalizedRequest from '../lib/LocalizedRequest';
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
} from '../../api/ada/lib/state-fetch/types';

export default class DelegationStore extends Store {

  @observable getDelegatedBalance: LocalizedRequest<GetDelegatedBalanceFunc>
    = new LocalizedRequest<GetDelegatedBalanceFunc>(getDelegatedBalance);

  @observable getCurrentDelegation: LocalizedRequest<GetCurrentDelegationFunc>
    = new LocalizedRequest<GetCurrentDelegationFunc>(getCurrentDelegation);

  @observable stakingKeyState: void | AccountStateSuccess;

  _recalculateDelegationInfoDisposer: void => void = () => {};

  setup(): void {
    super.setup();
    this.reset();
    const a = this.actions.ada.delegation;
    a.startWatch.listen(this._startWatch);
    a.reset.listen(this.reset);
  }

  @action.bound
  _startWatch: void => Promise<void> = async () => {
    this._recalculateDelegationInfoDisposer = reaction(
      () => [
        this.stores.substores.ada.wallets.selected,
        // num tx sync changed => valid inputs may have changed
        this.stores.substores.ada.transactions.totalAvailable,
        // need to recalculate when there are no more pending transactions
        this.stores.substores.ada.transactions.hasAnyPending,
      ],
      // $FlowFixMe error in mobx types
      async () => {
        this.getDelegatedBalance.reset();
        this.getCurrentDelegation.reset();
        runInAction(() => {
          this.stakingKeyState = undefined;
        });

        const publicDeriver = this.stores.substores.ada.wallets.selected;
        if (publicDeriver == null) {
          throw new Error(`${nameof(this._startWatch)} no public deriver selected`);
        }
        const withStakingKey = asGetAllAccounting(publicDeriver.self);
        if (withStakingKey == null) {
          throw new Error(`${nameof(this._startWatch)} missing staking key functionality`);
        }

        const stakingKeyResp = await withStakingKey.getStakingKey();

        const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
        const accountStateResp = await stateFetcher.getAccountState({
          addresses: [stakingKeyResp.addr.Hash],
        });
        const stateForStakingKey = accountStateResp[stakingKeyResp.addr.Hash];

        if (!stateForStakingKey.delegation) {
          runInAction(() => {
            this.stakingKeyState = undefined;
            throw new Error(`${stateForStakingKey.error} - ${stateForStakingKey.comment}`);
          });
        } else {
          runInAction(() => {
            this.stakingKeyState = stateForStakingKey;
          });

          const delegatedBalance = this.getDelegatedBalance.execute({
            publicDeriver: withStakingKey,
            accountState: stateForStakingKey,
            stakingPubKey: stakingKeyResp.addr.Hash,
          }).promise;
          if (delegatedBalance == null) throw new Error('Should never happen');

          const currentDelegation = this.getCurrentDelegation.execute({
            publicDeriver: withStakingKey,
            stakingKeyAddressId: stakingKeyResp.addr.AddressId,
          }).promise;
          if (currentDelegation == null) throw new Error('Should never happen');

          await Promise.all([
            delegatedBalance,
            currentDelegation,
          ]);
        }
      },
      {
        fireImmediately: true,
      }
    );
  }

  @action.bound
  reset(): void {
    this._recalculateDelegationInfoDisposer();
    this._recalculateDelegationInfoDisposer = () => {};
    this.getDelegatedBalance.reset();
    this.getCurrentDelegation.reset();
    this.stakingKeyState = undefined;
  }
}
