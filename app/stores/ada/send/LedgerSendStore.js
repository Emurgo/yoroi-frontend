// @flow
import { action, observable } from 'mobx';

import LedgerConnect from '@emurgo/ledger-connect-handler';
import type {
  SignTransactionResponse as LedgerSignTxResponse
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

import Store from '../../base/Store';

import LocalizedRequest from '../../lib/LocalizedRequest';
import LocalizableError from '../../../i18n/LocalizableError';

import type {
  CreateLedgerSignTxDataFunc,
  PrepareAndBroadcastLedgerSignedTxResponse,
} from '../../../api/ada';
import {
  asGetPublicKey, asHasLevels,
} from '../../../api/ada/lib/storage/models/PublicDeriver/traits';
import {
  ConceptualWallet
} from '../../../api/ada/lib/storage/models/ConceptualWallet/index';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import type {
  SendUsingLedgerParams
} from '../../../actions/ada/ledger-send-actions';

import {
  convertToLocalizableError
} from '../../../domain/LedgerLocalizedError';

import {
  Logger,
  stringifyData,
  stringifyError,
} from '../../../utils/logging';

import {
  prepareLedgerConnect,
} from '../../../utils/hwConnectHandler';
import { ROUTES } from '../../../routes-config';
import { RustModule } from '../../../api/ada/lib/cardanoCrypto/rustLoader';
import { HardwareUnsupportedError } from '../../../api/common/errors';

/** Note: Handles Ledger Signing */
export default class LedgerSendStore extends Store {
  // =================== VIEW RELATED =================== //
  // TODO: consider getting rid of both of these
  @observable isActionProcessing: boolean = false;
  @observable error: ?LocalizableError;
  // =================== VIEW RELATED =================== //

  setup(): void {
    super.setup();
    const ledgerSendAction = this.actions.ada.ledgerSend;
    ledgerSendAction.init.listen(this._init);
    ledgerSendAction.sendUsingLedger.listen(this._sendWrapper);
    ledgerSendAction.cancel.listen(this._cancel);
  }

  /** setup() is called when stores are being created
    * _init() is called when Confirmation dialog is about to show */
  _init: void => void = () => {
    Logger.debug(`${nameof(LedgerSendStore)}::${nameof(this._init)} called`);
  }

  _reset(): void {
    this._setActionProcessing(false);
    this._setError(null);
  }

  _preSendValidation: void => void = () => {
    if (this.isActionProcessing) {
      // this Error will be converted to LocalizableError()
      throw new Error('Can\'t send another transaction if one transaction is in progress.');
    }
  }

  _sendWrapper: {|
    params: SendUsingLedgerParams,
    publicDeriver: PublicDeriver<>,
  |} => Promise<void> = async (request) => {
    try {
      if (this.isActionProcessing) {
        // this Error will be converted to LocalizableError()
        throw new Error('Can’t send another transaction if one transaction is in progress.');
      }

      this._setError(null);
      this._setActionProcessing(true);

      await this.stores.substores.ada.wallets.adaSendAndRefresh({
        broadcastRequest: {
          ledger: {
            signRequest: request.params.signRequest,
            publicDeriver: request.publicDeriver,
          },
        },
        refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(request.publicDeriver),
      });

      this.actions.dialogs.closeActiveDialog.trigger();
      this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ROOT });

      Logger.info('SUCCESS: ADA sent using Trezor SignTx');
    } catch (e) {
      this._setError(e);
    } finally {
      this._setActionProcessing(false);
    }
  }

  /** Generates a payload with Ledger format and tries Send ADA using Ledger signing */
  signAndBroadcast: {|
    params: SendUsingLedgerParams,
    publicDeriver: PublicDeriver<>,
  |} => Promise<{| txId: string |}> = async (request) => {
    let ledgerConnect: LedgerConnect;
    try {
      Logger.debug(`${nameof(LedgerSendStore)}::${nameof(this.signAndBroadcast)} called: ` + stringifyData(request.params));
      ledgerConnect = new LedgerConnect({
        locale: this.stores.profile.currentLocale
      });

      throw new HardwareUnsupportedError();

      // const stateFetcher = this.stores.substores.ada.stateFetchStore.fetcher;
      // const ledgerSignTxDataResp = await this.api.ada.createLedgerSignTxData({
      //   ...request.params,
      //   getTxsBodiesForUTXOs: stateFetcher.getTxsBodiesForUTXOs,
      // });

      // await prepareLedgerConnect(ledgerConnect);

      // const ledgerSignTxResp: LedgerSignTxResponse =
      //   await ledgerConnect.signTransaction(
      //     ledgerSignTxDataResp.ledgerSignTxPayload.inputs,
      //     ledgerSignTxDataResp.ledgerSignTxPayload.outputs,
      //   );

      // // There is no need of ledgerConnect after this line.
      // // UI was getting blocked for few seconds
      // // because _prepareAndBroadcastSignedTx takes time.
      // // Disposing here will fix the UI issue.
      // ledgerConnect.dispose();

      // {
      //   const withPublicKey = asGetPublicKey(request.publicDeriver);
      //   if (withPublicKey == null) {
      //     throw new Error(`${nameof(this.signAndBroadcast)} public deriver has no public key.`);
      //   }
      //   const withLevels = asHasLevels<ConceptualWallet>(withPublicKey);
      //   if (withLevels == null) {
      //     throw new Error(`${nameof(this.signAndBroadcast)} public deriver has no levels`);
      //   }

      //   const signedTxResponse = await this.api.ada.prepareAndBroadcastLedgerSignedTx({
      //     getPublicKey: withPublicKey.getPublicKey,
      //     keyLevel: withLevels.getParent().getPublicDeriverLevel(),
      //     ledgerSignTxResp,
      //     unsignedTx: request.params.signRequest.signRequest.unsignedTx.build(),
      //     sendTx: this.stores.substores.ada.stateFetchStore.fetcher.sendTx,
      //   });

      //   Logger.info('SUCCESS: ADA sent using Ledger SignTx');
      // }
    } catch (error) {
      Logger.error(`${nameof(LedgerSendStore)}::${nameof(this.signAndBroadcast)} error: ` + stringifyError(error));
      throw new convertToLocalizableError(error);
    } finally {
      ledgerConnect && ledgerConnect.dispose();
    }
  };

  _cancel: void => void = () => {
    if (!this.isActionProcessing) {
      this.actions.dialogs.closeActiveDialog.trigger();
      this._reset();
    }
  }

  @action _setActionProcessing: boolean => void = (processing) => {
    this.isActionProcessing = processing;
  }

  @action _setError: ?LocalizableError => void = (error) => {
    this.error = error;
  }
}
