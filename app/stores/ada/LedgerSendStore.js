// @flow
import { action, observable } from 'mobx';
import { defineMessages } from 'react-intl';

import { LedgerBridge, TARGET_IFRAME_NAME } from 'yoroi-extension-ledger-bridge';
// TODO [LEDGER]: replace by npm module import
import type {
  SignTransactionResponse as LedgerSignTxResponse
} from 'yoroi-extension-ledger-bridge';

import Store from '../base/Store';
import environment from '../../environment';
import LocalizedRequest from '../lib/LocalizedRequest';

import LocalizableError, { UnexpectedError } from '../../i18n/LocalizableError';
import globalMessages from '../../i18n/global-messages';

import type {
  CreateLedgerSignTxDataRequest,
  CreateLedgerSignTxDataResponse,
  BroadcastLedgerSignedTxRequest,
} from '../../api/ada';
import type { BroadcastLedgerSignedTxResponse } from '../../api/common';

import {
  Logger,
  stringifyError,
  stringifyData,
} from '../../utils/logging';

import { getIFrame, prepareLedgerBridger } from '../../utils/iframeHandler';

const messages = defineMessages({
  signTxError101: {
    id: 'wallet.send.ledger.error.101',
    defaultMessage: '!!!Signing cancelled on Ledger device. Please retry.',
    description: '<Signing cancelled on Ledger device. Please retry.> on the Trezor send ADA confirmation dialog.'
  },
});

/** Note: Handles Trezor Signing */
export default class LedgerSendStore extends Store {
  // =================== VIEW RELATED =================== //
  @observable isActionProcessing: boolean = false;
  @observable error: ?LocalizableError;
  ledgerBridge: LedgerBridge;
  // =================== VIEW RELATED =================== //

  // =================== API RELATED =================== //
  createLedgerSignTxDataRequest: LocalizedRequest<CreateLedgerSignTxDataResponse> =
    new LocalizedRequest(this.api.ada.createLedgerSignTxData);

  broadcastLedgerSignedTxRequest: LocalizedRequest<BroadcastLedgerSignedTxResponse> =
    new LocalizedRequest(this.api.ada.broadcastLedgerSignedTx);
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
      this.ledgerBridge = new LedgerBridge(getIFrame(TARGET_IFRAME_NAME));
    }
  }

  _reset() {
    this._setActionProcessing(false);
    this._setError(null);
  }

  _preSendValidation = (): void => {
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

      if (this.isActionProcessing) {
        // this Error will be converted to LocalizableError()
        throw new Error('Can\'t send another transaction if one transaction is in progress.');
      }

      this._setError(null);
      this._setActionProcessing(true);

      this._preSendValidation();

      const ledgerSignTxDataResp: CreateLedgerSignTxDataResponse =
        await this.createLedgerSignTxDataRequest.execute(params).promise;

      await prepareLedgerBridger(this.ledgerBridge);

      // TODO: Fix types
      // inputs: Array<InputTypeUTxO>,
      // outputs: Array<OutputTypeAddress | OutputTypeChange>
      const unsignedTx = {
        inputs: ledgerSignTxDataResp.ledgerSignTxPayload.inputs,
        outputs: ledgerSignTxDataResp.ledgerSignTxPayload.outputs,
        // attributes: {},
      };

      const ledgerSignTxResp: LedgerSignTxResponse = 
        await this.ledgerBridge.signTransaction(unsignedTx.inputs, unsignedTx.outputs);

      await this._broadcastSignedTx(ledgerSignTxResp, ledgerSignTxDataResp, unsignedTx);

    } catch (error) {
      Logger.error('LedgerSendStore::_send::error: ' + stringifyError(error));
      this._setError(this._convertToLocalizableError(error));
    } finally {
      this.createLedgerSignTxDataRequest.reset();
      this.broadcastLedgerSignedTxRequest.reset();
      this._setActionProcessing(false);
    }
  };

  _broadcastSignedTx = async (
    ledgerSignTxResp: LedgerSignTxResponse,
    createLedgerSignTxDataResp: CreateLedgerSignTxDataResponse,
    unsignedTx: any
  ): Promise<void> => {

    const reqParams: BroadcastLedgerSignedTxRequest = {
      ledgerSignTxResp,
      unsignedTx,
      changeAdaAddr: createLedgerSignTxDataResp.changeAddress
    };

    // TODO: [TREZOR] add error check
    await this.broadcastLedgerSignedTxRequest.execute(reqParams).promise;

    this.actions.dialogs.closeActiveDialog.trigger();
    const { wallets } = this.stores.substores[environment.API];
    wallets.refreshWalletsData();

    const activeWallet = wallets.active;
    if (activeWallet) {
      // go to transaction screen
      wallets.goToWalletRoute(activeWallet.id);
    }

    Logger.info('SUCCESS: ADA sent using Trezor SignTx');
  }

  /** Converts error(from API or Trezor API) to LocalizableError */
  _convertToLocalizableError = (error: any): LocalizableError => {
    let localizableError: ?LocalizableError = null;

    if (error instanceof LocalizableError) {
      // It means some API Error has been thrown
      localizableError = error;
    } else if (error && error.message) {
      // Trezor device related error happend, convert then to LocalizableError
      // TODO: [TREZOR] check for device not supported if needed
      switch (error.message) {
        case 'Iframe timeout':
          localizableError = new LocalizableError(globalMessages.trezorError101);
          break;
        case 'Permissions not granted':
          localizableError = new LocalizableError(globalMessages.trezorError102);
          break;
        case 'Cancelled':
        case 'Popup closed':
          localizableError = new LocalizableError(globalMessages.trezorError103);
          break;
        case 'Signing cancelled':
          localizableError = new LocalizableError(messages.signTxError101);
          break;
        default:
          /** we are not able to figure out why Error is thrown
            * make it, Something unexpected happened */
          Logger.error(`TrezorSendStore::_convertToLocalizableError::error: ${error.message}`);
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
