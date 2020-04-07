// @flow
import { action, observable } from 'mobx';
import TrezorConnect from 'trezor-connect';
import type { CardanoSignTransaction$ } from 'trezor-connect/lib/types/cardano';

import Store from '../base/Store';
import environment from '../../environment';
import LocalizedRequest from '../lib/LocalizedRequest';

import type {
  CreateTrezorSignTxDataFunc,
  BroadcastTrezorSignedTxRequest, BroadcastTrezorSignedTxResponse,
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
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';

/** Note: Handles Trezor Signing */
export default class TrezorSendStore extends Store {
  // =================== VIEW RELATED =================== //
  @observable isActionProcessing: boolean = false;
  @observable error: ?LocalizableError;
  // =================== VIEW RELATED =================== //

  // =================== API RELATED =================== //
  createTrezorSignTxDataRequest: LocalizedRequest<CreateTrezorSignTxDataFunc>
    = new LocalizedRequest<CreateTrezorSignTxDataFunc>(this.api.ada.createTrezorSignTxData);

  broadcastTrezorSignedTxRequest: LocalizedRequest<typeof TrezorSendStore.prototype.sendAndRefresh>
    = new LocalizedRequest<typeof TrezorSendStore.prototype.sendAndRefresh>(
      this.sendAndRefresh
    );
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
  _sendUsingTrezor: {|
    params: SendUsingTrezorParams,
    publicDeriver: PublicDeriver<>,
  |} => Promise<void> = async (request) => {
    try {
      this.createTrezorSignTxDataRequest.reset();
      this.broadcastTrezorSignedTxRequest.reset();

      if (this.isActionProcessing) {
        // this Error will be converted to LocalizableError()
        throw new Error('Can’t send another transaction if one transaction is in progress.');
      }

      this._setError(null);
      this._setActionProcessing(true);

      const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
      this.createTrezorSignTxDataRequest.execute({
        ...request.params,
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
        request.publicDeriver
      );

    } catch (error) {
      Logger.error(`${nameof(TrezorSendStore)}::${nameof(this._sendUsingTrezor)} error: ` + stringifyError(error));
      this._setError(convertToLocalizableError(error));
    } finally {
      this.createTrezorSignTxDataRequest.reset();
      this.broadcastTrezorSignedTxRequest.reset();
      this._setActionProcessing(false);
    }
  };

  _brodcastSignedTx: (
    CardanoSignTransaction$,
    PublicDeriver<>,
  ) => Promise<void> = async (
    trezorSignTxResp,
    publicDeriver,
  ): Promise<void> => {
    if (!trezorSignTxResp.success) {
      throw new Error(`${nameof(TrezorSendStore)}::${nameof(this._brodcastSignedTx)} should never happen`);
    }
    const { wallets } = this.stores;
    await this.broadcastTrezorSignedTxRequest.execute({
      broadcastRequest: {
        signedTxRequest: {
          id: trezorSignTxResp.payload.hash,
          encodedTx: Buffer.from(trezorSignTxResp.payload.body, 'hex'),
        },
        sendTx: this.stores.substores[environment.API].stateFetchStore.fetcher.sendTx,
      },
      refreshWallet: () => wallets.refreshWalletFromRemote(publicDeriver),
    }).promise;

    this.actions.dialogs.closeActiveDialog.trigger();

    // go to transaction screen
    wallets.goToWalletRoute(publicDeriver);

    Logger.info('SUCCESS: ADA sent using Trezor SignTx');
  }

  sendAndRefresh: {|
    broadcastRequest: BroadcastTrezorSignedTxRequest,
    refreshWallet: () => Promise<void>,
  |} => Promise<BroadcastTrezorSignedTxResponse> = async (request) => {
    const result = await this.api.ada.broadcastTrezorSignedTx(request.broadcastRequest);
    try {
      await request.refreshWallet();
    } catch (_e) {
      // even if refreshing the wallet fails, we don't want to fail the tx
      // otherwise user may try and re-send the tx
    }
    return result;
  }

  _cancel: void => void = () => {
    if (!this.isActionProcessing) {
      this.actions.dialogs.closeActiveDialog.trigger();
      this._reset();
    }
  }

  @action _setActionProcessing: boolean => void = (processing) => {
    this.isActionProcessing = processing;
  }

  @action _setError: (?LocalizableError) => void = (error) => {
    this.error = error;
  }
}
