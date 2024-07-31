// @flow

import BigNumber from 'bignumber.js';
import { action, observable, reaction } from 'mobx';
import type { ActionsMap } from '../../actions/index';
import type { CreateDelegationTxFunc, CreateWithdrawalTxResponse } from '../../api/ada';
import { isLedgerNanoWallet, isTrezorTWallet } from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetAllAccounting,
  asGetAllUtxos,
  asGetPublicKey,
  asHasUtxoChains,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { ROUTES } from '../../routes-config';
import { buildRoute } from '../../utils/routing';
import Store from '../base/Store';
import type { StoresMap } from '../index';
import LocalizedRequest from '../lib/LocalizedRequest';

export type CreateWithdrawalTxRequest = LocalizedRequest<DeferredCall<CreateWithdrawalTxResponse>>;

export default class AdaDelegationTransactionStore extends Store<StoresMap, ActionsMap> {
  @observable createWithdrawalTx: LocalizedRequest<DeferredCall<CreateWithdrawalTxResponse>> = new LocalizedRequest<
    DeferredCall<CreateWithdrawalTxResponse>
  >(request => request());

  @observable
  createDelegationTx: LocalizedRequest<CreateDelegationTxFunc> = new LocalizedRequest<CreateDelegationTxFunc>(
    this.api.ada.createDelegationTx
  );

  @observable shouldDeregister: boolean = false;

  /** tracks if wallet balance changed during confirmation screen */
  @observable isStale: boolean = false;

  // eslint-disable-next-line no-restricted-syntax
  _updateTxBuilderReaction: void => mixed = reaction(
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
  );

  @action.bound
  markStale: boolean => void = status => {
    this.isStale = status;
  };

  setup(): void {
    super.setup();
    this.reset({ justTransaction: false });
    const { ada } = this.actions;
    ada.delegationTransaction.signTransaction.listen(this._signTransaction);
    ada.delegationTransaction.complete.listen(this._complete);
    ada.delegationTransaction.setShouldDeregister.listen(this._setShouldDeregister);
    ada.delegationTransaction.createWithdrawalTxForWallet.listen(this._createWithdrawalTxForWallet);
    ada.delegationTransaction.reset.listen(this.reset);
  }

  @action
  _setShouldDeregister: boolean => void = shouldDeregister => {
    this.shouldDeregister = shouldDeregister;
  };

  @action
  createTransaction: ({|
    publicDeriver: PublicDeriver<>,
    poolRequest?: string,
    drepCredential?: string,
  |}) => Promise<void> = async request => {
    const publicDeriver = request.publicDeriver;
    const withUtxos = asGetAllUtxos(publicDeriver);
    if (withUtxos == null) {
      throw new Error(`${nameof(this.createTransaction)} missing utxo functionality`);
    }
    const withHasUtxoChains = asHasUtxoChains(withUtxos);
    if (withHasUtxoChains == null) {
      throw new Error(`${nameof(this.createTransaction)} missing chains functionality`);
    }
    const withStakingKey = asGetAllAccounting(withHasUtxoChains);
    if (withStakingKey == null) {
      throw new Error(`${nameof(this.createTransaction)} missing staking key functionality`);
    }
    const withPublicKey = asGetPublicKey(withStakingKey);
    if (withPublicKey == null) {
      throw new Error(`${nameof(this.createTransaction)} missing public key functionality`);
    }
    const basePubDeriver = withPublicKey;

    const { timeToSlot } = this.stores.substores.ada.time.getTimeCalcRequests(publicDeriver).requests;

    const absSlotNumber = new BigNumber(
      timeToSlot({
        // use server time for TTL if connected to server
        time: this.stores.serverConnectionStore.serverTime ?? new Date(),
      }).slot
    );

    const delegationTxPromise = this.createDelegationTx.execute({
      publicDeriver: basePubDeriver,
      poolRequest: request.poolRequest,
      drepCredential: request.drepCredential,
      registrationStatus: this.stores.delegation.isStakeRegistered(publicDeriver) === true,
      valueInAccount: this.stores.delegation.getRewardBalanceOrZero(publicDeriver),
      absSlotNumber,
    }).promise;

    console.log('delegationTxPromise', delegationTxPromise);
    if (delegationTxPromise == null) {
      throw new Error(`${nameof(this.createTransaction)} should never happen`);
    }
    await delegationTxPromise;
    console.log('await delegationTxPromise response', delegationTxPromise);

    this.markStale(false);
  };

