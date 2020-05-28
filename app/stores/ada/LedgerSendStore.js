// @flow
import { action, observable } from 'mobx';

import LedgerConnect from '@emurgo/ledger-connect-handler';
import type {
  SignTransactionResponse as LedgerSignTxResponse
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

import Store from '../base/Store';

import LocalizedRequest from '../lib/LocalizedRequest';
import LocalizableError from '../../i18n/LocalizableError';

import type {
  CreateLedgerSignTxDataFunc,
  PrepareAndBroadcastLedgerSignedTxResponse,
} from '../../api/ada';
import {
  asGetPublicKey, asHasLevels,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import {
  ConceptualWallet
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type {
  SendUsingLedgerParams
} from '../../actions/ada/ledger-send-actions';

import {
  convertToLocalizableError
} from '../../domain/LedgerLocalizedError';

import {
  Logger,
  stringifyData,
  stringifyError,
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

  broadcastLedgerSignedTxRequest: LocalizedRequest<typeof sendAndRefresh>
    = new LocalizedRequest<typeof sendAndRefresh>(
      sendAndRefresh
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

  /** Generates a payload with Ledger format and tries Send ADA using Ledger signing */
  _send: {|
    params: SendUsingLedgerParams,
    publicDeriver: PublicDeriver<>,
  |} => Promise<void> = async (request) => {
    let ledgerConnect: LedgerConnect;
    try {
      Logger.debug(`${nameof(LedgerSendStore)}::${nameof(this._send)} called: ` + stringifyData(request.params));
      ledgerConnect = new LedgerConnect({
        locale: this.stores.profile.currentLocale
      });

      this.createLedgerSignTxDataRequest.reset();
      this.broadcastLedgerSignedTxRequest.reset();

      this._preSendValidation();

      this._setError(null);
      this._setActionProcessing(true);

      const stateFetcher = this.stores.substores.ada.stateFetchStore.fetcher;
      this.createLedgerSignTxDataRequest.execute({
        ...request.params,
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
      ledgerConnect.dispose();

      await this._prepareAndBroadcastSignedTx(
        ledgerSignTxResp,
        request.params.signRequest.unsignedTx,
        request.publicDeriver,
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

  _prepareAndBroadcastSignedTx: (
    LedgerSignTxResponse,
    RustModule.WalletV2.Transaction,
    PublicDeriver<>,
  ) => Promise<void> = async (
    ledgerSignTxResp,
    unsignedTx,
    publicDeriver,
  ) => {
    const { wallets } = this.stores;
    const withPublicKey = asGetPublicKey(publicDeriver);
    if (withPublicKey == null) {
      throw new Error(`${nameof(this._prepareAndBroadcastSignedTx)} public deriver has no public key.`);
    }
    const withLevels = asHasLevels<ConceptualWallet>(withPublicKey);
    if (withLevels == null) {
      throw new Error(`${nameof(this._prepareAndBroadcastSignedTx)} public deriver has no levels`);
    }

    const signedTxResponse = await this.broadcastLedgerSignedTxRequest.execute({
      broadcast: () => this.api.ada.prepareAndBroadcastLedgerSignedTx({
        getPublicKey: withPublicKey.getPublicKey,
        keyLevel: withLevels.getParent().getPublicDeriverLevel(),
        ledgerSignTxResp,
        unsignedTx,
        sendTx: this.stores.substores.ada.stateFetchStore.fetcher.sendTx,
      }),
      refreshWallet: () => wallets.refreshWalletFromRemote(publicDeriver),
    }).promise;
    if (signedTxResponse == null) throw new Error('Should never happen');

    const memo = this.stores.substores.ada.transactionBuilderStore.memo;
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
        Logger.error(`${nameof(LedgerSendStore)}::${nameof(this._prepareAndBroadcastSignedTx)} error: ` + stringifyError(error));
      }
    }

    this.actions.dialogs.closeActiveDialog.trigger();

    // go to transaction screen
    wallets.goToWalletRoute(publicDeriver);

    this._reset();
    Logger.info('SUCCESS: ADA sent using Ledger SignTx');
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

  @action _setError: ?LocalizableError => void = (error) => {
    this.error = error;
  }
}

const sendAndRefresh: {|
  broadcast: () => Promise<PrepareAndBroadcastLedgerSignedTxResponse>,
  refreshWallet: () => Promise<void>,
|} => Promise<PrepareAndBroadcastLedgerSignedTxResponse> = async (request) => {
  const result = await request.broadcast();
  try {
    await request.refreshWallet();
  } catch (_e) {
    // even if refreshing the wallet fails, we don't want to fail the tx
    // otherwise user may try and re-send the tx
  }
  return result;
};
