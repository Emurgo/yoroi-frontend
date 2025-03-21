// @flow
import { action, observable } from 'mobx';
import type { SignTransactionResponse as LedgerSignTxResponse } from '@cardano-foundation/ledgerjs-hw-app-cardano';
import { TxAuxiliaryDataSupplementType } from '@cardano-foundation/ledgerjs-hw-app-cardano';
import Store from '../../base/Store';
import { convertToLocalizableError } from '../../../domain/LedgerLocalizedError';
import { Logger, stringifyData, stringifyError, } from '../../../utils/logging';
import { buildConnectorSignedTransaction } from '../../../api/ada/transactions/shelley/ledgerTx';
import { LedgerConnect } from '../../../utils/hwConnectHandler';
import { RustModule } from '../../../api/ada/lib/cardanoCrypto/rustLoader';
import type {
  HaskellShelleyTxSignRequest,
  LedgerNanoCatalystRegistrationTxSignData,
} from '../../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import type { Addressing, Address, Value } from '../../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { genAddressingLookup } from '../../stateless/addressStores';
import type { StoresMap } from '../../index';
import {
  generateCip15RegistrationMetadata,
  generateRegistrationMetadata,
} from '../../../api/ada/lib/cardanoCrypto/catalyst';
import { getNetworkById } from '../../../api/ada/lib/storage/database/prepackaged/networks.js';
import { broadcastTransaction } from '../../../api/thunk';
import { transactionHexToBodyHex } from '../../../api/ada/lib/cardanoCrypto/utils';
import { fail } from '../../../coreUtils';
import type { ISignRequest } from '../../../api/common/lib/transactions/ISignRequest';
import type { CardanoAddressedUtxo } from '../../../api/ada/transactions/types';

export type SendUsingLedgerParams = {|
  signRequest: ISignRequest<any>,
|};

/** Note: Handles Ledger Signing */
export default class LedgerSendStore extends Store<StoresMap> {
  // =================== VIEW RELATED =================== //
  // TODO: consider getting rid of both of these
  @observable isActionProcessing: boolean = false;
  // =================== VIEW RELATED =================== //

  /** setup() is called when stores are being created
    * _init() is called when Confirmation dialog is about to show */
  init: void => void = () => {
    Logger.debug(`${nameof(LedgerSendStore)}::${nameof(this.init)} called`);
  }

  _reset(): void {
    this._setActionProcessing(false);
  }

  _preSendValidation: void => void = () => {
    if (this.isActionProcessing) {
      // this Error will be converted to LocalizableError()
      throw new Error('Can\'t send another transaction if one transaction is in progress.');
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

      const { signedTxHex, txId, metadata } = await this.signRawTxFromWallet({
        rawTxHex: request.signRequest.self().build_tx().to_hex(),
        wallet: request.wallet,
        catalystData: request.signRequest.ledgerNanoCatalystRegistrationTxSignData,
        changeAddrs: request.signRequest.changeAddr,
        additionalSenderUtxos: request.signRequest.senderUtxos,
      });

      if (metadata) {
        request.signRequest.self().set_auxiliary_data(metadata);
      }

      await broadcastTransaction({
        publicDeriverId: request.wallet.publicDeriverId,
        signedTxHex,
        networkId: request.networkId,
      });

      return { txId };
    } catch (error) {
      Logger.error(`${nameof(LedgerSendStore)}::${nameof(this.signAndBroadcastFromWallet)} error: ` + stringifyError(error));
      throw new convertToLocalizableError(error);
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
    changeAddrs: Array<{| ...Address, ...Value, ...Addressing |}>,
    // The purpose of this parameter is to support transfering from Byron address when initializing
   //  Ledger wallets. It is needed because the wallet's utxos property no longer contains Byron UTxOs.
    additionalSenderUtxos?: Array<CardanoAddressedUtxo>,
    catalystData?: LedgerNanoCatalystRegistrationTxSignData,
  |} => Promise<{|
    signedTxHex: string,
    txId: string,
    metadata: ?RustModule.WalletV4.AuxiliaryData
  |}> = async (request) => {
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
        changeAddrs: request.changeAddrs,
        expectedSerial,
        networkId: request.wallet.networkId,
        catalystData: request.catalystData,
        additionalSenderUtxos: request.additionalSenderUtxos,
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
    changeAddrs: Array<{| ...Address, ...Value, ...Addressing |}>,
    networkId: number,
    expectedSerial: string | void,
    additionalSenderUtxos?: Array<CardanoAddressedUtxo>,
    catalystData?: LedgerNanoCatalystRegistrationTxSignData,
  |} => Promise<{|
    signedTxHex: string,
    txId: string,
    metadata: ?RustModule.WalletV4.AuxiliaryData
  |}> = async (request) => {

    let ledgerConnect: ?LedgerConnect;
    try {
      Logger.debug(`${nameof(LedgerSendStore)}::${nameof(this.signRawTx)} called: ` + stringifyData(request));

      ledgerConnect = new LedgerConnect({
        locale: this.stores.profile.currentLocale,
      });

      let ledgerSupportsCip36: boolean = false;
      if (request.catalystData) {
        const getVersionResponse = await ledgerConnect.getVersion({
          serial: request.expectedSerial,
          dontCloseTab: true,
        });
        ledgerSupportsCip36 = getVersionResponse.compatibility.supportsCIP36Vote === true;
      }

      const { rawTxHex } = request;

      const network = getNetworkById(request.networkId);

      const txBodyHex = transactionHexToBodyHex(rawTxHex);

      const addressedUtxos = [
        ...await this.stores.wallets.getAddressedUtxos(),
        ...(request.additionalSenderUtxos || [])
      ];

      const response = this.api.ada.createHwSignTxDataFromRawTx('ledger', {
        txBodyHex,
        network,
        addressingMap: request.addressingMap,
        senderUtxos: addressedUtxos,
        ledgerSupportsCip36,
        catalystData: request.catalystData,
        changeAddrs: request.changeAddrs,
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

      let metadata;
      if (request.catalystData) {
        const {
          votingPublicKey,
          stakingKey,
          paymentAddress,
          nonce,
        } = request.catalystData;

        if (
          !ledgerSignTxResp.auxiliaryDataSupplement ||
            (ledgerSignTxResp.auxiliaryDataSupplement.type !==
              TxAuxiliaryDataSupplementType.CIP36_REGISTRATION)
        ) {
          throw new Error(`${nameof(LedgerSendStore)}::${nameof(this.signRawTx)} unexpected Ledger sign transaction response`);
        }
        const { cip36VoteRegistrationSignatureHex } =
          ledgerSignTxResp.auxiliaryDataSupplement;

        if (ledgerSupportsCip36) {
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
      }

      const { txHex, txId } = buildConnectorSignedTransaction(
        rawTxHex,
        ledgerSignTxResp.witnesses,
        request.publicKey,
        metadata,
        new Map((request.additionalSenderUtxos || []).map(
          ({ addressing, receiver }) => [addressing.path.join('/'), receiver]
        )),
      );

      return { signedTxHex: txHex, txId, metadata };
    } catch (error) {
      Logger.error(`${nameof(LedgerSendStore)}::${nameof(this.signRawTx)} error: ` + stringifyError(error));
      throw new convertToLocalizableError(error);
    } finally {
      if (ledgerConnect != null) {
        ledgerConnect.dispose();
      }
    }
  };

  cancel: void => void = () => {
    if (!this.isActionProcessing) {
      this.stores.uiDialogs.closeActiveDialog();
      this._reset();
    }
  }

  @action _setActionProcessing: boolean => void = (processing) => {
    this.isActionProcessing = processing;
  }
}
