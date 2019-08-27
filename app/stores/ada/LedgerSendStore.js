// @flow
import { action, observable } from 'mobx';

import {
  LedgerBridge,
} from 'yoroi-extension-ledger-connect-handler';
import type {
  SignTransactionResponse as LedgerSignTxResponse
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

import Store from '../base/Store';
import environment from '../../environment';
import Config from '../../config';

import LocalizedRequest from '../lib/LocalizedRequest';
import LocalizableError from '../../i18n/LocalizableError';

import type {
  CreateLedgerSignTxDataFunc,
  PrepareAndBroadcastLedgerSignedTxFunc,
} from '../../api/ada';
import type {
  SendUsingLedgerParams
} from '../../actions/ada/ledger-send-actions';

import {
  convertToLocalizableError
} from '../../domain/LedgerLocalizedError';

import {
  Logger,
  stringifyError,
  stringifyData,
} from '../../utils/logging';

import {
  prepareLedgerBridger,
} from '../../utils/bridgeHandler';

import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';

/** Note: Handles Ledger Signing */
export default class LedgerSendStore extends Store {
  // =================== VIEW RELATED =================== //
  @observable isActionProcessing: boolean = false;
  @observable error: ?LocalizableError;
  // =================== VIEW RELATED =================== //

  // =================== API RELATED =================== //
  createLedgerSignTxDataRequest: LocalizedRequest<CreateLedgerSignTxDataFunc>
    = new LocalizedRequest<CreateLedgerSignTxDataFunc>(this.api.ada.createLedgerSignTxData);

  broadcastLedgerSignedTxRequest: LocalizedRequest<PrepareAndBroadcastLedgerSignedTxFunc>
    = new LocalizedRequest<PrepareAndBroadcastLedgerSignedTxFunc>(
      this.api.ada.prepareAndBroadcastLedgerSignedTx
    );
  // =================== API RELATED =================== //

  setup() {
    const ledgerSendAction = this.actions.ada.ledgerSend;
    ledgerSendAction.init.listen(this._init);
    ledgerSendAction.sendUsingLedger.listen(this._send);
    ledgerSendAction.cancel.listen(this._cancel);
  }

  /** setup() is called when stores are being created
    * _init() is called when Confirmation dailog is about to show */
  _init = (): void => {
    Logger.debug('LedgerSendStore::_init called');
  }

  _reset() {
    this._setActionProcessing(false);
    this._setError(null);
  }

  _preSendValidation = (): void => {
    if (this.isActionProcessing) {
      // this Error will be converted to LocalizableError()
      throw new Error('Can\'t send another transaction if one transaction is in progress.');
    }

    const { wallets, addresses } = this.stores.substores[environment.API];
    const activeWallet = wallets.active;
    if (!activeWallet) {
      // this Error will be converted to LocalizableError()
      throw new Error('Active wallet required before sending.');
    }

    const accountId = addresses._getAccountIdByWalletId(activeWallet.id);
    if (accountId == null) {
      // this Error will be converted to LocalizableError()
      throw new Error('Active account required before sending.');
    }
  }

  /** Generates a payload with Ledger format and tries Send ADA using Ledger signing */
  _send = async (params: SendUsingLedgerParams): Promise<void> => {
    let ledgerBridge: LedgerBridge;
    try {
      Logger.debug('LedgerSendStore::_send::called: ' + stringifyData(params));
      ledgerBridge = new LedgerBridge({
        connectionType: Config.wallets.hardwareWallet.ledgerNanoS.DEFAULT_TRANSPORT_PROTOCOL
      });

      this.createLedgerSignTxDataRequest.reset();
      this.broadcastLedgerSignedTxRequest.reset();

      this._preSendValidation();

      this._setError(null);
      this._setActionProcessing(true);


      const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
      this.createLedgerSignTxDataRequest.execute({
        ...params,
        getUTXOsForAddresses: stateFetcher.getUTXOsForAddresses,
        getTxsBodiesForUTXOs: stateFetcher.getTxsBodiesForUTXOs,
      });
      if (!this.createLedgerSignTxDataRequest.promise) throw new Error('should never happen');
      const ledgerSignTxDataResp = await this.createLedgerSignTxDataRequest.promise;

      await prepareLedgerBridger(ledgerBridge);

      const ledgerSignTxResp: LedgerSignTxResponse =
        await ledgerBridge.signTransaction(
          ledgerSignTxDataResp.ledgerSignTxPayload.inputs,
          ledgerSignTxDataResp.ledgerSignTxPayload.outputs,
        );

      await this._prepareAndBroadcastSignedTx(
        ledgerSignTxResp,
        params.signRequest.unsignedTx,
      );
    } catch (error) {
      Logger.error('LedgerSendStore::_send::error: ' + stringifyError(error));
      this._setError(convertToLocalizableError(error));
    } finally {
      this.createLedgerSignTxDataRequest.reset();
      this.broadcastLedgerSignedTxRequest.reset();
      ledgerBridge && ledgerBridge.dispose();
      this._setActionProcessing(false);
    }
  };

  _prepareAndBroadcastSignedTx = async (
    ledgerSignTxResp: LedgerSignTxResponse,
    unsignedTx: RustModule.Wallet.Transaction,
  ): Promise<void> => {
    try {
      await this.broadcastLedgerSignedTxRequest.execute({
        ledgerSignTxResp,
        unsignedTx,
        sendTx: this.stores.substores[environment.API].stateFetchStore.fetcher.sendTx,
      }).promise;
    } catch (error) {
      Logger.error('LedgerSendStore::_prepareAndBroadcastSignedTx error: ' + stringifyError(error));
    }

    this.actions.dialogs.closeActiveDialog.trigger();
    const { wallets } = this.stores.substores[environment.API];
    await wallets.refreshWalletsData();

    const activeWallet = wallets.active;
    if (activeWallet) {
      // go to transaction screen
      wallets.goToWalletRoute(activeWallet.id);
    }

    this._reset();
    Logger.info('SUCCESS: ADA sent using Ledger SignTx');
  }

  _cancel = (): void => {
    if (!this.isActionProcessing) {
      this.actions.dialogs.closeActiveDialog.trigger();
      this._reset();
    }
  }

  @action _setActionProcessing = (processing: boolean): void => {
    this.isActionProcessing = processing;
  }

  @action _setError = (error: ?LocalizableError): void => {
    this.error = error;
  }
}
