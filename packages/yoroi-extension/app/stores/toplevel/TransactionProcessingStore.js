// @flow
import Store from '../base/Store';
import type { StoresMap } from '../index';
import {
  HaskellShelleyTxSignRequest,
  type LedgerNanoCatalystRegistrationTxSignData,
  type TrezorTCatalystRegistrationTxSignData,
} from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import {
  signAndBroadcastTransaction,
  signTransaction,
  broadcastTransaction,
} from '../../api/thunk';
import { observable } from 'mobx';
import Request from '../lib/LocalizedRequest';
import { Logger, stringifyError, stringifyData, fullErrStr } from '../../utils/logging';
import {
  buildConnectorSignedTransaction as ledgerBuildConnectorSignedTransaction
} from '../../api/ada/transactions/shelley/ledgerTx';
import {
  buildConnectorSignedTransaction as trezorBuildConnectorSignedTransaction
} from '../../api/ada/transactions/shelley/trezorTx';
import { convertToLocalizableError as trezorConvertToLocalizableError } from '../../domain/TrezorLocalizedError';
import { convertToLocalizableError as ledgerConvertToLocalizableError } from '../../domain/LedgerLocalizedError';
import type { Addressing, Address, Value } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import {
  generateCip15RegistrationMetadata,
  generateRegistrationMetadata,
} from '../../api/ada/lib/cardanoCrypto/catalyst';
import { TxAuxiliaryDataSupplementType } from '@cardano-foundation/ledgerjs-hw-app-cardano';
import { fail } from '../../coreUtils';
import { transactionHexToBodyHex } from '../../api/ada/lib/cardanoCrypto/utils';
import { getNetworkById } from '../../api/ada/lib/storage/database/prepackaged/networks.js';
import { LedgerConnect } from '../../utils/hwConnectHandler';
import { genAddressingLookup } from '../stateless/addressStores';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import type { CardanoAddressedUtxo } from '../../api/ada/transactions/types';
import { wrapWithFrame } from '../lib/TrezorWrapper';
import type { WalletState } from '../../../chrome/extension/background/types';

export type SendMoneyRequest = Request<DeferredCall<{| txId: string |}>>;

export type SendUsingTrezorParams = {|
  signRequest: HaskellShelleyTxSignRequest,
|};

export default class TransactionProcessingStore extends Store<StoresMap> {
  @observable sendMoneyRequest: SendMoneyRequest = new Request<
    DeferredCall<{| txId: string |}>
  >(request => request());

  sendAndRefresh: ({|
    publicDeriverId: void | number,
    plateTextPart: void | string,
    broadcastRequest: void => Promise<{| txId: string |}>,
    refreshWallet: () => Promise<void>,
  |}) => Promise<{| txId: string |}> = async request => {
    this.sendMoneyRequest.reset();
    const resp = await this.sendMoneyRequest.execute(async () => {
      const result = await request.broadcastRequest();

      if (request.publicDeriverId != null) {
        const memo = this.stores.transactionBuilderStore.memo;
        if (memo !== '' && memo !== undefined && request.plateTextPart) {
          try {
            await this.stores.memos.saveTxMemo({
              publicDeriverId: request.publicDeriverId,
              plateTextPart: request.plateTextPart,
              memo: {
                Content: memo,
                TransactionHash: result.txId,
                LastUpdated: new Date(),
              },
            });
          } catch (error) {
            Logger.error(
              `${nameof(TransactionProcessingStore)}::${nameof(this.sendAndRefresh)} error: ` +
                stringifyError(error)
            );
            throw new Error('An error has ocurred when saving the transaction memo.');
          }
        }
      }
      try {
        await request.refreshWallet();
      } catch (_e) {
        // even if refreshing the wallet fails, we don't want to fail the tx
        // otherwise user may try and re-send the tx
      }
      return result;
    }).promise;
    if (resp == null) throw new Error(`Should never happen`);
    return resp;
  };

