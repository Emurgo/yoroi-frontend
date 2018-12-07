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
  CreateTrezorSignTxDataResponse
} from '../../api/ada';
import {
  Logger,
  stringifyError,
} from '../../utils/logging';

// TODO: [TREZOR] do i18n
const messages = defineMessages({
  error999: {
    id: 'wallet.trezor.dialog.step.connect.error.999',
    defaultMessage: '!!!Something unexpected happened, please retry.',
    description: '<Something unexpected happened, please retry.> on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectError101: {
    id: 'wallet.trezor.dialog.step.connect.error.101',
    defaultMessage: '!!!Falied to connect trezor.io. Please check your Internet connection and retry.',
    description: '<Falied to connect trezor.io. Please check your Internet connection and retry.> on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectError102: {
    id: 'wallet.trezor.dialog.step.connect.error.102',
    defaultMessage: '!!!Necessary permissions were not granted by the user. Please retry.',
    description: '<Necessary permissions were not granted by the user. Please retry.> on the Connect to Trezor Hardware Wallet dialog.'
  },
  connectError103: {
    id: 'wallet.trezor.dialog.step.connect.error.103',
    defaultMessage: '!!!Cancelled. Please retry.',
    description: '<Cancelled. Please retry.> on the Connect to Trezor Hardware Wallet dialog.'
  },
  saveError101: {
    id: 'wallet.trezor.dialog.step.save.error.101',
    defaultMessage: '!!!Falied to save. Please check your Internet connection and retry.',
    description: '<Falied to save. Please check your Internet connection and retry.> on the Connect to Trezor Hardware Wallet dialog.'
  },
  error101: {
    id: 'wallet.send.trezor.error.101',
    defaultMessage: '!!!Signing cancelled on Trezor device. Please retry.',
    description: '<Signing cancelled on Trezor device. Please retry.> on the Trezor send ADA confirmation dialog.'
  },  
});

/** Note: Handles Trezor Signing */
export default class TrezorSendAdaStore extends Store {
  // =================== VIEW RELATED =================== //
  @observable isActionProcessing: boolean = false;
  @observable error: ?LocalizableError;
  // =================== VIEW RELATED =================== //

  // =================== API RELATED =================== //
  createTrezorSignTxDataRequest: LocalizedRequest<CreateTrezorSignTxDataResponse> =
    new LocalizedRequest(this.api.ada.createTrezorSignTxData);
  // =================== API RELATED =================== //

  setup() {
    const trezorSendAdaAction = this.actions.ada.trezorSendAda;
    trezorSendAdaAction.sendUsingTrezor.listen(this._sendUsingTrezor);
    trezorSendAdaAction.cancel.listen(this._cancel);
  }

  /** Generates a payload with Trezor format and tries Trezor signing */
  _sendUsingTrezor = async (params: CreateTrezorSignTxDataRequest): Promise<void> => {
    // TODO: [TREZOR] fix type if possible
    let trezorResp: any;
    try {
      this._setError(null);
      this._setActionProcessing(true);

      const { wallets, addresses } = this.stores.substores[environment.API];
      const activeWallet = wallets.active;
      if (!activeWallet) {
        throw new Error('Active wallet required before sending.');
      }
      const accountId = addresses._getAccountIdByWalletId(activeWallet.id);
      if (!accountId) {
        throw new Error('Active account required before sending.');
      }

      this.createTrezorSignTxDataRequest.reset();

      const {
        trezorSignTxPayload,
        changedAddress
      } = await this.createTrezorSignTxDataRequest.execute(params).promise;
  
      trezorResp = await TrezorConnect.cardanoSignTransaction({...trezorSignTxPayload});
      if(trezorResp && trezorResp.success) {
        // TODO: [TREZOR] fix type if possible
        const payload: any = trezorResp.payload;
        // TODO: [TREZOR] use LocalizedRequest for any API call
        await this.api.ada.sendHardwareTransaction({
          signedTxHex: payload.body,
          changeAdaAddr: changedAddress
        });
    
        wallets.refreshWalletsData();
        this.actions.dialogs.closeActiveDialog.trigger();
    
        // go to transaction screen
        wallets.goToWalletRoute(activeWallet.id);        

        Logger.info('SUCCESS: ADA sent using Trezor SignTx');
      } else {
        // this Error will be converted to LocalizableError()
        throw new Error();
      }
    } catch (error) {
      this._setError(this._convertToLocalizableError(error, trezorResp));
      Logger.error('TrezorSendAdaStore::_sendUsingTrezor::error: ' + stringifyError(error));
    } finally {
      this.createTrezorSignTxDataRequest.reset();
      this._setActionProcessing(false);
    }
  }

  _convertToLocalizableError = (error: any, trezorResp: any): LocalizableError => {
    let localizableError: ?LocalizableError = null;

    if (error instanceof LocalizableError) {
      // It means some API Error has been thrown
      localizableError = error;
    } else if(trezorResp && trezorResp.payload && trezorResp.payload.error) {
      // Trezor device related error happend, convert then to LocalizableError
      // TODO: [TREZOR] check for device not supported if needed
      switch(trezorResp.payload.error) {
        case 'Iframe timeout':
          localizableError = new LocalizableError(messages.connectError101);
          break;
        case 'Permissions not granted':
          localizableError = new LocalizableError(messages.connectError102);
          break;
        case 'Cancelled':
        case 'Popup closed':
          localizableError = new LocalizableError(messages.connectError103);
          break;
        case 'Signing cancelled':
          localizableError = new LocalizableError(messages.error101);
          break;
      }
    }

    if (!localizableError) {
      /** we are not able to figure out why Error is thrown
        * make it, error999 = Something unexpected happened */
      localizableError = new LocalizableError(messages.error999);
    }

    return localizableError;
  }

  @action _setActionProcessing = (processing: boolean): void => {
    this.isActionProcessing = processing;
  }

  @action _setError = (error: ?LocalizableError): void => {
    this.error = error;
  }

  @action _cancel = async (): Promise<void> => {
    this.actions.dialogs.closeActiveDialog.trigger();
  }
}
