// @flow
import { action, observable } from 'mobx';

import LedgerConnect from '@emurgo/ledger-connect-handler';
import type {
  SignTransactionResponse as LedgerSignTxResponse
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

import Store from '../../base/Store';

import LocalizableError from '../../../i18n/LocalizableError';

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
  buildSignedTransaction,
} from '../../../api/ada/transactions/shelley/ledgerTx';

import {
  prepareLedgerConnect,
} from '../../../utils/hwConnectHandler';
import { ROUTES } from '../../../routes-config';
import { RustModule } from '../../../api/ada/lib/cardanoCrypto/rustLoader';
import { asGetPublicKey, asHasLevels, } from '../../../api/ada/lib/storage/models/PublicDeriver/traits';
import {
  ConceptualWallet
} from '../../../api/ada/lib/storage/models/ConceptualWallet/index';
import { buildCheckAndCall } from '../../lib/check';
import { getApiForNetwork, ApiOptions } from '../../../api/common/utils';
import { HaskellShelleyTxSignRequest } from '../../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import type {
  Addressing,
} from '../../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { genAddressingLookup } from '../../stateless/addressStores';

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

    const { syncCheck, asyncCheck } = buildCheckAndCall(
      ApiOptions.ada,
      () => {
        if (this.stores.profile.selectedNetwork == null) return undefined;
        return getApiForNetwork(this.stores.profile.selectedNetwork);
      }
    );
    ledgerSendAction.init.listen(syncCheck(this._init));
    ledgerSendAction.sendUsingLedgerWallet.listen(asyncCheck(this._sendWrapper));
    ledgerSendAction.sendUsingLedgerKey.listen(
      // drop the return type
      asyncCheck(async (request) => {
        await this.stores.wallets.sendAndRefresh({
          publicDeriver: undefined,
          broadcastRequest: async () => await this.signAndBroadcast(request),
          refreshWallet: async () => {}
        })
      })
    );
    ledgerSendAction.cancel.listen(syncCheck(this._cancel));
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
      if (!(request.params.signRequest instanceof HaskellShelleyTxSignRequest)) {
        throw new Error(`${nameof(this._sendWrapper)} wrong tx sign request`);
      }
      const { signRequest } = request.params;

      this._setError(null);
      this._setActionProcessing(true);

      await this.stores.substores.ada.wallets.adaSendAndRefresh({
        broadcastRequest: {
          ledger: {
            signRequest,
            publicDeriver: request.publicDeriver,
          },
        },
        refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(request.publicDeriver),
      });

      this.actions.dialogs.closeActiveDialog.trigger();
      this.stores.wallets.sendMoneyRequest.reset();
      this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ROOT });

      Logger.info('SUCCESS: ADA sent using Ledger SignTx');
    } catch (e) {
      this._setError(e);
    } finally {
      this._setActionProcessing(false);
    }
  }

  /** Generates a payload with Ledger format and tries Send ADA using Ledger signing */
  signAndBroadcastFromWallet: {|
    params: {|
      signRequest: HaskellShelleyTxSignRequest,
    |},
    publicDeriver: PublicDeriver<>,
  |} => Promise<{| txId: string |}> = async (request) => {
    try {
      Logger.debug(`${nameof(LedgerSendStore)}::${nameof(this.signAndBroadcast)} called: ` + stringifyData(request.params));

      const withLevels = asHasLevels<ConceptualWallet>(request.publicDeriver);
      if (withLevels == null) {
        throw new Error(`${nameof(this.signAndBroadcast)} No public deriver level for this public deriver`);
      }

      const withPublicKey = asGetPublicKey(withLevels);
      if (withPublicKey == null) throw new Error(`${nameof(this.signAndBroadcast)} No public key for this public deriver`);
      const publicKey = await withPublicKey.getPublicKey();

      const publicKeyInfo = {
        key: RustModule.WalletV4.Bip32PublicKey.from_bytes(
          Buffer.from(publicKey.Hash, 'hex')
        ),
        addressing: {
          startLevel: 1,
          path: withLevels.getPathToPublic(),
        },
      };

      const expectedSerial = request.publicDeriver.getParent().hardwareInfo?.DeviceId || '';
      return this.signAndBroadcast({
        ...request.params,
        publicKey: publicKeyInfo,
        network: request.publicDeriver.getParent().getNetworkInfo(),
        addressingMap: genAddressingLookup(
          request.publicDeriver,
          this.stores.addresses.addressSubgroupMap
        ),
        expectedSerial,
      });
    } catch (error) {
      Logger.error(`${nameof(LedgerSendStore)}::${nameof(this.signAndBroadcast)} error: ` + stringifyError(error));
      throw new convertToLocalizableError(error);
    }
  };

  signAndBroadcast: {|
    signRequest: HaskellShelleyTxSignRequest,
    publicKey: {|
      key: RustModule.WalletV4.Bip32PublicKey,
      ...Addressing,
    |},
    addressingMap: string => (void | $PropertyType<Addressing, 'addressing'>),
    network: $ReadOnly<NetworkRow>,
    expectedSerial: string | void,
  |} => Promise<{| txId: string |}> = async (request) => {
    let ledgerConnect: LedgerConnect;
    try {
      Logger.debug(`${nameof(LedgerSendStore)}::${nameof(this.signAndBroadcast)} called: ` + stringifyData(request));

      ledgerConnect = new LedgerConnect({
        locale: this.stores.profile.currentLocale
      });

      const { ledgerSignTxPayload } = await this.api.ada.createLedgerSignTxData({
        signRequest: request.signRequest,
        network: request.network,
        addressingMap: request.addressingMap,
      });

      await prepareLedgerConnect(ledgerConnect);

      const ledgerSignTxResp: LedgerSignTxResponse =
        await ledgerConnect.signTransaction({
          serial: request.expectedSerial,
          params: ledgerSignTxPayload,
        });

      // There is no need of ledgerConnect after this line.
      // UI was getting blocked for few seconds
      // because _prepareAndBroadcastSignedTx takes time.
      // Disposing here will fix the UI issue.
      ledgerConnect.dispose();

      const txBody = request.signRequest.self().build();
      const txId = Buffer.from(RustModule.WalletV4.hash_transaction(txBody).to_bytes()).toString('hex');
      const signedTx = buildSignedTransaction(
        txBody,
        request.signRequest.signRequest.senderUtxos,
        ledgerSignTxResp.witnesses,
        request.publicKey,
        request.signRequest.metadata,
      );

      await this.api.ada.broadcastLedgerSignedTx({
        signedTxRequest: {
          network: request.network,
          id: txId,
          encodedTx: signedTx.to_bytes(),
        },
        sendTx: this.stores.substores.ada.stateFetchStore.fetcher.sendTx,
      });

      Logger.info('SUCCESS: ADA sent using Ledger SignTx');

      return {
        txId,
      };
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