  adaSendAndRefresh: ({|
    wallet: WalletState,
    signRequest: HaskellShelleyTxSignRequest,
    password: ?string,
    callback: () => Promise<void>,
  |}) => Promise<void> = async request => {
    const { wallet, signRequest, password, callback } = request;

    let broadcastRequest;
    if (wallet.type === 'ledger') {
      broadcastRequest = async () => {
        return await this.ledgerWalletSignAndBroadcast({
          signRequest,
          wallet,
        });
      };
    } else if (wallet.type === 'trezor') {
      broadcastRequest = async () => {
        return await this.trezorSignAndBroadcast({
          signRequest,
          wallet,
        });
      };
    } else if (wallet.type === 'mnemonic') {
      if (!password) {
        throw new Error('missing password for hardware wallet');
      }
      broadcastRequest = async () => {
        return await this.mnemonicWalletSignAndBroadcast({
          signRequest,
          password,
          publicDeriverId: wallet.publicDeriverId,
        });
      };
    } else {
      throw new Error(
        `${nameof(TransactionProcessingStore)}::${nameof(this.adaSendAndRefresh)} unhandled wallet type`
      );
    };
    await this.sendAndRefresh({
      publicDeriverId: wallet.publicDeriverId,
      broadcastRequest,
      refreshWallet: callback,
      plateTextPart: wallet.plate.TextPart,
    });
  };

  adaSignTransactionHexFromWallet: ({|
    transactionHex: string,
    +wallet: {
      publicDeriverId: number,
      +plate: { TextPart: string, ... },
      publicKey: string,
      pathToPublic: Array<number>,
      stakingAddressing: Addressing,
      networkId: number,
      hardwareWalletDeviceId: ?string,
      type: 'trezor' | 'ledger' | 'mnemonic',
      isHardware: boolean,
      ...
    },
    password: string,
  |}) => Promise<{| signedTxHex: string |}> = async ({ wallet, transactionHex, password }) => {
    let result;
    if (wallet.type === 'mnemonic') {
      const signedTxHex = await signTransaction({
        publicDeriverId: wallet.publicDeriverId,
        transactionHex,
        password,
      });
      result = { signedTxHex };
    } else if (wallet.type === 'trezor') {
      result = await this.trezorSignRawTx({
        rawTxHex: transactionHex,
        wallet,
        // by happenstance the use case of this function is not to send
        // money while getting the change so there is no change address
        changeAddrs: [],
      });
    } else if (wallet.type === 'ledger') {
      result = await this.ledgerWalletSignRawTx({
        rawTxHex: transactionHex,
        wallet,
        // by happenstance the use case of this function is not to send
        // money while getting the change so there is no change address
        changeAddrs: [],
      });
    } else {
      throw new Error(
        `${nameof(TransactionProcessingStore)}::${nameof(this.adaSignTransactionHexFromWallet)} unhandled wallet type`
      );
    }
    return { signedTxHex: result.signedTxHex };
  };

  /*
    mnemonic
  */
  mnemonicWalletSignAndBroadcast: {|
    signRequest: HaskellShelleyTxSignRequest,
    password: string,
    publicDeriverId: number,
  |} => Promise<{| txId: string |}> = async (request) => {
    try {
      const { txId } = await signAndBroadcastTransaction(request);
      return { txId };
    } catch (error) {
      Logger.error(`${nameof(TransactionProcessingStore)}::${nameof(this.mnemonicWalletSignAndBroadcast)} error: ${fullErrStr(error)}` );
      throw error;
    }
  }

