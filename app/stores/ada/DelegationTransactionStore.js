// @flow

import { observable, action, reaction } from 'mobx';
import BigNumber from 'bignumber.js';
import Store from '../base/Store';
import LocalizedRequest from '../lib/LocalizedRequest';
import environment from '../../environment';
import type {
  CreateDelegationTxFunc,
  SignAndBroadcastDelegationTxFunc,
} from '../../api/ada';
import { buildRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import {
  asGetAllUtxos, asHasUtxoChains, asGetAllAccounting, asGetSigningKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import PublicDeriverWithCachedMeta from '../../domain/PublicDeriverWithCachedMeta';
import type { PoolRequest } from '../../api/ada/lib/storage/bridge/delegationUtils';

export default class DelegationTransactionStore extends Store {

  @observable createDelegationTx: LocalizedRequest<CreateDelegationTxFunc>
    = new LocalizedRequest<CreateDelegationTxFunc>(this.api.ada.createDelegationTx);

  @observable signAndBroadcastDelegationTx: LocalizedRequest<SignAndBroadcastDelegationTxFunc>
    = new LocalizedRequest<SignAndBroadcastDelegationTxFunc>(
      this.api.ada.signAndBroadcastDelegationTx
    );

  /** tracks if wallet balance changed during confirmation screen */
  @observable isStale: boolean = false;

  _updateTxBuilderReaction = reaction(
    () => [
      this.stores.substores.ada.wallets.selected,
      // num tx sync changed => valid inputs may have changed
      this.stores.substores.ada.transactions.totalAvailable,
      // need to recalculate when there are no more pending transactions
      this.stores.substores.ada.transactions.hasAnyPending,
    ],
    () => {
      if (this.createDelegationTx.wasExecuted) {
        this.markStale(true);
      }
    }
  )

  @action.bound
  markStale: boolean => void = (status) => {
    this.isStale = status;
  }

  setup(): void {
    super.setup();
    this.reset();
    const a = this.actions.ada.delegationTransaction;
    a.createTransaction.listen(this._createTransaction);
    a.signTransaction.listen(this._signTransaction);
    a.complete.listen(this._complete);
    a.reset.listen(this.reset);
  }

  @action
  _createTransaction: {|
    publicDeriver: PublicDeriverWithCachedMeta,
    poolRequest: PoolRequest,
  |} => Promise<void> = async (request) => {
    const withUtxos = asGetAllUtxos(request.publicDeriver.self);
    if (withUtxos == null) {
      throw new Error(`${nameof(this._createTransaction)} missing utxo functionality`);
    }
    const withHasUtxoChains = asHasUtxoChains(withUtxos);
    if (withHasUtxoChains == null) {
      throw new Error(`${nameof(this._createTransaction)} missing chains functionality`);
    }
    const withStakingKey = asGetAllAccounting(withHasUtxoChains);
    if (withStakingKey == null) {
      throw new Error(`${nameof(this._createTransaction)} missing staking key functionality`);
    }
    const basePubDeriver = withStakingKey;

    const delegationTxPromise = this.createDelegationTx.execute({
      publicDeriver: basePubDeriver,
      poolRequest: request.poolRequest,
      valueInAccount: this.stores.substores.ada.delegation.stakingKeyState?.state.value ?? 0
    }).promise;
    if (delegationTxPromise == null) {
      throw new Error(`${nameof(this._createTransaction)} should never happen`);
    }
    await delegationTxPromise;

    this.markStale(false);
  }

  @action
  _signTransaction: {|
    password: string,
  |} => Promise<void> = async (request) => {
    const publicDeriver = this.stores.substores.ada.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(this._signTransaction)} no public deriver selected`);
    }
    const withSigning = (asGetSigningKey(publicDeriver.self));
    if (withSigning == null) {
      throw new Error(`${nameof(this._signTransaction)} public deriver missing signing functionality.`);
    }
    const withStakingKey = asGetAllAccounting(withSigning);
    if (withStakingKey == null) {
      throw new Error(`${nameof(this._signTransaction)} missing staking key functionality`);
    }
    const basePubDeriver = withStakingKey;

    const result = this.createDelegationTx.result;
    if (result == null) {
      throw new Error(`${nameof(this._signTransaction)} no tx to broadcast`);
    }
    await this.signAndBroadcastDelegationTx.execute({
      publicDeriver: basePubDeriver,
      signRequest: {
        certificate: result.unsignedTx.certificate,
        changeAddr: result.unsignedTx.changeAddr,
        senderUtxos: result.unsignedTx.senderUtxos,
        unsignedTx: result.unsignedTx.IOs,
      },
      password: request.password,
      sendTx: this.stores.substores.ada.stateFetchStore.fetcher.sendTx,
    }).promise;
  }

  _complete: void => Promise<void> = async () => {
    const publicDeriver = this.stores.substores.ada.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(this._complete)} no public deriver selected`);
    }
    this.actions.dialogs.closeActiveDialog.trigger();
    const { wallets } = this.stores.substores[environment.API];
    await wallets.refreshWallet(publicDeriver);
    this.goToDashboardRoute(publicDeriver.self);
  }

  goToDashboardRoute(publicDeriver: PublicDeriver<>): void {
    const route = buildRoute(ROUTES.WALLETS.PAGE, {
      id: publicDeriver.getPublicDeriverId(),
      page: 'delegation-dashboard'
    });
    this.actions.router.goToRoute.trigger({ route });
  }

  @action.bound
  reset(): void {
    this.signAndBroadcastDelegationTx.reset();
    this.createDelegationTx.reset();
    this.isStale = false;
  }
}
