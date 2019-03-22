// @flow
import { action, observable } from 'mobx';
import { defineMessages } from 'react-intl';

import {
  LedgerBridge,
} from 'yoroi-extension-ledger-bridge';
import type {
  SignTransactionResponse as LedgerSignTxResponse
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

import type { LedgerSignTxPayload } from '../../domain/HWSignTx';

import Store from '../base/Store';
import environment from '../../environment';
import LocalizedRequest from '../lib/LocalizedRequest';

import LocalizableError, { UnexpectedError } from '../../i18n/LocalizableError';
import globalMessages from '../../i18n/global-messages';

import type {
  CreateLedgerSignTxDataRequest,
  CreateLedgerSignTxDataResponse,
  PrepareAndBroadcastLedgerSignedTxRequest,
} from '../../api/ada';
import type { PrepareAndBroadcastLedgerSignedTxResponse } from '../../api/common';

import {
  Logger,
  stringifyError,
  stringifyData,
} from '../../utils/logging';

import {
  prepareLedgerBridger,
  disposeLedgerBridgeIFrame
} from '../../utils/iframeHandler';

const messages = defineMessages({
  signTxError101: {
    id: 'wallet.send.ledger.error.101',
    defaultMessage: '!!!Signing cancelled on Ledger device. Please retry or reconnect device.',
  },
});

/** Note: Handles Ledger Signing */
export default class LedgerSendStore extends Store {
  // =================== VIEW RELATED =================== //
  @observable isActionProcessing: boolean = false;
  @observable error: ?LocalizableError;
  ledgerBridge: ?LedgerBridge;
  // =================== VIEW RELATED =================== //

  // =================== API RELATED =================== //
  createLedgerSignTxDataRequest: LocalizedRequest<CreateLedgerSignTxDataResponse> =
    new LocalizedRequest(this.api.ada.createLedgerSignTxData);

  broadcastLedgerSignedTxRequest: LocalizedRequest<PrepareAndBroadcastLedgerSignedTxResponse> =
    new LocalizedRequest(this.api.ada.prepareAndBroadcastLedgerSignedTx);
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
    if (this.ledgerBridge == null) {
      Logger.debug('LedgerSendStore::_init new LedgerBridge created');
      this.ledgerBridge = new LedgerBridge();
    }
  }

  _reset() {
    disposeLedgerBridgeIFrame();
    this.ledgerBridge = undefined;

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
    if (!accountId) {
      // this Error will be converted to LocalizableError()
      throw new Error('Active account required before sending.');
    }
  }

  /** Generates a payload with Ledger format and tries Send ADA using Ledger signing */
  _send = async (params: CreateLedgerSignTxDataRequest): Promise<void> => {
    try {
      Logger.debug('LedgerSendStore::_send::called: ' + stringifyData(params));

      this.createLedgerSignTxDataRequest.reset();
      this.broadcastLedgerSignedTxRequest.reset();

      this._preSendValidation();

      this._setError(null);
      this._setActionProcessing(true);

      if (this.ledgerBridge) {
        // Since this.ledgerBridge is undefinable flow need to know that it's a LedgerBridge
        const ledgerBridge: LedgerBridge = this.ledgerBridge;

        const ledgerSignTxDataResp: CreateLedgerSignTxDataResponse =
          await this.createLedgerSignTxDataRequest.execute(params).promise;

        await prepareLedgerBridger(ledgerBridge);

        const unsignedTx: LedgerSignTxPayload = {
          inputs: ledgerSignTxDataResp.ledgerSignTxPayload.inputs,
          outputs: ledgerSignTxDataResp.ledgerSignTxPayload.outputs,
        };

        const ledgerSignTxResp: LedgerSignTxResponse =
          await ledgerBridge.signTransaction(unsignedTx.inputs, unsignedTx.outputs);

        await this._prepareAndBroadcastSignedTx(
          ledgerSignTxResp,
          ledgerSignTxDataResp,
          unsignedTx
        );

      } else {
        throw new Error(`LedgerBridge Error: LedgerBridge is undefined`);
      }
    } catch (error) {
      Logger.error('LedgerSendStore::_send::error: ' + stringifyError(error));
      this._setError(this._convertToLocalizableError(error));
    } finally {
      this.createLedgerSignTxDataRequest.reset();
      this.broadcastLedgerSignedTxRequest.reset();
      this._setActionProcessing(false);
    }
  };

  _prepareAndBroadcastSignedTx = async (
    ledgerSignTxResp: LedgerSignTxResponse,
    createLedgerSignTxDataResp: CreateLedgerSignTxDataResponse,
    unsignedTx: LedgerSignTxPayload,
  ): Promise<void> => {

    const reqParams: PrepareAndBroadcastLedgerSignedTxRequest = {
      ledgerSignTxResp,
      unsignedTx,
      txExt: createLedgerSignTxDataResp.txExt
    };

    try {
      await this.broadcastLedgerSignedTxRequest.execute(reqParams).promise;
    } catch (error) {
      Logger.error('LedgerSendStore::_prepareAndBroadcastSignedTx error: ' + stringifyError(error));
    }

    this.actions.dialogs.closeActiveDialog.trigger();
    const { wallets } = this.stores.substores[environment.API];
    wallets.refreshWalletsData();

    const activeWallet = wallets.active;
    if (activeWallet) {
      // go to transaction screen
      wallets.goToWalletRoute(activeWallet.id);
    }

    this._reset();
    Logger.info('SUCCESS: ADA sent using Ledger SignTx');
  }

  /** Converts error(from API or Ledger API) to LocalizableError */
  _convertToLocalizableError = (error: any): LocalizableError => {
    let localizableError: ?LocalizableError = null;

    if (error instanceof LocalizableError) {
      // It means some API Error has been thrown
      localizableError = error;
    } else if (error && error.message) {
      // Ledger device related error happend, convert then to LocalizableError
      switch (error.message) {
        case 'TransportError: Failed to sign with Ledger device: U2F TIMEOUT':
          localizableError = new LocalizableError(globalMessages.ledgerError101);
          break;
        case 'TransportStatusError: Ledger device: Action rejected by user':
          localizableError = new LocalizableError(messages.signTxError101);
          break;
        default:
          /** we are not able to figure out why Error is thrown
            * make it, Something unexpected happened */
          Logger.error(`LedgerSendStore::_convertToLocalizableError::error: ${error.message}`);
          localizableError = new UnexpectedError();
          break;
      }
    }

    if (!localizableError) {
      /** we are not able to figure out why Error is thrown
        * make it, Something unexpected happened */
      localizableError = new UnexpectedError();
    }

    return localizableError;
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
