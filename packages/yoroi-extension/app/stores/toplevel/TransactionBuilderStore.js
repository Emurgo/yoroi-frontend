// @flow

import BigNumber from 'bignumber.js';
import { action, computed, observable, reaction, runInAction, toJS } from 'mobx';
import Store from '../base/Store';
import LocalizedRequest from '../lib/LocalizedRequest';

import type { ISignRequest } from '../../api/common/lib/transactions/ISignRequest';
import type { IGetAllUtxosResponse } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import {
  isCardanoHaskell, getCardanoHaskellBaseConfig, getNetworkById,
} from '../../api/ada/lib/storage/database/prepackaged/networks';
import type { TransactionMetadata } from '../../api/ada/lib/storage/bridge/metadataUtils';
import {
  MultiToken,
} from '../../api/common/lib/MultiToken';
import type { TokenRow, } from '../../api/ada/lib/storage/database/primitives/tables';
import { getDefaultEntryToken } from './TokenInfoStore';
import {
  cardanoMinAdaRequiredFromAssets_coinsPerWord,
} from '../../api/ada/transactions/utils';
import { getReceiveAddress } from '../stateless/addressStores';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import { maxSendableADA } from '../../api/ada/transactions/shelley/transactions';
import type { WalletState } from '../../../chrome/extension/background/types';

export type SetupSelfTxRequest = {|
  publicDeriver: WalletState,
  filter: ElementOf<IGetAllUtxosResponse> => boolean,
|};
export type SetupSelfTxFunc = SetupSelfTxRequest => Promise<void>;

export type PlannedTxInfoMap = Array<{|
  token: $ReadOnly<TokenRow>,
  shouldSendAll?: boolean,
  amount?: string,
|}>;

export type MaxSendableAmountRequest =
  LocalizedRequest<DeferredCall<BigNumber>>;

/**
 * TODO: we make the following assumptions
 * - only single output for transaction
 * - inputs are not manually selected
 *
 * These can be loosened later to create a manual UTXO selection feature
 */
export default class TransactionBuilderStore extends Store<StoresMap, ActionsMap> {

  /** Stores the tx information as the user is building it */
  @observable plannedTxInfoMap: PlannedTxInfoMap= [];

  @observable receiver: string | null;
  /** Stores the tx used to generate the information on the send form */
  @observable plannedTx: null | ISignRequest<any>;
  /** Stores the tx that will be sent if the user confirms sending */
  @observable tentativeTx: null | ISignRequest<any>;

  @observable filter: ElementOf<IGetAllUtxosResponse> => boolean;
  @observable metadata: Array<TransactionMetadata> | void;

  /** tracks mismatch between `plannedTx` and `tentativeTx` */
  @observable txMismatch: boolean = false;
  @observable shouldSendMax: boolean = false;
  // REQUESTS
  @observable createUnsignedTx: LocalizedRequest<DeferredCall<ISignRequest<any>>>
    = new LocalizedRequest<DeferredCall<ISignRequest<any>>>(async func => await func());

  @observable maxSendableAmount: MaxSendableAmountRequest
    = new LocalizedRequest<DeferredCall<BigNumber>>(async func => await func());

  @observable memo: void | string;

  @observable setupSelfTx: LocalizedRequest<SetupSelfTxFunc>
    = new LocalizedRequest<SetupSelfTxFunc>(this._setupSelfTx);

  @observable selectedToken: void | $ReadOnly<TokenRow>;

  setup(): void {
    super.setup();
    this._reset();
    const actions = this.actions.txBuilderActions;
    actions.updateReceiver.listen(this._updateReceiver);
    actions.setFilter.listen(this._setFilter);
    actions.updateAmount.listen(this._updateAmount);
    actions.updateMemo.listen(this._updateMemo);
    actions.addToken.listen(this._addToken);
    actions.calculateMaxAmount.listen(this._maxSendableAmount)
    actions.deselectToken.listen(this._deselectToken)
    actions.removeTokens.listen(this._removeTokens);
    actions.updateTentativeTx.listen(this._updateTentativeTx);
    actions.updateSendAllStatus.listen(this._updateSendAllStatus);
    actions.initialize.listen(this._initialize);
    actions.reset.listen(this._reset);
    actions.updateMetadata.listen(this._updateMetadata);
  }