  @action
  _createWithdrawalTxForWallet: ({|
    publicDeriver: PublicDeriver<>,
  |}) => Promise<void> = async request => {
    this.createWithdrawalTx.reset();

    const withUtxos = asGetAllUtxos(request.publicDeriver);
    if (withUtxos == null) {
      throw new Error(`${nameof(this._createWithdrawalTxForWallet)} missing utxo functionality`);
    }
    const withHasUtxoChains = asHasUtxoChains(withUtxos);
    if (withHasUtxoChains == null) {
      throw new Error(`${nameof(this._createWithdrawalTxForWallet)} missing chains functionality`);
    }
    const withStakingKey = asGetAllAccounting(withHasUtxoChains);
    if (withStakingKey == null) {
      throw new Error(`${nameof(this._createWithdrawalTxForWallet)} missing staking key functionality`);
    }

    const stakingKeyDbRow = await withStakingKey.getStakingKey();

    const { timeToSlot } = this.stores.substores.ada.time.getTimeCalcRequests(request.publicDeriver).requests;

    const absSlotNumber = new BigNumber(
      timeToSlot({
        // use server time for TTL if connected to server
        time: this.stores.serverConnectionStore.serverTime ?? new Date(),
      }).slot
    );

    const unsignedTx = await this.createWithdrawalTx.execute(async () => {
      return await this.api.ada.createWithdrawalTx({
        publicDeriver: withHasUtxoChains,
        getAccountState: this.stores.substores.ada.stateFetchStore.fetcher.getAccountState,
        absSlotNumber,
        withdrawals: [
          {
            addressing: stakingKeyDbRow.addressing,
            rewardAddress: stakingKeyDbRow.addr.Hash,
            shouldDeregister: this.shouldDeregister,
          },
        ],
      });
    }).promise;

    if (unsignedTx == null) throw new Error(`Should never happen`);
  };

  @action
  _signTransaction: ({|
    publicDeriver: PublicDeriver<>,
    password?: string,
    dialog?: any,
  |}) => Promise<void> = async request => {
    const result = this.createDelegationTx.result;
    if (result == null) {
      throw new Error(`${nameof(this._signTransaction)} no tx to broadcast`);
    }
    const refreshWallet = () => {
      this.stores.delegation.disablePoolTransitionState(request.publicDeriver);
      return this.stores.wallets.refreshWalletFromRemote(request.publicDeriver);
    };
    if (isLedgerNanoWallet(request.publicDeriver.getParent())) {
      await this.stores.substores.ada.wallets.adaSendAndRefresh({
        broadcastRequest: {
          ledger: {
            signRequest: result.signTxRequest,
            publicDeriver: request.publicDeriver,
          },
        },
        refreshWallet,
      });
      return;
    }
    if (isTrezorTWallet(request.publicDeriver.getParent())) {
      await this.stores.substores.ada.wallets.adaSendAndRefresh({
        broadcastRequest: {
          trezor: {
            signRequest: result.signTxRequest,
            publicDeriver: request.publicDeriver,
          },
        },
        refreshWallet,
      });
      return;
    }
    // normal password-based wallet
    if (request.password == null) {
      throw new Error(`${nameof(this._signTransaction)} missing password for non-hardware signing`);
    }
    await this.stores.substores.ada.wallets.adaSendAndRefresh({
      broadcastRequest: {
        normal: {
          publicDeriver: request.publicDeriver,
          password: request.password,
          signRequest: result.signTxRequest,
        },
      },
      refreshWallet,
    });
    if (request.dialog) this.actions.dialogs.open.trigger({ dialog: request.dialog });
  };

  _complete: void => void = () => {
    this.actions.dialogs.closeActiveDialog.trigger();
    this.goToDashboardRoute();
  };

  goToDashboardRoute(): void {
    const isRevamp = this.stores.profile.isRevampTheme;
    const route = buildRoute(isRevamp ? ROUTES.STAKING : ROUTES.WALLETS.DELEGATION_DASHBOARD);
    this.actions.router.goToRoute.trigger({ route });
  }

  @action.bound
  reset(request: {| justTransaction: boolean |}): void {
    this.stores.wallets.sendMoneyRequest.reset();
    this.createDelegationTx.reset();
    if (!request.justTransaction) {
      this.isStale = false;
    }
  }
}
