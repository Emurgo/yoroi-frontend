// @flow
import { action, observable } from 'mobx';

import Store from '../../base/Store';

import { wrapWithFrame } from '../../lib/TrezorWrapper';
import { Logger, stringifyData, stringifyError, } from '../../../utils/logging';
import { convertToLocalizableError } from '../../../domain/TrezorLocalizedError';
import LocalizableError from '../../../i18n/LocalizableError';
import type {
  HaskellShelleyTxSignRequest,
  TrezorTCatalystRegistrationTxSignData,
} from '../../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import type { StoresMap } from '../../index';
import { buildConnectorSignedTransaction } from '../../../api/ada/transactions/shelley/trezorTx';
import { RustModule } from '../../../api/ada/lib/cardanoCrypto/rustLoader';
import { generateRegistrationMetadata } from '../../../api/ada/lib/cardanoCrypto/catalyst';
import type { Addressing, Address, Value } from '../../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { getNetworkById } from '../../../api/ada/lib/storage/database/prepackaged/networks.js';
import { broadcastTransaction } from '../../../api/thunk';
import { transactionHexToBodyHex } from '../../../api/ada/lib/cardanoCrypto/utils';
import { fail } from '../../../coreUtils';
import { genAddressingLookup } from '../../stateless/addressStores';
import type { ISignRequest } from '../../../api/common/lib/transactions/ISignRequest';

export type SendUsingTrezorParams = {|
  signRequest: ISignRequest<any>,
|};

/** Note: Handles Trezor Signing */
export default class TrezorSendStore extends Store<StoresMap> {
  // =================== VIEW RELATED =================== //
  // TODO: consider getting rid of both of these
  @observable isActionProcessing: boolean = false;
  // =================== VIEW RELATED =================== //

  // =================== API RELATED =================== //

  reset: void => void = () => {
    this._setActionProcessing(false);
  }

  signAndBroadcastFromWallet: {|
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
      Logger.debug(`${nameof(TrezorSendStore)}::${nameof(this.signAndBroadcastFromWallet)} called: ` + stringifyData(request));

      const { signedTxHex, txId, metadata } = await this.signRawTxFromWallet({
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
      Logger.error(`${nameof(TrezorSendStore)}::${nameof(this.signAndBroadcastFromWallet)} error: ` + stringifyError(error));
      throw new convertToLocalizableError(error);
    }
  }

  signRawTxFromWallet: {|
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
      Logger.debug(`${nameof(TrezorSendStore)}::${nameof(this.signRawTxFromWallet)} called: ` + stringifyData(request));

      const { rawTxHex, wallet, catalystData } = request;

      const addressingMap = genAddressingLookup(
        wallet.networkId,
        this.stores.addresses.addressSubgroupMap,
      );

      return this.signRawTx({
        rawTxHex,
        addressingMap,
        changeAddrs: request.changeAddrs,
        networkId: wallet.networkId,
        catalystData,
      });

    } catch (error) {
      Logger.error(`${nameof(TrezorSendStore)}::${nameof(this.signRawTxFromWallet)} error: ` + stringifyError(error));
      throw new convertToLocalizableError(error);
    }
  }

  signRawTx: {|
    rawTxHex: string,
    addressingMap: string => (void | $PropertyType<Addressing, 'addressing'>),
    changeAddrs: Array<{| ...Address, ...Value, ...Addressing |}>,
    networkId: number,
    catalystData?: TrezorTCatalystRegistrationTxSignData,
  |} => Promise<{|
    signedTxHex: string,
    txId: string,
    metadata: ?RustModule.WalletV4.AuxiliaryData
  |}> = async (request) => {
    try {
      const network = getNetworkById(request.networkId);

      const txBodyHex = transactionHexToBodyHex(request.rawTxHex);

      const addressedUtxos = await this.stores.wallets.getAddressedUtxos();

      const response = this.api.ada.createHwSignTxDataFromRawTx('trezor', {
        txBodyHex,
        network,
        addressingMap: request.addressingMap,
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
        throw new Error(`${nameof(TrezorSendStore)}::${nameof(this.signRawTx)} should never happen`);
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
          throw new Error(`${nameof(TrezorSendStore)}::${nameof(this.signRawTx)} unexpected Trezor sign transaction response`);
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

      const { txHex, txId } = buildConnectorSignedTransaction(
        request.rawTxHex,
        trezorSignTxResp.payload.witnesses,
        metadata,
      );

      return { signedTxHex: txHex, txId, metadata };
    } catch (error) {
      Logger.error(`${nameof(TrezorSendStore)}::${nameof(this.signRawTx)} error: ` + stringifyError(error));
      throw new convertToLocalizableError(error);
    }
  }

  cancel: void => void = () => {
    if (!this.isActionProcessing) {
      this.stores.uiDialogs.closeActiveDialog();
      this.reset();
    }
  }

  @action _setActionProcessing: boolean => void = (processing) => {
    this.isActionProcessing = processing;
  }
}
