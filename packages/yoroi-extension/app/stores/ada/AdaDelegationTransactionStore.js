// @flow

import { observable, action, reaction } from 'mobx';
import BigNumber from 'bignumber.js';
import Store from '../base/Store';
import LocalizedRequest from '../lib/LocalizedRequest';
import type { CreateDelegationTxFunc, CreateWithdrawalTxResponse } from '../../api/ada';
import { buildRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import {
  asGetAllUtxos,
  asHasUtxoChains,
  asGetAllAccounting,
  asGetPublicKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  isLedgerNanoWallet,
  isTrezorTWallet,
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';

export type CreateWithdrawalTxRequest =
  LocalizedRequest<DeferredCall<CreateWithdrawalTxResponse>>;

export default class AdaDelegationTransactionStore extends Store<StoresMap, ActionsMap> {
  @observable selectedPools: Array<string>;

  @observable createWithdrawalTx: LocalizedRequest<
    DeferredCall<CreateWithdrawalTxResponse>
  > = new LocalizedRequest<DeferredCall<CreateWithdrawalTxResponse>>(request => request());

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

  @action
  _setPools: (Array<string>) => Promise<void> = async pools => {
    this.selectedPools = pools;
    if (pools.length > 0) {
      try {
        await this.stores.delegation.poolInfoQuery.execute(pools);
      } catch (_e) {
        /* error handled by request */
      }
    }
  };

  @action.bound
  markStale: boolean => void = status => {
    this.isStale = status;
  };

  setup(): void {
    super.setup();
    this.reset({ justTransaction: false });
    const { ada } = this.actions;
    ada.delegationTransaction.createTransaction.listen(this._createTransaction);
    ada.delegationTransaction.signTransaction.listen(this._signTransaction);
    ada.delegationTransaction.complete.listen(this._complete);
    ada.delegationTransaction.setPools.listen(this._setPools);
    ada.delegationTransaction.setShouldDeregister.listen(this._setShouldDeregister);
    ada.delegationTransaction.createWithdrawalTxForWallet.listen(this._createWithdrawalTxForWallet);
    ada.delegationTransaction.reset.listen(this.reset);
  }

  @action
  _setShouldDeregister: boolean => void = shouldDeregister => {
    this.shouldDeregister = shouldDeregister;
  };

  @action
  _createTransaction: ({|
    publicDeriver: PublicDeriver<>,
    poolRequest: string | void,
  |}) => Promise<void> = async request => {
    const publicDeriver = request.publicDeriver;
    const withUtxos = asGetAllUtxos(publicDeriver);
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
    const withPublicKey = asGetPublicKey(withStakingKey);
    if (withPublicKey == null) {
      throw new Error(`${nameof(this._createTransaction)} missing public key functionality`);
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
      registrationStatus: this.stores.delegation.isStakeRegistered(publicDeriver) === true,
      valueInAccount: this.stores.delegation.getRewardBalanceOrZero(publicDeriver),
      absSlotNumber,
    }).promise;
    if (delegationTxPromise == null) {
      throw new Error(`${nameof(this._createTransaction)} should never happen`);
    }
    await delegationTxPromise;

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
      throw new Error(
        `${nameof(this._createWithdrawalTxForWallet)} missing staking key functionality`
      );
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
      throw new Error(
        `${nameof(this._signTransaction)} missing password for non-hardware signing`
      );
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
      this.selectedPools = [];
    }
  }
}
