// @flow

import { observable, action, reaction, runInAction } from 'mobx';
import BigNumber from 'bignumber.js';
import Store from '../base/Store';
import LocalizedRequest from '../lib/LocalizedRequest';
import type {
  CreateDelegationTxFunc,
  CreateWithdrawalTxResponse,
  CreateDelegationTxResponse
} from '../../api/ada';
import { buildRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import type { StoresMap } from '../index';
import type { WalletState } from '../../../chrome/extension/background/types';
import { getProtocolParameters } from '../../api/thunk';

export default class AdaDelegationTransactionStore extends Store<StoresMap> {
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

  @observable error: ?Error = null;

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
  }

  @action
  setShouldDeregister: boolean => void = shouldDeregister => {
    this.shouldDeregister = shouldDeregister;
  };

  @action
  createTransaction: ({|
    wallet: WalletState,
    poolRequest?: string,
    drepCredential?: string,
  |}) => Promise<CreateDelegationTxResponse> = async request => {
    const { timeToSlot } = this.stores.substores.ada.time.getTimeCalcRequests(request.wallet).requests;

    const absSlotNumber = new BigNumber(
      timeToSlot({
        // use server time for TTL if connected to server
        time: this.stores.serverConnectionStore.serverTime ?? new Date(),
      }).slot
    );

    const protocolParameters = await getProtocolParameters(request.wallet);

    const delegationTxPromise = this.createDelegationTx.execute({
      wallet: request.wallet,
      poolRequest: request.poolRequest,
      registrationStatus: this.stores.delegation.isStakeRegistered(request.wallet.publicDeriverId) === true,
      valueInAccount: this.stores.delegation.getRewardBalanceOrZero(request.wallet),
      drepCredential: request.drepCredential,
      absSlotNumber,
      protocolParameters,
    }).promise;

    if (delegationTxPromise == null) {
      throw new Error(`${nameof(this.createTransaction)} should never happen`);
    }
    await delegationTxPromise;

    this.markStale(false);
    return delegationTxPromise;
  };

  @action
  createWithdrawalTxForWallet: ({|
    wallet: WalletState,
  |}) => Promise<CreateWithdrawalTxResponse> = async request => {
    this.createWithdrawalTx.reset();

    const { timeToSlot } = this.stores.substores.ada.time.getTimeCalcRequests(request.wallet).requests;

    const absSlotNumber = new BigNumber(
      timeToSlot({
        // use server time for TTL if connected to server
        time: this.stores.serverConnectionStore.serverTime ?? new Date(),
      }).slot
    );

    const protocolParameters = await getProtocolParameters(request.wallet);

    const unsignedTx = await this.createWithdrawalTx.execute(async () => {
      return await this.api.ada.createWithdrawalTx({
        wallet: request.wallet,
        getAccountState: this.stores.substores.ada.stateFetchStore.fetcher.getAccountState,
        absSlotNumber,
        withdrawals: [
          {
            addressing: request.wallet.stakingAddressing.addressing,
            rewardAddress: request.wallet.stakingAddress,
            shouldDeregister: this.shouldDeregister,
          },
        ],
        protocolParameters,
      });
    }).promise;

    if (unsignedTx == null) throw new Error(`Should never happen`);

    return unsignedTx;
  };

  @action
  signTransaction: ({|
    wallet: WalletState,
    password?: string,
    dialog?: any,
  |}) => Promise<void> = async request => {
    const signRequest = this.createDelegationTx.result?.signTxRequest;
    if (signRequest == null) {
      throw new Error(`${nameof(this.signTransaction)} no tx to broadcast`);
    }
    try {
      await this.stores.transactionProcessingStore.adaSendAndRefresh({
        wallet: request.wallet,
        signRequest,
        password: request.password,
        callback: () => {
          this.stores.delegation.disablePoolTransitionState(request.wallet);
          return this.stores.wallets.refreshWalletFromRemote(request.wallet.publicDeriverId);
        },
      });
    } catch (error) {
      runInAction(() => {
        this.error = error;
      });
      throw error;
    }
    if (request.dialog) this.stores.uiDialogs.open({ dialog: request.dialog });
  };

  complete: void => void = () => {
    this.stores.uiDialogs.closeActiveDialog();
    this.goToDashboardRoute();
  };

  goToDashboardRoute(): void {
    const route = buildRoute(ROUTES.STAKING);
    this.stores.app.goToRoute({ route });
  }

  @action.bound
  reset(request: {| justTransaction: boolean |}): void {
    this.stores.transactionProcessingStore.sendMoneyRequest.reset();
    this.createDelegationTx.reset();
    if (!request.justTransaction) {
      this.isStale = false;
    }
  }
}
