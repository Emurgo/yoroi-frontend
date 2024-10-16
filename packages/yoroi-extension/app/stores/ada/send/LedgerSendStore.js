// @flow
import { action, observable } from 'mobx';

import { TxAuxiliaryDataSupplementType } from '@cardano-foundation/ledgerjs-hw-app-cardano';
import type {
  SignTransactionResponse as LedgerSignTxResponse
} from '@cardano-foundation/ledgerjs-hw-app-cardano';

import Store from '../../base/Store';

import LocalizableError from '../../../i18n/LocalizableError';

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
  buildConnectorSignedTransaction,
  buildSignedTransaction,
} from '../../../api/ada/transactions/shelley/ledgerTx';

import { LedgerConnect } from '../../../utils/hwConnectHandler';
import { ROUTES } from '../../../routes-config';
import { RustModule } from '../../../api/ada/lib/cardanoCrypto/rustLoader';
import { HaskellShelleyTxSignRequest } from '../../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import type {
  Addressing,
} from '../../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { genAddressingLookup } from '../../stateless/addressStores';
import type { ActionsMap } from '../../../actions/index';
import type { StoresMap } from '../../index';
import {
  generateRegistrationMetadata,
  generateCip15RegistrationMetadata,
} from '../../../api/ada/lib/cardanoCrypto/catalyst';
import { getNetworkById } from '../../../api/ada/lib/storage/database/prepackaged/networks.js';
import { broadcastTransaction } from '../../../api/thunk';
import { transactionHexToBodyHex, transactionHexToHash } from '../../../api/ada/lib/cardanoCrypto/utils';
import { fail } from '../../../coreUtils';

/** Note: Handles Ledger Signing */
export default class LedgerSendStore extends Store<StoresMap, ActionsMap> {
  // =================== VIEW RELATED =================== //
  // TODO: consider getting rid of both of these
  @observable isActionProcessing: boolean = false;
  @observable error: ?LocalizableError;
  // =================== VIEW RELATED =================== //

