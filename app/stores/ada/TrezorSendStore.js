// @flow
import { action, observable } from 'mobx';
import TrezorConnect from 'trezor-connect';

import Store from '../base/Store';
import environment from '../../environment';
import LocalizedRequest from '../lib/LocalizedRequest';

import type {
  CreateTrezorSignTxDataRequest,
  CreateTrezorSignTxDataResponse,
  BroadcastTrezorSignedTxRequest,
} from '../../api/ada';
import type { BroadcastTrezorSignedTxResponse } from '../../api/common';

import {
  Logger,
  stringifyError,
} from '../../utils/logging';
import {
  convertToLocalizableError
} from '../../domain/TrezorLocalizedError';
import LocalizableError from '../../i18n/LocalizableError';

/** Note: Handles Trezor Signing */
export default class TrezorSendStore extends Store {
  // =================== VIEW RELATED =================== //
  @observable isActionProcessing: boolean = false;
  @observable error: ?LocalizableError;
  // =================== VIEW RELATED =================== //

  // =================== API RELATED =================== //
  createTrezorSignTxDataRequest: LocalizedRequest<CreateTrezorSignTxDataResponse> =
    new LocalizedRequest(this.api.ada.createTrezorSignTxData);

  broadcastTrezorSignedTxRequest: LocalizedRequest<BroadcastTrezorSignedTxResponse> =
    new LocalizedRequest(this.api.ada.broadcastTrezorSignedTx);
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
    try {
      this.createTrezorSignTxDataRequest.reset();
      this.broadcastTrezorSignedTxRequest.reset();

      if (this.isActionProcessing) {
        // this Error will be converted to LocalizableError()
        throw new Error('Can’t send another transaction if one transaction is in progress.');
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

      const trezorSignTxDataResp =
        await this.createTrezorSignTxDataRequest.execute(params).promise;

      // TODO: [TREZOR] fix type if possible
      const trezorSignTxResp = await TrezorConnect.cardanoSignTransaction({
        ...trezorSignTxDataResp.trezorSignTxPayload
      });

      if (trezorSignTxResp && trezorSignTxResp.payload && trezorSignTxResp.payload.error) {
        // this Error will be converted to LocalizableError()
        throw new Error(trezorSignTxResp.payload.error);
      }

      await this._brodcastSignedTx(trezorSignTxResp);

    } catch (error) {
      Logger.error('TrezorSendStore::_sendUsingTrezor error: ' + stringifyError(error));
      this._setError(convertToLocalizableError(error));
    } finally {
      this.createTrezorSignTxDataRequest.reset();
      this.broadcastTrezorSignedTxRequest.reset();
      this._setActionProcessing(false);
    }
  };

  _brodcastSignedTx = async (
    trezorSignTxResp: any,
  ): Promise<void> => {
    // TODO: [TREZOR] fix type if possible
    const payload: any = trezorSignTxResp.payload;
    const reqParams: BroadcastTrezorSignedTxRequest = {
      signedTxHex: payload.body,
    };

    await this.broadcastTrezorSignedTxRequest.execute(reqParams).promise;

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
