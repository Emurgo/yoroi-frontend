// @flow

import { observable, action, reaction } from 'mobx';
import BigNumber from 'bignumber.js';
import Store from '../base/Store';
import LocalizedRequest from '../lib/LocalizedRequest';
import type {
  CreateDelegationTxFunc,
  SignAndBroadcastRequest,
  CreateWithdrawalTxFunc,
} from '../../api/ada';
import { buildRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import {
  asGetAllUtxos, asHasUtxoChains, asGetAllAccounting, asGetSigningKey, asGetPublicKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { getCardanoHaskellBaseConfig } from '../../api/ada/lib/storage/database/prepackaged/networks';
import {
  genTimeToSlot, genToRelativeSlotNumber,
} from '../../api/ada/lib/storage/bridge/timeUtils';
import {
  getRegistrationHistory,
} from '../../api/ada/lib/storage/bridge/delegationUtils';
import { genOwnStakingKey } from '../../api/ada/index';
import {
  isLedgerNanoWallet,
  isTrezorTWallet,
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import { ApiMethodNotYetImplementedError } from '../lib/Request';

export default class AdaDelegationTransactionStore extends Store {

  @observable selectedPools: Array<string>;

  @observable createWithdrawalTx: LocalizedRequest<CreateWithdrawalTxFunc>
    = new LocalizedRequest<CreateWithdrawalTxFunc>(this.api.ada.createWithdrawalTx);

  @observable createDelegationTx: LocalizedRequest<CreateDelegationTxFunc>
    = new LocalizedRequest<CreateDelegationTxFunc>(this.api.ada.createDelegationTx);

  @observable signAndBroadcastDelegationTx: LocalizedRequest<
    typeof AdaDelegationTransactionStore.prototype.sendAndRefresh
  > = new LocalizedRequest<typeof AdaDelegationTransactionStore.prototype.sendAndRefresh>(
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
  _setPools: Array<string> => Promise<void> = async (pools) => {
    this.selectedPools = pools;
    if (pools.length > 0) {
      try {
        await this.stores.delegation.poolInfoQuery.execute(pools);
      } catch (_e) { /* error handled by request */ }
    }
  }

  @action.bound
  markStale: boolean => void = (status) => {
    this.isStale = status;
  }

  setup(): void {
    super.setup();
    this.reset({ justTransaction: false });
    const { ada } = this.actions;
    ada.delegationTransaction.createTransaction.listen(this._createTransaction);
    ada.delegationTransaction.signTransaction.listen(this._signTransaction);
    ada.delegationTransaction.complete.listen(this._complete);
    ada.delegationTransaction.setPools.listen(this._setPools);
    ada.delegationTransaction.reset.listen(this.reset);
  }

  @action
  _createTransaction: {|
    publicDeriver: PublicDeriver<>,
    poolRequest: string | void,
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
    const withPublicKey = asGetPublicKey(withStakingKey);
    if (withPublicKey == null) {
      throw new Error(`${nameof(this._createTransaction)} missing public key functionality`);
    }
    const basePubDeriver = withPublicKey;

    const delegationRequests = this.stores.delegation.getDelegationRequests(
      request.publicDeriver
    );
    if (delegationRequests == null) {
      throw new Error(`${nameof(AdaDelegationTransactionStore)}::${nameof(this._createTransaction)} called for non-reward wallet`);
    }

    const fullConfig = getCardanoHaskellBaseConfig(
      withHasUtxoChains.getParent().getNetworkInfo(),
    );
    const toRelativeSlotNumber = await genToRelativeSlotNumber(fullConfig);
    const timeToSlot = await genTimeToSlot(fullConfig);
    const absSlotNumber = new BigNumber(timeToSlot({ time: new Date() }).slot);
    const currentEpoch = toRelativeSlotNumber(
      timeToSlot({
        time: new Date(),
      }).slot
    ).epoch;

    const delegationTxPromise = this.createDelegationTx.execute({
      publicDeriver: basePubDeriver,
      poolRequest: request.poolRequest,
      computeRegistrationStatus: async () => (await getRegistrationHistory({
        publicDeriver: basePubDeriver,
        stakingKeyAddressId: (await withStakingKey.getStakingKey()).addr.AddressId,
        toRelativeSlotNumber,
        currentEpoch,
      })).currEpoch,
      valueInAccount: delegationRequests.getDelegatedBalance.result?.accountPart
        ?? new BigNumber(0),
      absSlotNumber,
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
    const withStakingKey = asGetAllAccounting(request.publicDeriver);
    if (withStakingKey == null) {
      throw new Error(`${nameof(this._signTransaction)} missing staking key functionality`);
    }

    const result = this.createDelegationTx.result;
    if (result == null) {
      throw new Error(`${nameof(this._signTransaction)} no tx to broadcast`);
    }
    if (isLedgerNanoWallet(request.publicDeriver.getParent())) {
      throw new ApiMethodNotYetImplementedError();
    }
    if (isTrezorTWallet(request.publicDeriver.getParent())) {
      await this.signAndBroadcastDelegationTx.execute({
        broadcastRequest: {
          trezor: {
            publicDeriver: withStakingKey,
            signRequest: result.signTxRequest,
          }
        },
        refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(
          request.publicDeriver
        ),
      }).promise;
      return;
    }
    // normal password-based wallet
    const withSigning = (asGetSigningKey(withStakingKey));
    if (withSigning == null) {
      throw new Error(`${nameof(this._signTransaction)} public deriver missing signing functionality.`);
    }
    if (request.password == null) {
      throw new Error(`${nameof(this._signTransaction)} missing password for non-hardware signing`);
    }
    const { password } = request;
    await this.signAndBroadcastDelegationTx.execute({
      broadcastRequest: {
        normal: {
          publicDeriver: withSigning,
          signRequest: result.signTxRequest,
          getStakingWitnesses: async () => await genOwnStakingKey({
            publicDeriver: withSigning,
            password,
          }),
          password: request.password,
          sendTx: this.stores.substores.ada.stateFetchStore.fetcher.sendTx,
        }
      },
      refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(
        request.publicDeriver
      ),
    }).promise;
  }

  _complete: void => void = () => {
    this.actions.dialogs.closeActiveDialog.trigger();
    this.goToDashboardRoute();
  }

  goToDashboardRoute(): void {
    const route = buildRoute(ROUTES.WALLETS.DELEGATION_DASHBOARD);
    this.actions.router.goToRoute.trigger({ route });
  }

  sendAndRefresh: {|
    broadcastRequest: {|
      normal: SignAndBroadcastRequest,
    |} | {|
     trezor: {|
        publicDeriver: PublicDeriver<>,
        signRequest: HaskellShelleyTxSignRequest,
     |},
    |},
    refreshWallet: () => Promise<void>,
  |} => Promise<void> = async (request) => {
    const refresh = async () => {
      try {
        await request.refreshWallet();
      } catch (_e) {
        // even if refreshing the wallet fails, we don't want to fail the tx
        // otherwise user may try and re-send the tx
      }
    };
    if (request.broadcastRequest.trezor) {
      await this.actions.ada.trezorSend.sendUsingTrezor.trigger({
        params: { signRequest: request.broadcastRequest.trezor.signRequest },
        publicDeriver: request.broadcastRequest.trezor.publicDeriver,
      });
      const { error } = this.stores.substores.ada.trezorSend;
      this.actions.ada.trezorSend.reset.trigger();
      if (error) {
        throw error;
      }
    }
    if (request.broadcastRequest.normal) {
      await this.api.ada.signAndBroadcast(
        request.broadcastRequest.normal
      );
    }
    await refresh();
  }

  @action.bound
  reset(request: {| justTransaction: boolean |}): void {
    this.signAndBroadcastDelegationTx.reset();
    this.createDelegationTx.reset();
    if (!request.justTransaction) {
      this.isStale = false;
      this.selectedPools = [];
    }
  }
}