  setup(): void {
    super.setup();
    const ledgerSendAction = this.actions.ada.ledgerSend;
    ledgerSendAction.init.listen(this._init);
    ledgerSendAction.sendUsingLedgerWallet.listen(this._sendWrapper);
    ledgerSendAction.sendUsingLedgerKey.listen(
      // drop the return type
      async (request) => {
        await this.stores.wallets.sendAndRefresh({
          publicDeriverId: undefined,
          plateTextPart: undefined,
          broadcastRequest: async () => await this.signAndBroadcast(request),
          refreshWallet: async () => {}
        })
      }
    );
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
    onSuccess?: void => void,
    +wallet: {
      publicDeriverId: number,
      stakingAddressing: Addressing,
      publicKey: string,
      pathToPublic: Array<number>,
      networkId: number,
      hardwareWalletDeviceId: ?string,
      +plate: { TextPart: string, ... },
      ...
    },
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
            wallet: request.wallet,
          },
        },
        refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(request.wallet.publicDeriverId),
      });

      this.actions.dialogs.closeActiveDialog.trigger();
      this.stores.wallets.sendMoneyRequest.reset();
      if (request.onSuccess) {
        request.onSuccess();
      } else {
        this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.TRANSACTIONS });
      }

      Logger.info('SUCCESS: ADA sent using Ledger SignTx');
    } catch (e) {
      this._setError(e);
    } finally {
      this._setActionProcessing(false);
    }
  }

  /** Generates a payload with Ledger format and tries Send ADA using Ledger signing */
  signAndBroadcastFromWallet: {|
    signRequest: HaskellShelleyTxSignRequest,
    +wallet: {
      publicDeriverId: number,
      publicKey: string,
      pathToPublic: Array<number>,
      networkId: number,
      hardwareWalletDeviceId: ?string,
      ...
    },
  |} => Promise<{| txId: string |}> = async (request) => {
    try {
      Logger.debug(`${nameof(LedgerSendStore)}::${nameof(this.signAndBroadcastFromWallet)} called: ` + stringifyData(request));

      const publicKeyInfo = {
        key: RustModule.WalletV4.Bip32PublicKey.from_hex(request.wallet.publicKey),
        addressing: {
          startLevel: 1,
          path: request.wallet.pathToPublic,
        },
      };

      const expectedSerial = request.wallet.hardwareWalletDeviceId || '';

      const signRequest = request.signRequest;

      const addressingMap = genAddressingLookup(
        request.wallet.networkId,
        this.stores.addresses.addressSubgroupMap
      );

      return this.signAndBroadcast({
        signRequest,
        publicKey: publicKeyInfo,
        publicDeriverId: request.wallet.publicDeriverId,
        addressingMap,
        expectedSerial,
        networkId: request.wallet.networkId,
      });

    } catch (error) {
      Logger.error(`${nameof(LedgerSendStore)}::${nameof(this.signAndBroadcastFromWallet)} error: ` + stringifyError(error));
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
    publicDeriverId: number,
    networkId: number,
    expectedSerial: string | void,
  |} => Promise<{| txId: string |}> = async (request) => {
    let ledgerConnect: ?LedgerConnect;
    try {
      Logger.debug(`${nameof(LedgerSendStore)}::${nameof(this.signAndBroadcast)} called: ` + stringifyData(request));

      ledgerConnect = new LedgerConnect({
        locale: this.stores.profile.currentLocale,
      });

      let cip36: boolean = false;
      if (request.signRequest.ledgerNanoCatalystRegistrationTxSignData) {
        const getVersionResponse = await ledgerConnect.getVersion({
          serial: request.expectedSerial,
          dontCloseTab: true,
        });
        cip36 = getVersionResponse.compatibility.supportsCIP36Vote === true;
      }

      const network = getNetworkById(request.networkId);

      const { ledgerSignTxPayload } = this.api.ada.createLedgerSignTxData({
        signRequest: request.signRequest,
        network,
        addressingMap: request.addressingMap,
        cip36,
      });

      const ledgerSignTxResp: LedgerSignTxResponse =
        await ledgerConnect.signTransaction({
          serial: request.expectedSerial,
          params: ledgerSignTxPayload,
          useOpenTab: true,
        });

      // There is no need of ledgerConnect after this line.
      // UI was getting blocked for few seconds
      // because _prepareAndBroadcastSignedTx takes time.
      // Disposing here will fix the UI issue.
      ledgerConnect.dispose();

      let metadata;

      if (request.signRequest.ledgerNanoCatalystRegistrationTxSignData) {
        const {
          votingPublicKey,
          stakingKey,
          paymentAddress,
          nonce,
        } = request.signRequest.ledgerNanoCatalystRegistrationTxSignData;

        if (
          !ledgerSignTxResp.auxiliaryDataSupplement ||
            (ledgerSignTxResp.auxiliaryDataSupplement.type !==
              TxAuxiliaryDataSupplementType.CIP36_REGISTRATION)
        ) {
          throw new Error(`${nameof(LedgerSendStore)}::${nameof(this.signAndBroadcast)} unexpected Ledger sign transaction response`);
        }
        const { cip36VoteRegistrationSignatureHex } =
          ledgerSignTxResp.auxiliaryDataSupplement;

        if (cip36) {
          metadata = generateRegistrationMetadata(
            votingPublicKey,
            stakingKey,
            paymentAddress,
            nonce,
            (_hashedMetadata) => {
              return cip36VoteRegistrationSignatureHex;
            },
          );
        } else {
          metadata = generateCip15RegistrationMetadata(
            votingPublicKey,
            stakingKey,
            paymentAddress,
            nonce,
            (_hashedMetadata) => {
              return cip36VoteRegistrationSignatureHex;
            },
          );
        }
        // We can verify that
        //  Buffer.from(
        //    blake2b(256 / 8).update(metadata.to_bytes()).digest('binary')
        //  ).toString('hex') ===
        // ledgerSignTxResp.auxiliaryDataSupplement.auxiliaryDataHashaHex
      } else {
        metadata = request.signRequest.metadata;
      }

      if (metadata) {
        request.signRequest.self().set_auxiliary_data(metadata);
      }

      const tx = request.signRequest.self().build_tx();
      const txId = transactionHexToHash(tx.to_hex());

      const signedTx = buildSignedTransaction(
        tx,
        request.signRequest.senderUtxos,
        ledgerSignTxResp.witnesses,
        request.publicKey,
        metadata,
      );

      await broadcastTransaction({
        publicDeriverId: request.publicDeriverId,
        signedTxHex: signedTx.to_hex(),
      });

      return { txId };
    } catch (error) {
      Logger.error(`${nameof(LedgerSendStore)}::${nameof(this.signAndBroadcast)} error: ` + stringifyError(error));
      throw new convertToLocalizableError(error);
    } finally {
      if (ledgerConnect != null) {
        ledgerConnect.dispose();
      }
    }
  };


  signRawTxFromWallet: {|
    rawTxHex: string,
    +wallet: {
      publicDeriverId: number,
      publicKey: string,
      pathToPublic: Array<number>,
      networkId: number,
      hardwareWalletDeviceId: ?string,
      ...
    },
  |} => Promise<{| signedTxHex: string |}> = async (request) => {
    try {
      Logger.debug(`${nameof(LedgerSendStore)}::${nameof(this.signRawTxFromWallet)} called: ` + stringifyData(request));

      const publicKeyInfo = {
        key: RustModule.WalletV4.Bip32PublicKey.from_hex(request.wallet.publicKey),
        addressing: {
          startLevel: 1,
          path: request.wallet.pathToPublic,
        },
      };

      const expectedSerial = request.wallet.hardwareWalletDeviceId || '';

      const addressingMap = genAddressingLookup(
        request.wallet.networkId,
        this.stores.addresses.addressSubgroupMap,
      );

      return this.signRawTx({
        rawTxHex: request.rawTxHex,
        publicKey: publicKeyInfo,
        addressingMap,
        expectedSerial,
        networkId: request.wallet.networkId,
      });

    } catch (error) {
      Logger.error(`${nameof(LedgerSendStore)}::${nameof(this.signRawTxFromWallet)} error: ` + stringifyError(error));
      throw new convertToLocalizableError(error);
    }
  }

  signRawTx: {|
    rawTxHex: string,
    publicKey: {|
      key: RustModule.WalletV4.Bip32PublicKey,
      ...Addressing,
    |},
    addressingMap: string => (void | $PropertyType<Addressing, 'addressing'>),
    networkId: number,
    expectedSerial: string | void,
  |} => Promise<{| signedTxHex: string |}> = async (request) => {

    let ledgerConnect: ?LedgerConnect;
    try {
      Logger.debug(`${nameof(LedgerSendStore)}::${nameof(this.signAndBroadcast)} called: ` + stringifyData(request));

      ledgerConnect = new LedgerConnect({
        locale: this.stores.profile.currentLocale,
      });

      const { rawTxHex } = request;

      const network = getNetworkById(request.networkId);

      const txBodyHex = transactionHexToBodyHex(rawTxHex);

      const addressedUtxos = await this.stores.wallets.getAddressedUtxos();

      const response = this.api.ada.createHwSignTxDataFromRawTx('ledger', {
        txBodyHex,
        network,
        addressingMap: request.addressingMap,
        senderUtxos: addressedUtxos,
      });

      const ledgerSignTxPayload = response.hw === 'ledger' ? response.result.ledgerSignTxPayload
        : fail('Unecpected response type from `createHwSignTxDataFromRawTx` for ledger: ' + JSON.stringify(response));

      const ledgerSignTxResp: LedgerSignTxResponse =
        await ledgerConnect.signTransaction({
          serial: request.expectedSerial,
          params: ledgerSignTxPayload,
          useOpenTab: true,
        });

      // There is no need of ledgerConnect after this line.
      // UI was getting blocked for few seconds
      // because _prepareAndBroadcastSignedTx takes time.
      // Disposing here will fix the UI issue.
      ledgerConnect.dispose();

      const signedTxHex = buildConnectorSignedTransaction(
        rawTxHex,
        ledgerSignTxResp.witnesses,
        request.publicKey,
      );

      return { signedTxHex };
    } catch (error) {
      Logger.error(`${nameof(LedgerSendStore)}::${nameof(this.signAndBroadcast)} error: ` + stringifyError(error));
      throw new convertToLocalizableError(error);
    } finally {
      if (ledgerConnect != null) {
        ledgerConnect.dispose();
      }
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
