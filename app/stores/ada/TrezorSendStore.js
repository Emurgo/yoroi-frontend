// @flow
import { action, observable } from 'mobx';
import { defineMessages } from 'react-intl';
import TrezorConnect from 'trezor-connect';

import Store from '../base/Store';
import environment from '../../environment';
import LocalizedRequest from '../lib/LocalizedRequest';

import LocalizableError from '../../i18n/LocalizableError';
import globalMessages from '../../i18n/global-messages';

import type {
  CreateTrezorSignTxDataRequest,
  CreateTrezorSignTxDataResponse,
  SendTrezorSignedTxRequest,
} from '../../api/ada';
import type { SendTrezorSignedTxResponse } from '../../api/common';

import {
  Logger,
  stringifyError,
} from '../../utils/logging';

const messages = defineMessages({
  signTxError101: {
    id: 'wallet.send.trezor.error.101',
    defaultMessage: '!!!Signing cancelled on Trezor device. Please retry.',
    description: '<Signing cancelled on Trezor device. Please retry.> on the Trezor send ADA confirmation dialog.'
  },
});

/** Note: Handles Trezor Signing */
export default class TrezorSendStore extends Store {
  // =================== VIEW RELATED =================== //
  @observable isActionProcessing: boolean = false;
  @observable error: ?LocalizableError;
  // =================== VIEW RELATED =================== //

  // =================== API RELATED =================== //
  createTrezorSignTxDataRequest: LocalizedRequest<CreateTrezorSignTxDataResponse> =
    new LocalizedRequest(this.api.ada.createTrezorSignTxData);

  sendTrezorSignedTxRequest: LocalizedRequest<SendTrezorSignedTxResponse> =
    new LocalizedRequest(this.api.ada.sendTrezorSignedTx);
  // =================== API RELATED =================== //

  setup() {
    const trezorSendAction = this.actions.ada.trezorSend;
    trezorSendAction.sendUsingTrezor.listen(this._sendUsingTrezor);
    trezorSendAction.cancel.listen(this._cancel);
  }

  _reset() {
    this._setActionProcessing(false);
    this._setError(null);
  }

  /** Generates a payload with Trezor format and tries Send ADA using Trezor signing */
  _sendUsingTrezor = async (params: CreateTrezorSignTxDataRequest): Promise<void> => {
    // TODO: [TREZOR] fix type if possible
    let trezorResp: any;
    try {

      if (this.isActionProcessing) {
        // this Error will be converted to LocalizableError()
        throw new Error('Can\'t send another transaction if one transaction is in progress.');
      }

      this._setError(null);
      this._setActionProcessing(true);

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

      this.createTrezorSignTxDataRequest.reset();

      const trezorSignTxDataResp =
        await this.createTrezorSignTxDataRequest.execute(params).promise;

      trezorResp = await TrezorConnect.cardanoSignTransaction({
        ...trezorSignTxDataResp.trezorSignTxPayload
      });

      if (!trezorResp.success && trezorResp.payload && trezorResp.payload.error) {
        throw new Error(`TrezorConnect::cardanoSignTransaction::error: ${trezorResp.payload.error}`);
      }

      await this._sendTrezorSignedTx(trezorSignTxDataResp, trezorResp);

    } catch (error) {
      this._setError(this._convertToLocalizableError(error, trezorResp));
      Logger.error('TrezorSendStore::_sendUsingTrezor::error: ' + stringifyError(error));
    } finally {
      this.createTrezorSignTxDataRequest.reset();
      this.sendTrezorSignedTxRequest.reset();
      this._setActionProcessing(false);
    }
  };

  _sendTrezorSignedTx = async (trezorSignTxDataResp: CreateTrezorSignTxDataResponse,
    trezorResp: any): Promise<void> => {
    if (trezorResp && trezorResp.success) {
      const { wallets } = this.stores.substores[environment.API];
      const activeWallet = wallets.active;

      // TODO: [TREZOR] fix type if possible
      const payload: any = trezorResp.payload;
      this.sendTrezorSignedTxRequest.reset();
      const reqParams: SendTrezorSignedTxRequest = {
        signedTxHex: payload.body,
        changeAdaAddr: trezorSignTxDataResp.changeAddress
      };
      // TODO: [TREZOR] add error check
      await this.sendTrezorSignedTxRequest.execute(reqParams).promise;

      wallets.refreshWalletsData();
      this.actions.dialogs.closeActiveDialog.trigger();
      if (activeWallet) {
        // go to transaction screen
        wallets.goToWalletRoute(activeWallet.id);
      }
      Logger.info('SUCCESS: ADA sent using Trezor SignTx');
    } else {
      // this Error will be converted to LocalizableError()
      throw new Error();
    }
  }

  _convertToLocalizableError = (error: any, trezorResp: any): LocalizableError => {
    let localizableError: ?LocalizableError = null;

    if (error instanceof LocalizableError) {
      // It means some API Error has been thrown
      localizableError = error;
    } else if (trezorResp && trezorResp.payload && trezorResp.payload.error) {
      // Trezor device related error happend, convert then to LocalizableError
      // TODO: [TREZOR] check for device not supported if needed
      switch (trezorResp.payload.error) {
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
          // trezorError999 = Something unexpected happened
          localizableError = new LocalizableError(globalMessages.trezorError999);
          break;
      }
    }

    if (!localizableError) {
      /** we are not able to figure out why Error is thrown
        * make it, trezorError999 = Something unexpected happened */
      localizableError = new LocalizableError(globalMessages.trezorError999);
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
