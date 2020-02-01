// @flow
import { action, observable } from 'mobx';

import LedgerConnect from 'yoroi-extension-ledger-connect-handler';
import type {
  SignTransactionResponse as LedgerSignTxResponse
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

import Store from '../base/Store';
import environment from '../../environment';

import LocalizedRequest from '../lib/LocalizedRequest';
import LocalizableError from '../../i18n/LocalizableError';

import type {
  CreateLedgerSignTxDataFunc,
  PrepareAndBroadcastLedgerSignedTxFunc,
} from '../../api/ada';
import {
  asGetPublicKey, asHasLevels,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import {
  ConceptualWallet
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import type {
  SendUsingLedgerParams
} from '../../actions/ada/ledger-send-actions';

import {
  convertToLocalizableError
} from '../../domain/LedgerLocalizedError';

import {
  Logger,
  stringifyData,
} from '../../utils/logging';

import {
  prepareLedgerConnect,
} from '../../utils/hwConnectHandler';

import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';

/** Note: Handles Ledger Signing */
export default class LedgerSendStore extends Store {
  // =================== VIEW RELATED =================== //
  @observable isActionProcessing: boolean = false;
  @observable error: ?LocalizableError;
  // =================== VIEW RELATED =================== //

  // =================== API RELATED =================== //
  createLedgerSignTxDataRequest: LocalizedRequest<CreateLedgerSignTxDataFunc>
    = new LocalizedRequest<CreateLedgerSignTxDataFunc>(this.api.ada.createLedgerSignTxData);

  broadcastLedgerSignedTxRequest: LocalizedRequest<PrepareAndBroadcastLedgerSignedTxFunc>
    = new LocalizedRequest<PrepareAndBroadcastLedgerSignedTxFunc>(
      this.api.ada.prepareAndBroadcastLedgerSignedTx
    );
  // =================== API RELATED =================== //

  setup(): void {
    super.setup();
    const ledgerSendAction = this.actions.ada.ledgerSend;
    ledgerSendAction.init.listen(this._init);
    ledgerSendAction.sendUsingLedger.listen(this._send);
    ledgerSendAction.cancel.listen(this._cancel);
  }

  /** setup() is called when stores are being created
    * _init() is called when Confirmation dailog is about to show */
  _init = (): void => {
    Logger.debug('LedgerSendStore::_init called');
  }

  _reset(): void {
    this._setActionProcessing(false);
    this._setError(null);
  }

  _preSendValidation = (): void => {
    if (this.isActionProcessing) {
      // this Error will be converted to LocalizableError()
      throw new Error('Can\'t send another transaction if one transaction is in progress.');
    }

    const { wallets } = this.stores.substores[environment.API];
    const publicDeriver = wallets.selected;
    if (!publicDeriver) {
      // this Error will be converted to LocalizableError()
      throw new Error('Active wallet required before sending.');
    }
  }

  /** Generates a payload with Ledger format and tries Send ADA using Ledger signing */
  _send = async (params: SendUsingLedgerParams): Promise<void> => {
    let ledgerConnect: LedgerConnect;
    try {
      Logger.debug('LedgerSendStore::_send::called: ' + stringifyData(params));
      ledgerConnect = new LedgerConnect({
        locale: this.stores.profile.currentLocale
      });

      this.createLedgerSignTxDataRequest.reset();
      this.broadcastLedgerSignedTxRequest.reset();

      this._preSendValidation();

      this._setError(null);
      this._setActionProcessing(true);

      const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
      this.createLedgerSignTxDataRequest.execute({
        ...params,
        getTxsBodiesForUTXOs: stateFetcher.getTxsBodiesForUTXOs,
      });
      if (!this.createLedgerSignTxDataRequest.promise) throw new Error('should never happen');
      const ledgerSignTxDataResp = await this.createLedgerSignTxDataRequest.promise;

      await prepareLedgerConnect(ledgerConnect);

      const ledgerSignTxResp: LedgerSignTxResponse =
        await ledgerConnect.signTransaction(
          ledgerSignTxDataResp.ledgerSignTxPayload.inputs,
          ledgerSignTxDataResp.ledgerSignTxPayload.outputs,
        );

      // There is no need of ledgerConnect after this line.
      // UI was getting blocked for few seconds
      // because _prepareAndBroadcastSignedTx takes time.
      // Disposing here will fix the UI issue.
      ledgerConnect && ledgerConnect.dispose();

      await this._prepareAndBroadcastSignedTx(
        ledgerSignTxResp,
        params.signRequest.unsignedTx,
      );
    } catch (error) {
      this._setError(convertToLocalizableError(error));
    } finally {
      this.createLedgerSignTxDataRequest.reset();
      this.broadcastLedgerSignedTxRequest.reset();
      ledgerConnect && ledgerConnect.dispose();
      this._setActionProcessing(false);
    }
  };

  _prepareAndBroadcastSignedTx = async (
    ledgerSignTxResp: LedgerSignTxResponse,
    unsignedTx: RustModule.WalletV2.Transaction,
  ): Promise<void> => {
    const { wallets } = this.stores.substores[environment.API];
    const publicDeriver = wallets.selected;
    if (publicDeriver == null) {
      throw new Error('_prepareAndBroadcastSignedTx no public deriver selected');
    }
    const withPublicKey = asGetPublicKey(publicDeriver.self);
    if (withPublicKey == null) {
      throw new Error('_prepareAndBroadcastSignedTx public deriver has no public key.');
    }
    const withLevels = asHasLevels<ConceptualWallet>(withPublicKey);
    if (withLevels == null) {
      throw new Error('_prepareAndBroadcastSignedTx public deriver has no levels');
    }

    await this.broadcastLedgerSignedTxRequest.execute({
      getPublicKey: withPublicKey.getPublicKey,
      keyLevel: withLevels.getParent().getPublicDeriverLevel(),
      ledgerSignTxResp,
      unsignedTx,
      sendTx: this.stores.substores[environment.API].stateFetchStore.fetcher.sendTx,
    }).promise;

    this.actions.dialogs.closeActiveDialog.trigger();
    await wallets.refreshWallet(publicDeriver);

    // go to transaction screen
    wallets.goToWalletRoute(publicDeriver.self);

    this._reset();
    Logger.info('SUCCESS: ADA sent using Ledger SignTx');
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
