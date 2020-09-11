// @flow
import { action, observable } from 'mobx';

import Store from '../../base/Store';

import { wrapWithFrame } from '../../lib/TrezorWrapper';
import type {
  SendUsingTrezorParams
} from '../../../actions/ada/trezor-send-actions';
import {
  Logger,
  stringifyError,
} from '../../../utils/logging';
import {
  convertToLocalizableError
} from '../../../domain/TrezorLocalizedError';
import LocalizableError from '../../../i18n/LocalizableError';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import { ROUTES } from '../../../routes-config';
import { buildCheckAndCall } from '../../lib/check';
import { getApiForNetwork, ApiOptions } from '../../../api/common/utils';
import { HaskellShelleyTxSignRequest } from '../../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';

/** Note: Handles Trezor Signing */
export default class TrezorSendStore extends Store {
  // =================== VIEW RELATED =================== //
  // TODO: consider getting rid of both of these
  @observable isActionProcessing: boolean = false;
  @observable error: ?LocalizableError;
  // =================== VIEW RELATED =================== //

  // =================== API RELATED =================== //

  setup(): void {
    super.setup();
    const trezorSendAction = this.actions.ada.trezorSend;

    const { syncCheck, asyncCheck } = buildCheckAndCall(
      ApiOptions.ada,
      () => {
        if (this.stores.profile.selectedNetwork == null) return undefined;
        return getApiForNetwork(this.stores.profile.selectedNetwork);
      }
    );

    trezorSendAction.sendUsingTrezor.listen(asyncCheck(this._sendWrapper));
    trezorSendAction.cancel.listen(syncCheck(this._cancel));
    trezorSendAction.reset.listen(syncCheck(this._reset));
  }

  _reset: void => void = () => {
    this._setActionProcessing(false);
    this._setError(null);
  }

  _sendWrapper: {|
    params: SendUsingTrezorParams,
    publicDeriver: PublicDeriver<>,
  |} => Promise<void> = async (request) => {
    try {
      if (this.isActionProcessing) {
        // this Error will be converted to LocalizableError()
        throw new Error('Can’t send another transaction if one transaction is in progress.');
      }
      if (!(request.params.signRequest instanceof HaskellShelleyTxSignRequest)) {
        throw new Error(`${nameof(this._sendWrapper)} wrong tx sign request`);
      }
      const { signRequest } = request.params;

      this._setError(null);
      this._setActionProcessing(true);

      await this.stores.substores.ada.wallets.adaSendAndRefresh({
        broadcastRequest: {
          trezor: {
            signRequest,
            publicDeriver: request.publicDeriver,
          },
        },
        refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(request.publicDeriver),
      });

      this.actions.dialogs.closeActiveDialog.trigger();
      this.stores.wallets.sendMoneyRequest.reset();
      this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ROOT });
      this._reset();

      Logger.info('SUCCESS: ADA sent using Trezor SignTx');
    } catch (e) {
      this._setError(e);
    } finally {
      this._setActionProcessing(false);
    }
  }

  signAndBroadcast: {|
    params: {|
      signRequest: HaskellShelleyTxSignRequest,
    |},
    publicDeriver: PublicDeriver<>,
  |} => Promise<{| txId: string |}> = async (request) => {
    try {
      const network = request.publicDeriver.getParent().getNetworkInfo();
      const trezorSignTxDataResp = await this.api.ada.createTrezorSignTxData({
        ...request.params,
        network,
      });

      const trezorSignTxResp = await wrapWithFrame(trezor => trezor.cardanoSignTransaction(
        { ...trezorSignTxDataResp.trezorSignTxPayload }
      ));

      if (trezorSignTxResp && trezorSignTxResp.payload && trezorSignTxResp.payload.error != null) {
        // this Error will be converted to LocalizableError()
        throw new Error(trezorSignTxResp.payload.error);
      }
      if (!trezorSignTxResp.success) {
        throw new Error(`${nameof(TrezorSendStore)}::${nameof(this.signAndBroadcast)} should never happen`);
      }

      return await this.api.ada.broadcastTrezorSignedTx({
        signedTxRequest: {
          network,
          id: trezorSignTxResp.payload.hash,
          encodedTx: Buffer.from(trezorSignTxResp.payload.serializedTx, 'hex'),
        },
        sendTx: this.stores.substores.ada.stateFetchStore.fetcher.sendTx,
      });
    } catch (error) {
      Logger.error(`${nameof(TrezorSendStore)}::${nameof(this.signAndBroadcast)} error: ` + stringifyError(error));
      throw new convertToLocalizableError(error);
    }
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
