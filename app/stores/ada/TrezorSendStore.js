// @flow
import { action, observable } from 'mobx';
import TrezorConnect from 'trezor-connect';
import type { CardanoSignTransaction$ } from 'trezor-connect/lib/types/cardano';

import Store from '../base/Store';
import environment from '../../environment';
import LocalizedRequest from '../lib/LocalizedRequest';

import type {
  CreateTrezorSignTxDataFunc,
  BroadcastTrezorSignedTxFunc
} from '../../api/ada';
import type {
  SendUsingTrezorParams
} from '../../actions/ada/trezor-send-actions';
import {
  Logger,
  stringifyError,
} from '../../utils/logging';
import {
  convertToLocalizableError
} from '../../domain/TrezorLocalizedError';
import LocalizableError from '../../i18n/LocalizableError';
import PublicDeriverWithCachedMeta from '../../domain/PublicDeriverWithCachedMeta';

/** Note: Handles Trezor Signing */
export default class TrezorSendStore extends Store {
  // =================== VIEW RELATED =================== //
  @observable isActionProcessing: boolean = false;
  @observable error: ?LocalizableError;
  // =================== VIEW RELATED =================== //

  // =================== API RELATED =================== //
  createTrezorSignTxDataRequest: LocalizedRequest<CreateTrezorSignTxDataFunc>
    = new LocalizedRequest<CreateTrezorSignTxDataFunc>(this.api.ada.createTrezorSignTxData);

  broadcastTrezorSignedTxRequest: LocalizedRequest<BroadcastTrezorSignedTxFunc>
    = new LocalizedRequest<BroadcastTrezorSignedTxFunc>(this.api.ada.broadcastTrezorSignedTx);
  // =================== API RELATED =================== //

  setup(): void {
    super.setup();
    const trezorSendAction = this.actions.ada.trezorSend;
    trezorSendAction.sendUsingTrezor.listen(this._sendUsingTrezor);
    trezorSendAction.cancel.listen(this._cancel);
  }

  _reset(): void {
    this._setActionProcessing(false);
    this._setError(null);
  }

  /** Generates a payload with Trezor format and tries Send ADA using Trezor signing */
  _sendUsingTrezor = async (params: SendUsingTrezorParams): Promise<void> => {
    try {
      this.createTrezorSignTxDataRequest.reset();
      this.broadcastTrezorSignedTxRequest.reset();

      if (this.isActionProcessing) {
        // this Error will be converted to LocalizableError()
        throw new Error('Can’t send another transaction if one transaction is in progress.');
      }

      this._setError(null);
      this._setActionProcessing(true);

      // capture what wallet is selected before the sending starts
      const { wallets } = this.stores.substores[environment.API];
      const publicDeriver = wallets.selected;
      if (publicDeriver == null) {
        throw new Error('_sendUsingTrezor no public deriver selected');
      }

      const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
      this.createTrezorSignTxDataRequest.execute({
        ...params,
        getTxsBodiesForUTXOs: stateFetcher.getTxsBodiesForUTXOs,
      });
      if (!this.createTrezorSignTxDataRequest.promise) throw new Error('should never happen');

      const trezorSignTxDataResp = await this.createTrezorSignTxDataRequest.promise;

      const trezorSignTxResp = await await TrezorConnect.cardanoSignTransaction(
        { ...trezorSignTxDataResp.trezorSignTxPayload }
      );

      if (trezorSignTxResp && trezorSignTxResp.payload && trezorSignTxResp.payload.error != null) {
        // this Error will be converted to LocalizableError()
        throw new Error(trezorSignTxResp.payload.error);
      }

      await this._brodcastSignedTx(
        trezorSignTxResp,
        publicDeriver
      );

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
    trezorSignTxResp: CardanoSignTransaction$,
    publicDeriver: PublicDeriverWithCachedMeta,
  ): Promise<void> => {
    if (!trezorSignTxResp.success) {
      throw new Error('TrezorSendStore::_brodcastSignedTx should never happen');
    }
    await this.broadcastTrezorSignedTxRequest.execute({
      signedTxRequest: {
        id: trezorSignTxResp.payload.hash,
        encodedTx: Buffer.from(trezorSignTxResp.payload.body, 'hex'),
      },
      sendTx: this.stores.substores[environment.API].stateFetchStore.fetcher.sendTx,
    }).promise;

    this.actions.dialogs.closeActiveDialog.trigger();
    const { wallets } = this.stores.substores[environment.API];
    await wallets.refreshWallet(publicDeriver);

    // go to transaction screen
    wallets.goToWalletRoute(publicDeriver.self);

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