  // =============
  //   computed
  // =============

  @computed get
  fee(): ?MultiToken {
    if (!this.plannedTx) {
      return undefined;
    }
    return this.plannedTx.fee();
  }

  @computed get
  totalInput(): ?MultiToken {
    if (!this.plannedTx) {
      return undefined;
    }
    return this.plannedTx.totalInput();
  }

  @computed get
  minAda(): ?MultiToken {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) throw new Error(`${nameof(this.minAda)} requires wallet to be selected`);
    const network = getNetworkById(publicDeriver.networkId);
    const defaultToken = this.stores.tokenInfoStore.getDefaultTokenInfo(network.NetworkId)
    if (!isCardanoHaskell(network)) return;

    let minAmount;
    if (this.isDefaultIncluded && this.plannedTxInfoMap.length === 1) {
      // When sending only ADA the min amount is  0.999978 ADA
      // Should be rounded to be 1 ADA
      minAmount = String(1_000_000);
    } else {
      minAmount = this.calculateMinAda(this.plannedTxInfoMap.map(({ token }) => ({ token })));
    }

    return new MultiToken([{
        identifier: defaultToken.Identifier,
        networkId: defaultToken.NetworkId,
        amount: new BigNumber(minAmount),
    }], getDefaultEntryToken(defaultToken))
  }

  @computed get shouldSendAll(): boolean {
    return !!this.plannedTxInfoMap.find(({ shouldSendAll }) => shouldSendAll === true)
  }

  @computed get isDefaultIncluded(): boolean {
    return !!this.plannedTxInfoMap.find(({ token }) => token.IsDefault)
  }

  @computed get maxAssetsAllowed(): number {
    // Note: the exact number might change in the future
    return this.isDefaultIncluded ? 11 : 10
  }

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
      toJS(this.plannedTxInfoMap),
      this.stores.wallets.selected,
      // update if tx history changes
      this.stores.transactions.recent,
      this.receiver,
    ],
    async () => {
      this._updateTxBuilder()

      if (this.plannedTxInfoMap.length !== 0 && this.shouldSendMax === true) {
        this._maxSendableAmount()
      }
    },
  )

  // Generate tokens list for cardano tokens
  _genTokenList(overrightDefaultAmount?: boolean): Array<$ReadOnly<{|
    token: $ReadOnly<TokenRow>,
    amount?: string,
    shouldSendAll?: boolean,
  |}>> {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) throw new Error(`${nameof(this._genTokenList)} requires wallet to be selected`);
    const network = getNetworkById(publicDeriver.networkId);
    const defaultToken = this.stores.tokenInfoStore.getDefaultTokenInfo(network.NetworkId);
    const plannedTxInfoMap = this.plannedTxInfoMap;
    let tokens: PlannedTxInfoMap = [...plannedTxInfoMap];
    /**
     * When sending multi-asset, if the user entered ada less than MIN-ADA
     * it should be OVERWRITTEN.
     */
    const minAmount = this.calculateMinAda(plannedTxInfoMap.map(({ token }) => ({ token })));
    const token = plannedTxInfoMap.find(({ token: t }) => t.IsDefault);

    if (!token) {
      // if the user is sending a token, we need to make sure the resulting utxo
      // has at least the minimum amount of ADA in it
      tokens.push({
        token: defaultToken,
        amount: minAmount,
      });
    } else if (
      (token &&
      token.shouldSendAll === false &&
      token.amount &&
      (new BigNumber(token.amount)).lt(minAmount) &&
      plannedTxInfoMap.length > 1) ||
      overrightDefaultAmount === true
    ) {
      tokens = tokens.filter(({ token: t }) => !t.IsDefault);
      tokens.push({
        token: defaultToken,
        amount: minAmount,
      })
    }

    return tokens.map((txEntry) => ({
        token: txEntry.token,
        amount: txEntry.amount,
        shouldSendAll: Boolean(txEntry.shouldSendAll),
    }));
  }

  _canCompute(): boolean {
    if (this.plannedTxInfoMap.length === 0) return false;
    for (const token of this.plannedTxInfoMap) {
      // we only care about the value in non-sendall case
      if (!token.shouldSendAll) {
        if (token.amount == null || new BigNumber(token.amount).isLessThanOrEqualTo(0)) {
          return false;
        }
      }
      if (this.receiver == null) {
        return false;
      }
    }

    return true;
  }

  calculateMinAda: (tokens: Array<{| token: $ReadOnly<TokenRow> |}>) => string = (tokens) => {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) throw new Error(`${nameof(this.minAda)} requires wallet to be selected`);
    const network = getNetworkById(publicDeriver.networkId);
    const defaultToken = this.stores.tokenInfoStore.getDefaultTokenInfo(network.NetworkId)
    if (!isCardanoHaskell(network)) return '0';
    const filteredTokens = tokens.filter(({ token }) => !token.IsDefault);
    if (filteredTokens.length === 0) return String(1_000_000);
    const fullConfig = getCardanoHaskellBaseConfig(network);
    const squashedConfig = fullConfig.reduce((acc, next) => Object.assign(acc, next), {});
    const fakeAmount = new BigNumber('1000000');
    const fakeMultitoken = new MultiToken(
      [{
        identifier: defaultToken.Identifier,
        networkId: defaultToken.NetworkId,
        amount: fakeAmount,
      },
      ...filteredTokens.map(({ token }) => ({
        identifier: token.Identifier,
        networkId: token.NetworkId,
        amount: fakeAmount,
      }))],
      getDefaultEntryToken(defaultToken)
    );

    const minAmount = cardanoMinAdaRequiredFromAssets_coinsPerWord(
      fakeMultitoken,
      new BigNumber(squashedConfig.CoinsPerUtxoWord),
    );
    return minAmount.toString();
  }

  /**
   * Note: need to check state outside of runInAction
   * Otherwise reaction won't trigger
   */
  _updateTxBuilder: void => Promise<void> = async () => {
    runInAction(() => {
      this.createUnsignedTx.reset();
      this.maxSendableAmount.reset();
      this.plannedTx = null;
    });

    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver || !this._canCompute()) {
      return;
    }

    const receiver = this.receiver;
    if (receiver == null) return;

    if (this.createUnsignedTx.isExecuting) {
      this.createUnsignedTx.cancel();
    }

    const network = getNetworkById(publicDeriver.networkId);

    if (isCardanoHaskell(network)) {
      const { timeToSlot } = this.stores.substores.ada.time.getTimeCalcRequests(publicDeriver).requests;

      const absSlotNumber = new BigNumber(timeToSlot({
        // use server time for TTL if connected to server
        time: this.stores.serverConnectionStore.serverTime ?? new Date(),
      }).slot);

      await this.createUnsignedTx.execute(() => this.api.ada.createUnsignedTx({
        publicDeriver,
        receiver,
        tokens: this._genTokenList(),
        filter: this.filter,
        absSlotNumber,
        metadata: this.metadata,
      }));
    } else {
      throw new Error(`${nameof(TransactionBuilderStore)}::${nameof(this._updateTxBuilder)} network not supported`);
    }
  }

  @action
  _maxSendableAmount: void => Promise<void> = async () =>  {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) throw new Error(`${nameof(this._maxSendableAmount)} requires wallet to be selected.`);

    const { timeToSlot } = this.stores.substores.ada.time.getTimeCalcRequests(publicDeriver).requests;

    this.shouldSendMax = true;
    const absSlotNumber = new BigNumber(timeToSlot({
      time: this.stores.serverConnectionStore.serverTime ?? new Date(),
    }).slot);

    this.maxSendableAmount.execute(() => maxSendableADA({
      publicDeriver,
      absSlotNumber,
      tokens: this._genTokenList(true),
      receiver: this.receiver,
    }))
  }

  // ===========
  //   actions
  // ===========

  @action
  _updateSendAllStatus: (void | boolean) => void = (status) => {
    this._updateAmount(undefined, status || false);
  }

  /** Should only set to valid address or undefined */
  @action
  _updateReceiver: (void | string) => void = (receiver) => {
    this.receiver = receiver ?? null;
  }

  @action
  _setFilter: (ElementOf<IGetAllUtxosResponse> => boolean) => void = (filter) => {
    this.filter = filter;
  }

  /** Should only set to valid amount or undefined */
  @action
  _updateAmount: (
    value: ?BigNumber,
    shouldSendAll?: boolean,
  ) => void = (value, shouldSendAll) => {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) throw new Error(`${nameof(this._updateAmount)} requires wallet to be selected`);
    const selectedToken = (
      this.selectedToken ?? this.stores.tokenInfoStore.getDefaultTokenInfo(publicDeriver.networkId)
    );
    const tokenTxInfo = this.plannedTxInfoMap.find(
      ({ token }) => token.Identifier === selectedToken.Identifier
    );

    if (!tokenTxInfo) {
      this.plannedTxInfoMap.push({
        amount: value ? value.toString() : undefined,
        token: selectedToken,
        shouldSendAll,
      })
    } else {
      tokenTxInfo.amount = value ? value.toString() : undefined;
      tokenTxInfo.shouldSendAll = shouldSendAll;
    }
  }

  @action
  _updateMetadata: (Array<TransactionMetadata> | void) => void = (metadata) => {
    this.metadata = metadata;
  }

  @action
  _updateMemo: (void | string) => void = (content) => {
    this.memo = content;
  }

  @action
  _addToken: ({|
    token: void | $ReadOnly<TokenRow>,
    shouldSendAll: void | boolean,
    shouldReset?: boolean,
  |}) => void = ({ token, shouldReset, shouldSendAll }) => {
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) throw new Error(`${nameof(this._addToken)} requires wallet to be selected`);

    const selectedToken = (
      token ?? this.stores.tokenInfoStore.getDefaultTokenInfo(publicDeriver.networkId)
    );
    const tokensToAdd = [{ token: selectedToken, shouldSendAll: shouldSendAll || false }]

    if (shouldReset === true) {
      this.plannedTxInfoMap = tokensToAdd;
    } else {
        const tokenTxInfo = this.plannedTxInfoMap.find(
          ({ token: t }) => t.Identifier === selectedToken.Identifier
        );

        if (!tokenTxInfo) {
          this.plannedTxInfoMap.push(...tokensToAdd)
        }
    }

    this.selectedToken = token;
    // no `selectedToken` === Selecting the default token.
    // Editing the default token amount means we are not sending the max amount.
    if (!token) this.shouldSendMax = false;
  }

  @action
  _removeTokens: (tokens: Array<$ReadOnly<TokenRow>>) => void = (tokens) => {
    // Todo: Fix removing the default asset
    const publicDeriver = this.stores.wallets.selected;
    if (!publicDeriver) throw new Error(`${nameof(this._removeTokens)} requires wallet to be selected`);

    const tokenIds = new Set();
    tokens.forEach(token => tokenIds.add(token.Identifier))

    this.plannedTxInfoMap = this.plannedTxInfoMap.filter(
      ({ token: t }) => !tokenIds.has(t.Identifier)
    );

    // Deselect the token
    this._deselectToken()
  }

  @action
  _deselectToken: void => void = () => {
    this.selectedToken = undefined;
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
    this.plannedTxInfoMap = [];
    this.memo = undefined;
    this.selectedToken = undefined;
    this.filter = () => true;
    this.metadata = undefined;
    this.createUnsignedTx.cancel();
    this.createUnsignedTx.reset();
    this.maxSendableAmount.cancel()
    this.maxSendableAmount.reset();
    this.plannedTx = null;
    this.tentativeTx = null;
    this.shouldSendMax = false;
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

    return !this.tentativeTx.isEqual(this.plannedTx.self());
  }

  _setupSelfTx: SetupSelfTxFunc = async (request): Promise<void> => {
    this._setFilter(request.filter);
    const nextUnusedInternal = request.publicDeriver.receiveAddress;
    this._updateReceiver(nextUnusedInternal.addr.Hash);
    // Todo: update shouldSendAll
    if (this.shouldSendAll === false) {
      this._updateSendAllStatus(true);
    }

    await this._updateTxBuilder();
    this._updatePlannedTx();
    this._updateTentativeTx();
  }
}
