// @flow

import BigNumber from 'bignumber.js';
import { action, computed, observable, reaction, runInAction, toJS } from 'mobx';
import Store from '../base/Store';
import LocalizedRequest from '../lib/LocalizedRequest';
import type {
  CreateUnsignedTxFunc,
} from '../../api/ada';

import type { ISignRequest } from '../../api/common/lib/transactions/ISignRequest';
import {
  asGetAllUtxos, asHasUtxoChains,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import type {
  IGetAllUtxosResponse, IHasUtxoChains,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { getCardanoHaskellBaseConfig } from '../../api/ada/lib/storage/database/prepackaged/networks';
import {
  genTimeToSlot,
} from '../../api/ada/lib/storage/bridge/timeUtils';

export type SetupSelfTxRequest = {|
  publicDeriver: IHasUtxoChains,
  filter: ElementOf<IGetAllUtxosResponse> => boolean,
|};
export type SetupSelfTxFunc = SetupSelfTxRequest => Promise<void>;

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
  @observable plannedTxInfo: Array<{| ...InexactSubset<TxOutType<number>>, |}>;
  /** Stores the tx used to generate the information on the send form */
  @observable plannedTx: null | ISignRequest<any>;
  /** Stores the tx that will be sent if the user confirms sending */
  @observable tentativeTx: null | ISignRequest<any>;

  @observable filter: ElementOf<IGetAllUtxosResponse> => boolean;

  /** tracks mismatch between `plannedTx` and `tentativeTx` */
  @observable txMismatch: boolean = false;

  // REQUESTS
  @observable createUnsignedTx: LocalizedRequest<CreateUnsignedTxFunc>
    // TODO: This should not be ADA-specific
    = new LocalizedRequest<CreateUnsignedTxFunc>(this.api.ada.createUnsignedTx);

  @observable memo: void | string;

  @observable setupSelfTx: LocalizedRequest<SetupSelfTxFunc>
    = new LocalizedRequest<SetupSelfTxFunc>(this._setupSelfTx);

  setup(): void {
    super.setup();
    this._reset();
    const actions = this.actions.txBuilderActions;
    actions.updateReceiver.listen(this._updateReceiver);
    actions.setFilter.listen(this._setFilter);
    actions.updateAmount.listen(this._updateAmount);
    actions.updateMemo.listen(this._updateMemo);
    actions.updateTentativeTx.listen(this._updateTentativeTx);
    actions.toggleSendAll.listen(this._toggleSendAll);
    actions.initialize.listen(this._initialize);
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
    return this.plannedTx.fee(true);
  }

  @computed get
  totalInput(): ?BigNumber {
    if (!this.plannedTx) {
      return undefined;
    }
    return this.plannedTx.totalInput(true);
  }

  // ================
  //   tentative tx
  // ================

  // eslint-disable-next-line no-restricted-syntax
  _mismatchReaction: void => mixed = reaction(
    () => [
      this.plannedTx,
      this.tentativeTx,
    ],
    () => runInAction(() => { this.txMismatch = this._txMismatch(); })
  );

  // ==============
  //   planned tx
  // ==============

  // eslint-disable-next-line no-restricted-syntax
  _updatePlannedTxReaction: void => mixed = reaction(
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

    runInAction(() => {
      this.plannedTx = result;
    });
  }

  // ==============
  //   tx builder
  // ==============

  // eslint-disable-next-line no-restricted-syntax
  _updateTxBuilderReaction: void => mixed = reaction(
    () => [
      // Need toJS for mobx to react to an array.
      // Note: will not trigger if re-assigned same value
      toJS(this.plannedTxInfo),
      this.shouldSendAll,
      this.stores.wallets.selected,
      // update if tx history changes
      this.stores.transactions.hash,
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
    const publicDeriver = this.stores.wallets.selected;
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

    const withUtxos = asGetAllUtxos(publicDeriver);
    if (withUtxos == null) {
      throw new Error(`${nameof(this._updateTxBuilder)} missing utxo functionality`);
    }
    const withHasUtxoChains = asHasUtxoChains(withUtxos);
    if (withHasUtxoChains == null) {
      throw new Error(`${nameof(this._updateTxBuilder)} missing chains functionality`);
    }

    // TODO: should not be ADA-specific
    const fullConfig = getCardanoHaskellBaseConfig(
      withHasUtxoChains.getParent().getNetworkInfo(),
    );
    const timeToSlot = await genTimeToSlot(fullConfig);
    // TODO: should not be ADA-specific
    const absSlotNumber = new BigNumber(timeToSlot({ time: new Date() }).slot);

    if (amount == null && shouldSendAll === true) {
      await this.createUnsignedTx.execute({
        publicDeriver: withHasUtxoChains,
        receiver,
        shouldSendAll,
        filter: this.filter,
        absSlotNumber,
      });
    } else if (amount != null) {
      await this.createUnsignedTx.execute({
        publicDeriver: withHasUtxoChains,
        receiver,
        amount,
        filter: this.filter,
        absSlotNumber,
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
  _updateMemo: (void | string) => void = (content) => {
    this.memo = content;
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
  _initialize: SetupSelfTxRequest => Promise<void> = async (request) => {
    await this.setupSelfTx.execute(request);
  }

  @action
  _reset: void => void = () => {
    this.plannedTxInfo = [{ address: undefined, value: undefined }];
    this.shouldSendAll = false;
    this.memo = undefined;
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
  _cloneTx: ISignRequest<mixed> => ISignRequest<mixed> = (
    signRequest
  ) => {
    /* In the Rust code, it may be that signing a transaction is destructive
     * as it frees the pointer to the original tx.
     *
     * To avoid the back button breaking the send page form, we clone the tx
     */
    return toJS( // drop mobx observable behavior
      signRequest
    );
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

    return !this.tentativeTx.isEqual(this.plannedTx.self().unsignedTx);
  }

  _setupSelfTx: SetupSelfTxFunc = async (request): Promise<void> => {
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
