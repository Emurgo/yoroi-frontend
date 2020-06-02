// @flow

import { observable, action, reaction } from 'mobx';
import Store from '../base/Store';
import LocalizedRequest from '../lib/LocalizedRequest';
import type {
  CreateDelegationTxFunc,
  SignAndBroadcastDelegationTxRequest, SignAndBroadcastDelegationTxResponse,
} from '../../api/ada';
import { buildRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import {
  asGetAllUtxos, asHasUtxoChains, asGetAllAccounting, asGetSigningKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { PoolRequest } from '../../api/ada/lib/storage/bridge/delegationUtils';
import type { SelectedPool } from '../../actions/ada/delegation-transaction-actions';

export default class DelegationTransactionStore extends Store {

  @observable selectedPools: Array<SelectedPool>;

  @observable createDelegationTx: LocalizedRequest<CreateDelegationTxFunc>
    = new LocalizedRequest<CreateDelegationTxFunc>(this.api.ada.createDelegationTx);

  @observable signAndBroadcastDelegationTx: LocalizedRequest<
    typeof DelegationTransactionStore.prototype.sendAndRefresh
  > = new LocalizedRequest<typeof DelegationTransactionStore.prototype.sendAndRefresh>(
    this.sendAndRefresh
  );

  /** tracks if wallet balance changed during confirmation screen */
  @observable isStale: boolean = false;

  // eslint-disable-next-line no-restricted-syntax
  _updateTxBuilderReaction: (void => mixed) = reaction(
    () => [
      this.stores.wallets.selected,
      // update if tx history changes
      this.stores.transactions.hash,
    ],
    () => {
      if (this.createDelegationTx.wasExecuted) {
        this.markStale(true);
      }
    }
  )

  @action
  _setPools: Array<SelectedPool> => void = (pools) => {
    this.selectedPools = pools;
  }

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
    a.setPools.listen(this._setPools);
    a.reset.listen(this.reset);
  }

  @action
  _createTransaction: {|
    publicDeriver: PublicDeriver<>,
    poolRequest: PoolRequest,
  |} => Promise<void> = async (request) => {
    const withUtxos = asGetAllUtxos(request.publicDeriver);
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

    const delegationRequests = this.stores.substores.ada.delegation.getDelegationRequests(
      request.publicDeriver
    );
    if (delegationRequests == null) {
      throw new Error(`${nameof(DelegationTransactionStore)}::${nameof(this._createTransaction)} called for non-reward wallet`);
    }
    const delegationTxPromise = this.createDelegationTx.execute({
      publicDeriver: basePubDeriver,
      poolRequest: request.poolRequest,
      valueInAccount: delegationRequests.stakingKeyState?.state.value ?? 0
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
    publicDeriver: PublicDeriver<>,
  |} => Promise<void> = async (request) => {
    const withSigning = (asGetSigningKey(request.publicDeriver));
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
      broadcastRequest: {
        publicDeriver: basePubDeriver,
        signRequest: {
          certificate: result.unsignedTx.certificate,
          changeAddr: result.unsignedTx.changeAddr,
          senderUtxos: result.unsignedTx.senderUtxos,
          unsignedTx: result.unsignedTx.IOs,
        },
        password: request.password,
        sendTx: this.stores.substores.ada.stateFetchStore.fetcher.sendTx,
      },
      refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(
        request.publicDeriver
      ),
    }).promise;
  }

  _complete: PublicDeriver<> => void = (publicDeriver) => {
    this.actions.dialogs.closeActiveDialog.trigger();
    this.goToDashboardRoute(publicDeriver);
  }

  goToDashboardRoute(publicDeriver: PublicDeriver<>): void {
    const route = buildRoute(ROUTES.WALLETS.DELEGATION_DASHBOARD, {
      id: publicDeriver.getPublicDeriverId(),
    });
    this.actions.router.goToRoute.trigger({ route });
  }

  sendAndRefresh: {|
    broadcastRequest: SignAndBroadcastDelegationTxRequest,
    refreshWallet: () => Promise<void>,
  |} => Promise<SignAndBroadcastDelegationTxResponse> = async (request) => {
    const result = await this.api.ada.signAndBroadcastDelegationTx(request.broadcastRequest);
    try {
      await request.refreshWallet();
    } catch (_e) {
      // even if refreshing the wallet fails, we don't want to fail the tx
      // otherwise user may try and re-send the tx
    }
    return result;
  }

  @action.bound
  reset(): void {
    this.signAndBroadcastDelegationTx.reset();
    this.createDelegationTx.reset();
    this.isStale = false;
    this.selectedPools = [];
  }
}
