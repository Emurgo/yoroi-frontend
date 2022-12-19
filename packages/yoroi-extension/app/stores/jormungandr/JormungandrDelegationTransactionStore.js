// @flow

import { observable, action, reaction } from 'mobx';
import Store from '../base/Store';
import LocalizedRequest from '../lib/LocalizedRequest';
import type {
  CreateDelegationTxFunc,
} from '../../api/jormungandr';
import { buildRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import {
  asGetAllUtxos, asHasUtxoChains, asGetAllAccounting, asGetSigningKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { PoolRequest } from '../../api/jormungandr/lib/storage/bridge/delegationUtils';
import type { SelectedPool } from '../../actions/jormungandr/delegation-transaction-actions';
import { MultiToken } from '../../api/common/lib/MultiToken';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';

export default class JormungandrDelegationTransactionStore extends Store<StoresMap, ActionsMap> {

  @observable selectedPools: Array<SelectedPool>;

  @observable createDelegationTx: LocalizedRequest<CreateDelegationTxFunc>
    = new LocalizedRequest<CreateDelegationTxFunc>(this.api.jormungandr.createDelegationTx);

  /** tracks if wallet balance changed during confirmation screen */
  @observable isStale: boolean = false;

  // eslint-disable-next-line no-restricted-syntax
  _updateTxBuilderReaction: (void => mixed) = reaction(
    () => [
      this.stores.wallets.selected,
      // update if tx history changes
      this.stores.transactions.recent,
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
    const { jormungandr } = this.actions;
    jormungandr.delegationTransaction.createTransaction.listen(this._createTransaction);
    jormungandr.delegationTransaction.signTransaction.listen(this._signTransaction);
    jormungandr.delegationTransaction.complete.listen(this._complete);
    jormungandr.delegationTransaction.setPools.listen(this._setPools);
    jormungandr.delegationTransaction.reset.listen(this.reset);
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

    const defaultToken = request.publicDeriver.getParent().getDefaultToken();

    const delegationRequests = this.stores.delegation.getDelegationRequests(
      request.publicDeriver
    );
    if (delegationRequests == null) {
      throw new Error(`${nameof(JormungandrDelegationTransactionStore)}::${nameof(this._createTransaction)} called for non-reward wallet`);
    }
    const delegationTxPromise = this.createDelegationTx.execute({
      publicDeriver: basePubDeriver,
      poolRequest: request.poolRequest,
      valueInAccount: delegationRequests.getDelegatedBalance.result?.accountPart
        ?? new MultiToken([], defaultToken),
    }).promise;
    if (delegationTxPromise == null) {
      throw new Error(`${nameof(this._createTransaction)} should never happen`);
    }
    await delegationTxPromise;

    this.markStale(false);
  }

  @action
  _signTransaction: {|
    password?: string,
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
    const result = this.createDelegationTx.result;
    if (result == null) {
      throw new Error(`${nameof(this._signTransaction)} no tx to broadcast`);
    }
    if (request.password == null) {
      throw new Error(`${nameof(this._signTransaction)} missing password for non-hardware signing`);
    }
    await this.stores.substores.jormungandr.wallets.jormungandrSendAndRefresh({
      broadcastRequest: {
        normal: {
          publicDeriver: request.publicDeriver,
          password: request.password,
          signRequest: result.signTxRequest,
        },
      },
      refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(request.publicDeriver),
    });
  }

  _complete: void => void = () => {
    this.actions.dialogs.closeActiveDialog.trigger();
    this.goToDashboardRoute();
  }

  goToDashboardRoute(): void {
    const route = buildRoute(ROUTES.WALLETS.DELEGATION_DASHBOARD);
    this.actions.router.goToRoute.trigger({ route });
  }

  @action.bound
  reset(): void {
    this.stores.wallets.sendMoneyRequest.reset();
    this.createDelegationTx.reset();
    this.isStale = false;
    this.selectedPools = [];
  }
}