  /*
    trezor
  */
  trezorSignAndBroadcast: {|
    signRequest: HaskellShelleyTxSignRequest,
    +wallet: {
      publicDeriverId: number,
      networkId: number,
      publicKey: string,
      pathToPublic: Array<number>,
      stakingAddressing: Addressing,
      ...
    },
  |} => Promise<{| txId: string |}> = async (request) => {
    try {
      Logger.debug(`${nameof(TransactionProcessingStore)}::${nameof(this.trezorSignAndBroadcast)} called: ` + stringifyData(request));

      const { signedTxHex, txId, metadata } = await this.trezorSignRawTx({
        rawTxHex: request.signRequest.self().build_tx().to_hex(),
        wallet: request.wallet,
        catalystData: request.signRequest.trezorTCatalystRegistrationTxSignData,
        changeAddrs: request.signRequest.changeAddr, 
      });

      if (metadata) {
        request.signRequest.self().set_auxiliary_data(metadata);
      }

      await broadcastTransaction({
        publicDeriverId: request.wallet.publicDeriverId,
        signedTxHex,
      });

      return { txId };
    } catch (error) {
      Logger.error(`${nameof(TransactionProcessingStore)}::${nameof(this.trezorSignAndBroadcast)} error: ` + stringifyError(error));
      throw new trezorConvertToLocalizableError(error);
    }
  }

  trezorSignRawTx: {|
    rawTxHex: string,
    +wallet: {
      publicDeriverId: number,
      networkId: number,
      publicKey: string,
      pathToPublic: Array<number>,
      stakingAddressing: Addressing,
      ...
    },
    changeAddrs: Array<{| ...Address, ...Value, ...Addressing |}>,
    catalystData?: TrezorTCatalystRegistrationTxSignData,
  |} => Promise<{|
    signedTxHex: string,
    txId: string,
    metadata: ?RustModule.WalletV4.AuxiliaryData
  |}> = async (request) => {
    try {
      Logger.debug(`${nameof(TransactionProcessingStore)}::${nameof(this.trezorSignRawTx)} called: ` + stringifyData(request));

      const addressingMap = genAddressingLookup(
        request.wallet.networkId,
        this.stores.addresses.addressSubgroupMap,
      );

      const network = getNetworkById(request.wallet.networkId);

      const txBodyHex = transactionHexToBodyHex(request.rawTxHex);

      const addressedUtxos = await this.stores.wallets.getAddressedUtxos();

      const response = this.api.ada.createHwSignTxDataFromRawTx('trezor', {
        txBodyHex,
        network,
        addressingMap,
        senderUtxos: addressedUtxos,
        catalystData: request.catalystData,
        changeAddrs: request.changeAddrs,
      });

      const trezorSignTxPayload = response.hw === 'trezor' ? response.result.trezorSignTxPayload
        : fail('Unecpected response type from `createHwSignTxDataFromRawTx` for trezor: ' + JSON.stringify(response));

      const trezorSignTxResp = await wrapWithFrame(trezor => {
        return trezor.cardanoSignTransaction(
          JSON.parse(JSON.stringify({ ...trezorSignTxPayload }))
        );
      });

      if (trezorSignTxResp && trezorSignTxResp.payload && trezorSignTxResp.payload.error != null) {
        // this Error will be converted to LocalizableError()
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(trezorSignTxResp.payload.error);
      }
      if (!trezorSignTxResp.success) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(`${nameof(TransactionProcessingStore)}::${nameof(this.trezorSignRawTx)} should never happen`);
      }

      let metadata;

      if (request.catalystData) {
        const {
          votingPublicKey,
          stakingKey: stakingKeyHex,
          paymentAddress,
          nonce,
        } = request.catalystData;

        const auxDataSupplement = trezorSignTxResp.payload.auxiliaryDataSupplement;
        if (
          !auxDataSupplement
          || auxDataSupplement.type !== 1
          || auxDataSupplement.governanceSignature == null
        ) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error(`${nameof(TransactionProcessingStore)}::${nameof(this.trezorSignRawTx)} unexpected Trezor sign transaction response`);
        }
        const catalystSignature = auxDataSupplement.governanceSignature;

        metadata = generateRegistrationMetadata(
          votingPublicKey,
          stakingKeyHex,
          paymentAddress,
          nonce,
          (_hashedMetadata) => {
            return catalystSignature;
          },
        );
        // We can verify that
        //  Buffer.from(
        //    blake2b(256 / 8).update(metadata.to_bytes()).digest('binary')
        //  ).toString('hex') ===
        // trezorSignTxResp.payload.auxiliaryDataSupplement.auxiliaryDataHash
      }

