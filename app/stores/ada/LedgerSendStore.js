// @flow
import { action, observable } from 'mobx';
import { defineMessages } from 'react-intl';
import LedgerBridge from 'yoroi-extension-ledger-bridge';

import Store from '../base/Store';
import environment from '../../environment';
import LocalizedRequest from '../lib/LocalizedRequest';

import LocalizableError, { UnexpectedError } from '../../i18n/LocalizableError';
import globalMessages from '../../i18n/global-messages';

import type {
  CreateLedgerSignTxDataRequest,
  CreateLedgerSignTxDataResponse,
  SendLedgerSignedTxRequest,
} from '../../api/ada';
import type { SendLedgerSignedTxResponse } from '../../api/common';

import {
  Logger,
  stringifyError,
} from '../../utils/logging';

const messages = defineMessages({
  signTxError101: {
    id: 'wallet.send.trezor.error.101',
    defaultMessage: '!!!Signing cancelled on Ledger device. Please retry.',
    description: '<Signing cancelled on Ledger device. Please retry.> on the Trezor send ADA confirmation dialog.'
  },
});

/** Note: Handles Trezor Signing */
export default class LedgerSendStore extends Store {
  // =================== VIEW RELATED =================== //
  @observable isActionProcessing: boolean = false;
  @observable error: ?LocalizableError;
  // =================== VIEW RELATED =================== //

  // =================== API RELATED =================== //
  createLedgerSignTxDataRequest: LocalizedRequest<CreateLedgerSignTxDataResponse> =
    new LocalizedRequest(this.api.ada.createLedgerSignTxData);

  sendLedgerSignedTxRequest: LocalizedRequest<SendLedgerSignedTxResponse> =
    new LocalizedRequest(this.api.ada.sendLedgerSignedTx);
  // =================== API RELATED =================== //

  setup() {
    const ledgerSendAction = this.actions.ada.ledgerSend;
    ledgerSendAction.sendUsingLedger.listen(this._send);
    ledgerSendAction.cancel.listen(this._cancel);
  }

  _reset() {
    this._setActionProcessing(false);
    this._setError(null);
  }

  /** Generates a payload with Ledger format and tries Send ADA using Ledger signing */
  _send = async (params: any): Promise<void> => { //CreateLedgerSignTxDataRequest
    // try {

    //   if (this.isActionProcessing) {
    //     // this Error will be converted to LocalizableError()
    //     throw new Error('Can\'t send another transaction if one transaction is in progress.');
    //   }

    //   this._setError(null);
    //   this._setActionProcessing(true);

    //   const { wallets, addresses } = this.stores.substores[environment.API];
    //   const activeWallet = wallets.active;
    //   if (!activeWallet) {
    //     // this Error will be converted to LocalizableError()
    //     throw new Error('Active wallet required before sending.');
    //   }
    //   const accountId = addresses._getAccountIdByWalletId(activeWallet.id);
    //   if (!accountId) {
    //     // this Error will be converted to LocalizableError()
    //     throw new Error('Active account required before sending.');
    //   }

    //   this.createTrezorSignTxDataRequest.reset();

    //   const trezorSignTxDataResp =
    //     await this.createTrezorSignTxDataRequest.execute(params).promise;

    //   // TODO: [TREZOR] fix type if possible
    //   const trezorResp = await TrezorConnect.cardanoSignTransaction({
    //     ...trezorSignTxDataResp.trezorSignTxPayload
    //   });

    //   if (trezorResp && trezorResp.payload && trezorResp.payload.error) {
    //     // this Error will be converted to LocalizableError()
    //     throw new Error(trezorResp.payload.error);
    //   }

    //   await this._sendTrezorSignedTx(trezorSignTxDataResp, trezorResp);

    // } catch (error) {
    //   Logger.error('TrezorSendStore::_sendUsingTrezor error: ' + stringifyError(error));
    //   this._setError(this._convertToLocalizableError(error));
    // } finally {
    //   this.createTrezorSignTxDataRequest.reset();
    //   this.sendTrezorSignedTxRequest.reset();
    //   this._setActionProcessing(false);
    // }
  };

  _broadcastSignedTx = async (trezorSignTxDataResp: any, //CreateTrezorSignTxDataResponse
    trezorResp: any): Promise<void> => {

    // TODO: [TREZOR] fix type if possible
    // const payload: any = trezorResp.payload;
    // this.sendTrezorSignedTxRequest.reset();
    // const reqParams: SendTrezorSignedTxRequest = {
    //   signedTxHex: payload.body,
    //   changeAdaAddr: trezorSignTxDataResp.changeAddress
    // };
    // // TODO: [TREZOR] add error check
    // await this.sendTrezorSignedTxRequest.execute(reqParams).promise;
    // this.actions.dialogs.closeActiveDialog.trigger();
    // const { wallets } = this.stores.substores[environment.API];
    // wallets.refreshWalletsData();
    // const activeWallet = wallets.active;
    // if (activeWallet) {
    //   // go to transaction screen
    //   wallets.goToWalletRoute(activeWallet.id);
    // }
    // Logger.info('SUCCESS: ADA sent using Trezor SignTx');
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
