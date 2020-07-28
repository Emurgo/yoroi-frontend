// @flow
import { action, observable } from 'mobx';
import type { CardanoSignedTx } from 'trezor-connect/lib/types/networks/cardano';
import type { Success, Unsuccessful } from 'trezor-connect/lib/types/params';

import Store from '../base/Store';
import LocalizedRequest from '../lib/LocalizedRequest';

import { wrapWithFrame } from '../lib/TrezorWrapper';
import type {
  CreateTrezorSignTxDataFunc,
  BroadcastTrezorSignedTxResponse,
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
import { ROUTES } from '../../routes-config';

/** Note: Handles Trezor Signing */
export default class TrezorSendStore extends Store {
  // =================== VIEW RELATED =================== //
  @observable isActionProcessing: boolean = false;
  @observable error: ?LocalizableError;
  // =================== VIEW RELATED =================== //

  // =================== API RELATED =================== //
  createTrezorSignTxDataRequest: LocalizedRequest<CreateTrezorSignTxDataFunc>
    = new LocalizedRequest<CreateTrezorSignTxDataFunc>(this.api.ada.createTrezorSignTxData);

  broadcastTrezorSignedTxRequest: LocalizedRequest<typeof sendAndRefresh>
    = new LocalizedRequest<typeof sendAndRefresh>(
      sendAndRefresh
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

      const stateFetcher = this.stores.substores.ada.stateFetchStore.fetcher;

      this.createTrezorSignTxDataRequest.execute({
        ...request.params,
        getTxsBodiesForUTXOs: stateFetcher.getTxsBodiesForUTXOs,
        network: request.publicDeriver.getParent().getNetworkInfo(),
      });
      if (!this.createTrezorSignTxDataRequest.promise) throw new Error('should never happen');

      const trezorSignTxDataResp = await this.createTrezorSignTxDataRequest.promise;

      const trezorSignTxResp = await wrapWithFrame(trezor => trezor.cardanoSignTransaction(
        { ...trezorSignTxDataResp.trezorSignTxPayload }
      ));

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
    Success<CardanoSignedTx> | Unsuccessful,
    PublicDeriver<>,
  ) => Promise<void> = async (
    trezorSignTxResp,
    publicDeriver,
  ): Promise<void> => {
    if (!trezorSignTxResp.success) {
      throw new Error(`${nameof(TrezorSendStore)}::${nameof(this._brodcastSignedTx)} should never happen`);
    }
    const { wallets } = this.stores;
    const signedTxResponse = await this.broadcastTrezorSignedTxRequest.execute({
      broadcast: () => this.api.ada.broadcastTrezorSignedTx({
        signedTxRequest: {
          id: trezorSignTxResp.payload.hash,
          encodedTx: Buffer.from(trezorSignTxResp.payload.body, 'hex'),
        },
        sendTx: this.stores.substores.ada.stateFetchStore.fetcher.sendTx,
      }),
      refreshWallet: () => wallets.refreshWalletFromRemote(publicDeriver),
    }).promise;
    if (signedTxResponse == null) throw new Error('Should never happen');

    const memo = this.stores.transactionBuilderStore.memo;
    if (memo !== '' && memo !== undefined) {
      try {
        await this.actions.memos.saveTxMemo.trigger({
          publicDeriver,
          memo: {
            Content: memo,
            TransactionHash: signedTxResponse.txId,
            LastUpdated: new Date(),
          },
        });
      } catch (error) {
        Logger.error(`${nameof(TrezorSendStore)}::${nameof(this._brodcastSignedTx)} error: ` + stringifyError(error));
      }
    }

    this.actions.dialogs.closeActiveDialog.trigger();
    this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ROOT });

    Logger.info('SUCCESS: ADA sent using Trezor SignTx');
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

const sendAndRefresh: {|
  broadcast: () => Promise<BroadcastTrezorSignedTxResponse>,
  refreshWallet: () => Promise<void>,
|} => Promise<BroadcastTrezorSignedTxResponse> = async (request) => {
  const result = await request.broadcast();
  try {
    await request.refreshWallet();
  } catch (_e) {
    // even if refreshing the wallet fails, we don't want to fail the tx
    // otherwise user may try and re-send the tx
  }
  return result;
};