      const { txHex, txId } = trezorBuildConnectorSignedTransaction(
        request.rawTxHex,
        trezorSignTxResp.payload.witnesses,
        metadata,
      );

      return { signedTxHex: txHex, txId, metadata };
    } catch (error) {
      Logger.error(`${nameof(TransactionProcessingStore)}::${nameof(this.trezorSignRawTx)} error: ` + stringifyError(error));
      throw new trezorConvertToLocalizableError(error);
    }
  }

  /*
    ledger
  */
  ledgerWalletSignAndBroadcast: {|
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
      Logger.debug(`${nameof(TransactionProcessingStore)}::${nameof(this.ledgerWalletSignAndBroadcast)} called: ` + stringifyData(request));

      const { signedTxHex, txId, metadata } = await this.ledgerWalletSignRawTx({
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
        networkId: request.wallet.networkId,
      });

      return { txId };
    } catch (error) {
      Logger.error(`${nameof(TransactionProcessingStore)}::${nameof(this.ledgerWalletSignAndBroadcast)} error: ` + stringifyError(error));
      throw new ledgerConvertToLocalizableError(error);
    }
  };

  ledgerWalletSignRawTx: {|
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
      Logger.debug(`${nameof(TransactionProcessingStore)}::${nameof(this.ledgerWalletSignRawTx)} called: ` + stringifyData(request));

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

      Logger.debug(`${nameof(TransactionProcessingStore)}::${nameof(this.ledgerWalletSignRawTx)} called: ` + stringifyData(request));

      const ledgerConnect = new LedgerConnect({
        locale: this.stores.profile.currentLocale,
      });

      let ledgerSupportsCip36: boolean = false;
      if (request.catalystData) {
        const getVersionResponse = await ledgerConnect.getVersion({
          serial: expectedSerial,
          dontCloseTab: true,
        });
        ledgerSupportsCip36 = getVersionResponse.compatibility.supportsCIP36Vote === true;
      }

      const { rawTxHex } = request;

      const network = getNetworkById(request.wallet.networkId);

      const txBodyHex = transactionHexToBodyHex(rawTxHex);

      const addressedUtxos = [
        ...await this.stores.wallets.getAddressedUtxos(),
        ...(request.additionalSenderUtxos || [])
      ];

      const response = this.api.ada.createHwSignTxDataFromRawTx('ledger', {
        txBodyHex,
        network,
        addressingMap,
        senderUtxos: addressedUtxos,
        ledgerSupportsCip36,
        catalystData: request.catalystData,
        changeAddrs: request.changeAddrs,
      });

      const ledgerSignTxPayload = response.hw === 'ledger' ? response.result.ledgerSignTxPayload
        : fail('Unecpected response type from `createHwSignTxDataFromRawTx` for ledger: ' + JSON.stringify(response));

      let ledgerSignTxResp;
      try{
        ledgerSignTxResp = await ledgerConnect.signTransaction({
          serial: expectedSerial,
          params: ledgerSignTxPayload,
          useOpenTab: true,
        });
      } finally {
        // There is no need of ledgerConnect after this line.
        // UI was getting blocked for few seconds
        // because _prepareAndBroadcastSignedTx takes time.
        // Disposing here will fix the UI issue.
        ledgerConnect.dispose();
      }

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
          throw new Error(`${nameof(TransactionProcessingStore)}::${nameof(this.ledgerWalletSignRawTx)} unexpected Ledger sign transaction response`);
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

      const { txHex, txId } = ledgerBuildConnectorSignedTransaction(
        rawTxHex,
        ledgerSignTxResp.witnesses,
        publicKeyInfo,
        metadata,
        new Map((request.additionalSenderUtxos || []).map(
          ({ addressing, receiver }) => [addressing.path.join('/'), receiver]
        )),
      );

      return { signedTxHex: txHex, txId, metadata };
    } catch (error) {
      Logger.error(`${nameof(TransactionProcessingStore)}::${nameof(this.ledgerWalletSignRawTx)} error: ` + stringifyError(error));
      throw new ledgerConvertToLocalizableError(error);
    }
  }
}
