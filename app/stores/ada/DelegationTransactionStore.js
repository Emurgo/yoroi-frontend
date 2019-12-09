// @flow

import { observable, action, reaction, runInAction } from 'mobx';
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
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import {
  asGetAllUtxos, asHasUtxoChains, asGetAllAccounting, asGetSigningKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type {
  IGetAllUtxosResponse
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { PoolRequest } from '../../actions/ada/delegation-transaction-actions';
import {
  filterAddressesByStakingKey,
  groupAddrContainsAccountKey,
} from '../../api/ada/lib/storage/bridge/utils';
import type { V3UnsignedTxAddressedUtxoResponse } from '../../api/ada/transactions/types';

export default class DelegationTransactionStore extends Store {

  @observable createDelegationTx: LocalizedRequest<CreateDelegationTxFunc>
    = new LocalizedRequest<CreateDelegationTxFunc>(this.api.ada.createDelegationTx);

  @observable signAndBroadcastDelegationTx: LocalizedRequest<SignAndBroadcastDelegationTxFunc>
    = new LocalizedRequest<SignAndBroadcastDelegationTxFunc>(
      this.api.ada.signAndBroadcastDelegationTx
    );

  @observable amountToDelegate: BigNumber;

  /** tracks if wallet balance changed during confirmation screen */
  @observable isStale: boolean = false;

  _updateTxBuilderReaction = reaction(
    () => [
      this.stores.substores.ada.wallets.selected,
      // last tx sync changed => utxo set may have changed
      this.stores.substores.ada.wallets.selected &&
        this.stores.substores.ada.wallets.selected.lastSyncInfo.SlotNum,
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
    a.reset.listen(this.reset);
  }

  @action
  _createTransaction: PoolRequest => Promise<void> = async (request) => {
    const publicDeriver = this.stores.substores.ada.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(this._createTransaction)} no public deriver selected`);
    }
    const withUtxos = asGetAllUtxos(publicDeriver.self);
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

    let stakingKey;
    {
      const stakingKeyResp = await basePubDeriver.getStakingKey();
      const accountAddress = RustModule.WalletV3.Address.from_bytes(
        Buffer.from(stakingKeyResp.addr.Hash, 'hex')
      ).to_account_address();
      if (accountAddress == null) {
        throw new Error(`${nameof(this._createTransaction)} staking key invalid`);
      }
      stakingKey = accountAddress.get_account_key();
    }

    const certificate = createCertificate(stakingKey, request);

    const delegationTxPromise = this.createDelegationTx.execute({
      publicDeriver: basePubDeriver,
      certificate: RustModule.WalletV3.Certificate.stake_delegation(certificate),
    }).promise;
    if (delegationTxPromise == null) {
      throw new Error(`${nameof(this._createTransaction)} should never happen`);
    }
    const delegationTx = await delegationTxPromise;

    {
      const allUtxo = await basePubDeriver.getAllUtxos();
      const allUtxosForKey = filterAddressesByStakingKey(
        stakingKey,
        allUtxo
      );
      const utxoSum = allUtxosForKey.reduce(
        (sum, utxo) => sum.plus(new BigNumber(utxo.output.UtxoTransactionOutput.Amount)),
        new BigNumber(0)
      );

      const differenceAfterTx = getDifferenceAfterTx(
        delegationTx,
        allUtxo,
        stakingKey
      );

      // we substract any part of the fee that comes from UTXO of the staking key
      const total = utxoSum.plus(differenceAfterTx);
      runInAction(() => { this.amountToDelegate = total; });
    }

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
    this.signAndBroadcastDelegationTx.execute({
      publicDeriver: basePubDeriver,
      signRequest: {
        certificate: result.certificate,
        changeAddr: result.changeAddr,
        senderUtxos: result.senderUtxos,
        unsignedTx: result.IOs,
      },
      password: request.password,
      sendTx: this.stores.substores.ada.stateFetchStore.fetcher.sendTx,
    });

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
    this.amountToDelegate = new BigNumber(0);
  }
}

function createCertificate(
  stakingKey: RustModule.WalletV3.PublicKey,
  poolRequest: PoolRequest,
): RustModule.WalletV3.StakeDelegation {
  if (poolRequest == null) {
    return RustModule.WalletV3.StakeDelegation.new(
      RustModule.WalletV3.DelegationType.non_delegated(),
      stakingKey
    );
  }
  if (Array.isArray(poolRequest)) {
    const partsTotal = poolRequest.reduce((sum, pool) => sum + pool.part, 0);
    const ratios = RustModule.WalletV3.PoolDelegationRatios.new();
    for (const pool of poolRequest) {
      ratios.add(RustModule.WalletV3.PoolDelegationRatio.new(
        RustModule.WalletV3.PoolId.from_hex(pool.id),
        pool.part
      ));
    }
    const delegationRatio = RustModule.WalletV3.DelegationRatio.new(
      partsTotal,
      ratios,
    );
    if (delegationRatio == null) {
      throw new Error(`${nameof(createCertificate)} invalid ratio`);
    }
    return RustModule.WalletV3.StakeDelegation.new(
      RustModule.WalletV3.DelegationType.ratio(delegationRatio),
      stakingKey
    );
  }
  return RustModule.WalletV3.StakeDelegation.new(
    RustModule.WalletV3.DelegationType.full(
      RustModule.WalletV3.PoolId.from_hex(poolRequest.id)
    ),
    stakingKey
  );
}

/**
 * Sending the transaction may affect the amount delegated in a few ways:
 * 1) The transaction fee for the transaction
 *  - may be paid with UTXO that either does or doesn't belong to our staking key.
 * 2) The change for the transaction
 *  - may get turned into a group address for our staking key
 */
function getDifferenceAfterTx(
  utxoResponse: V3UnsignedTxAddressedUtxoResponse,
  allUtxos: IGetAllUtxosResponse,
  stakingKey: RustModule.WalletV3.PublicKey,
): BigNumber {
  const stakingKeyString = Buffer.from(stakingKey.as_bytes()).toString('hex');

  let sumInForKey = new BigNumber(0);
  {
    // note senderUtxos.length is approximately 1
    // since it's just to cover transaction fees
    // so this for loop is faster than building a map
    for (const senderUtxo of utxoResponse.senderUtxos) {
      const match = allUtxos.find(utxo => (
        utxo.output.Transaction.Hash === senderUtxo.tx_hash &&
        utxo.output.UtxoTransactionOutput.OutputIndex === senderUtxo.tx_index
      ));
      if (match == null) {
        throw new Error(`${nameof(getDifferenceAfterTx)} utxo not found. Should not happen`);
      }
      const address = match.address;
      if (groupAddrContainsAccountKey(address, stakingKeyString)) {
        sumInForKey = sumInForKey.plus(new BigNumber(senderUtxo.amount));
      }
    }
  }

  let sumOutForKey = new BigNumber(0);
  {
    const outputs = utxoResponse.IOs.outputs();
    for (let i = 0; i < outputs.size(); i++) {
      const output = outputs.get(i);
      const address = Buffer.from(output.address().as_bytes()).toString('hex');
      if (groupAddrContainsAccountKey(address, stakingKeyString)) {
        const value = new BigNumber(output.value().to_str());
        sumOutForKey = sumOutForKey.plus(value);
      }
    }
  }

  return sumOutForKey.minus(sumInForKey);
}
