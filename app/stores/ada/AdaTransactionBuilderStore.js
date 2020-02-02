// @flow

import BigNumber from 'bignumber.js';
import { action, computed, observable, reaction, runInAction, toJS } from 'mobx';
import Store from '../base/Store';
import LocalizedRequest from '../lib/LocalizedRequest';
import type {
  CreateUnsignedTxFunc,
} from '../../api/ada';

import type { BaseSignRequest } from '../../api/ada/transactions/types';
import { IGetFee, ITotalInput, ITxEqual, copySignRequest } from '../../api/ada/transactions/utils';
import {
  asGetAllUtxos, asHasUtxoChains,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import type {
  IGetAllUtxosResponse, IHasUtxoChains,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';

type SetupSelfTxFunc = {|
  publicDeriver: IHasUtxoChains,
  filter: ElementOf<IGetAllUtxosResponse> => boolean,
|} => Promise<void>;

/**
 * TODO: we make the following assumptions
 * - only single output for transaction
 * - inputs are not manually selected
 *
 * These can be loosened later to create a manual UTXO selection feature
 */
export default class AdaTransactionBuilderStore extends Store {

  @observable shouldSendAll: boolean;
  /** Stores the tx information as the user is building it */
  @observable plannedTxInfo: Array<{ ...InexactSubset<TxOutType<number>> }>;
  /** Stores the tx used to generate the information on the send form */
  @observable plannedTx: null | BaseSignRequest<
    RustModule.WalletV2.Transaction | RustModule.WalletV3.InputOutput
  >;
  /** Stores the tx that will be sent if the user confirms sending */
  @observable tentativeTx: null | BaseSignRequest<
    RustModule.WalletV2.Transaction | RustModule.WalletV3.InputOutput
  >;

  @observable filter: ElementOf<IGetAllUtxosResponse> => boolean;

  /** tracks mismatch between `plannedTx` and `tentativeTx` */
  @observable txMismatch: boolean = false;

  // REQUESTS
  @observable createUnsignedTx: LocalizedRequest<CreateUnsignedTxFunc>
    = new LocalizedRequest<CreateUnsignedTxFunc>(this.api.ada.createUnsignedTx);

  @observable setupSelfTx: LocalizedRequest<SetupSelfTxFunc>
    = new LocalizedRequest<SetupSelfTxFunc>(this._setupSelfTx);

  setup(): void {
    super.setup();
    this._reset();
    const actions = this.actions.ada.txBuilderActions;
    actions.updateReceiver.listen(this._updateReceiver);
    actions.setFilter.listen(this._setFilter);
    actions.updateAmount.listen(this._updateAmount);
    actions.updateTentativeTx.listen(this._updateTentativeTx);
    actions.toggleSendAll.listen(this._toggleSendAll);
    actions.reset.listen(this._reset);
  }

  // =============
  //   computed
  // =============

  @computed get
  fee(): ?BigNumber {
    if (!this.plannedTx) {
      return undefined;
    }
    return IGetFee(this.plannedTx, true);
  }

  @computed get
  totalInput(): ?BigNumber {
    if (!this.plannedTx) {
      return undefined;
    }
    return ITotalInput(this.plannedTx, true);
  }

  // ================
  //   tentative tx
  // ================

  _mismatchReaction = reaction(
    () => [
      this.plannedTx,
      this.tentativeTx,
    ],
    () => runInAction(() => { this.txMismatch = this._txMismatch(); })
  );

  // ==============
  //   planned tx
  // ==============

  _updatePlannedTxReaction = reaction(
    () => this.createUnsignedTx.result,
    () => this._updatePlannedTx(),
  )

  _updatePlannedTx: void => void = () => {
    if (!this.createUnsignedTx.result) {
      runInAction(() => {
        this.plannedTx = null;
      });
      return;
    }
    const result = this.createUnsignedTx.result;

    const certificate = result.certificate == null
      ? undefined
      : result.certificate;
    runInAction(() => {
      this.plannedTx = {
        senderUtxos: result.senderUtxos,
        unsignedTx: result.txBuilder
          ? result.txBuilder.make_transaction()
          : result.IOs,
        changeAddr: result.changeAddr,
        certificate,
      };
    });
  }

  // ==============
  //   tx builder
  // ==============

  _updateTxBuilderReaction = reaction(
    () => [
      // Need toJS for mobx to react to an array.
      // Note: will not trigger if re-asigned same value
      toJS(this.plannedTxInfo),
      this.shouldSendAll,
      this.stores.substores.ada.wallets.selected,
      // num tx sync changed => valid inputs may have changed
      this.stores.substores.ada.transactions.totalAvailable,
      // need to recalculate when there are no more pending transactions
      this.stores.substores.ada.transactions.hasAnyPending,
    ],
    async () => this._updateTxBuilder(),
  )

  _canCompute(): boolean {
    for (let i = 0; i < this.plannedTxInfo.length; i++) {
      // we only care about the value in non-sendall case
      if (!this.shouldSendAll && this.plannedTxInfo[i].value == null) {
        return false;
      }
      if (this.plannedTxInfo[i].address == null) {
        return false;
      }
    }
    return true;
  }

  /**
   * Note: need to check state outside of runInAction
   * Otherwise reaction won't trigger
   */
  _updateTxBuilder: void => Promise<void> = async () => {
    runInAction(() => {
      this.createUnsignedTx.reset();
      this.plannedTx = null;
    });
    const publicDeriver = this.stores.substores.ada.wallets.selected;
    if (!publicDeriver || !this._canCompute()) {
      return;
    }

    // type-cast to assert non-null
    const plannedTxInfo = (this.plannedTxInfo);

    const receiver = plannedTxInfo[0].address;
    if (receiver == null) return;
    const amount = plannedTxInfo[0].value != null
      ? plannedTxInfo[0].value.toString()
      : null;
    const shouldSendAll = this.shouldSendAll;

    if (this.createUnsignedTx.isExecuting) {
      this.createUnsignedTx.cancel();
    }

    const withUtxos = asGetAllUtxos(publicDeriver.self);
    if (withUtxos == null) {
      throw new Error('_updateTxBuilder missing utxo functionality');
    }
    const withHasUtxoChains = asHasUtxoChains(withUtxos);
    if (withHasUtxoChains == null) {
      throw new Error('_updateTxBuilder missing chains functionality');
    }
    if (amount == null && shouldSendAll === true) {
      await this.createUnsignedTx.execute({
        publicDeriver: withHasUtxoChains,
        receiver,
        shouldSendAll,
        filter: this.filter,
      });
    } else if (amount != null) {
      await this.createUnsignedTx.execute({
        publicDeriver: withHasUtxoChains,
        receiver,
        amount,
        filter: this.filter,
      });
    }
  }

  // ===========
  //   actions
  // ===========

  @action
  _toggleSendAll: void => void = () => {
    this._updateAmount();
    this.shouldSendAll = !this.shouldSendAll;
  }

  /** Should only set to valid address or undefined */
  @action
  _updateReceiver: (void | string) => void = (receiver) => {
    this.plannedTxInfo[0].address = receiver;
  }

  @action
  _setFilter: (ElementOf<IGetAllUtxosResponse> => boolean) => void = (filter) => {
    this.filter = filter;
  }

  /** Should only set to valid amount or undefined */
  @action
  _updateAmount: (void | number) => void = (value) => {
    this.plannedTxInfo[0].value = value;
  }

  @action
  _updateTentativeTx: void => void = () => {
    if (!this.plannedTx) {
      this.tentativeTx = null;
      return;
    }
    this.tentativeTx = this._cloneTx(this.plannedTx);
  }

  @action
  _reset: void => void = () => {
    this.plannedTxInfo = [{ address: undefined, value: undefined }];
    this.shouldSendAll = false;
    this.filter = () => true;
    this.createUnsignedTx.cancel();
    this.createUnsignedTx.reset();
    this.plannedTx = null;
    this.tentativeTx = null;
    this.setupSelfTx.cancel();
    this.setupSelfTx.reset();
  }

  // =======================================
  //   logic to handle confirmation screen
  // =======================================

  /**
   * We need to clone to tentative tx to avoid the dialog changing
   * when the send page recalculates the utxo
   */
  _cloneTx = (
    signRequest: BaseSignRequest<RustModule.WalletV2.Transaction | RustModule.WalletV3.InputOutput>
  ): BaseSignRequest<RustModule.WalletV2.Transaction | RustModule.WalletV3.InputOutput> => {
    // drop mobx observable behavior
    const copy = toJS(signRequest);

    /* In the Rust code, attempting to sign a transaction is destructive
     * as it frees the pointer to the original tx.
     *
     * To avoid the back button breaking the send page form, we clone the tx
     */
    return copySignRequest(copy);
  }

  /**
   * Check if tx in the confirm dialog matches what the tx would be
   * if they tries to send again (since it may change if UTXO changes)
   */
  _txMismatch: void => boolean = () => {
    if (!this.plannedTx || !this.tentativeTx) {
      // don't change the value when a tx is being recalculated
      // this avoids the UI flickering as the tx gets recalculated
      return this.txMismatch;
    }

    return !ITxEqual(this.tentativeTx, this.plannedTx);
  }

  _setupSelfTx: SetupSelfTxFunc = async (request) => {
    this._setFilter(request.filter);
    const nextUnusedInternal = await request.publicDeriver.nextInternal();
    const addressInfo = nextUnusedInternal.addressInfo;
    if (addressInfo == null) {
      throw new Error(`${nameof(this._setupSelfTx)} ${nameof(addressInfo)} == null`);
    }
    this._updateReceiver(addressInfo.addr.Hash);
    if (this.shouldSendAll === false) {
      this._toggleSendAll();
    }

    await this._updateTxBuilder();
    this._updatePlannedTx();
    this._updateTentativeTx();
  }
}
