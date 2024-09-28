// @flow
import { action, observable } from 'mobx';

import Store from '../../base/Store';

import { wrapWithFrame } from '../../lib/TrezorWrapper';
import type { SendUsingTrezorParams } from '../../../actions/ada/trezor-send-actions';
import { Logger, stringifyError, } from '../../../utils/logging';
import { convertToLocalizableError } from '../../../domain/TrezorLocalizedError';
import LocalizableError from '../../../i18n/LocalizableError';
import { ROUTES } from '../../../routes-config';
import { HaskellShelleyTxSignRequest } from '../../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import type { ActionsMap } from '../../../actions/index';
import type { StoresMap } from '../../index';
import { buildSignedTransaction } from '../../../api/ada/transactions/shelley/trezorTx';
import { RustModule } from '../../../api/ada/lib/cardanoCrypto/rustLoader';
import { generateRegistrationMetadata } from '../../../api/ada/lib/cardanoCrypto/catalyst';
import { derivePublicByAddressing } from '../../../api/ada/lib/cardanoCrypto/deriveByAddressing';
import type { Addressing } from '../../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { getNetworkById } from '../../../api/ada/lib/storage/database/prepackaged/networks.js';
import { broadcastTransaction } from '../../../api/thunk';

/** Note: Handles Trezor Signing */
export default class TrezorSendStore extends Store<StoresMap, ActionsMap> {
  // =================== VIEW RELATED =================== //
  // TODO: consider getting rid of both of these
  @observable isActionProcessing: boolean = false;
  @observable error: ?LocalizableError;
  // =================== VIEW RELATED =================== //

  // =================== API RELATED =================== //

  setup(): void {
    super.setup();
    const trezorSendAction = this.actions.ada.trezorSend;
    trezorSendAction.sendUsingTrezor.listen(this._sendWrapper);
    trezorSendAction.cancel.listen(this._cancel);
    trezorSendAction.reset.listen(this._reset);
  }

  _reset: void => void = () => {
    this._setActionProcessing(false);
    this._setError(null);
  }

  _sendWrapper: {|
    params: SendUsingTrezorParams,
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
          trezor: {
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
      const network = getNetworkById(request.wallet.networkId);
      const trezorSignTxDataResp = await this.api.ada.createTrezorSignTxData({
        ...request.params,
        network,
      });

      const trezorSignTxResp = await wrapWithFrame(trezor => {
        return trezor.cardanoSignTransaction(
          JSON.parse(JSON.stringify({ ...trezorSignTxDataResp.trezorSignTxPayload }))
        );
      });

      if (trezorSignTxResp && trezorSignTxResp.payload && trezorSignTxResp.payload.error != null) {
        // this Error will be converted to LocalizableError()
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(trezorSignTxResp.payload.error);
      }
      if (!trezorSignTxResp.success) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(`${nameof(TrezorSendStore)}::${nameof(this.signAndBroadcast)} should never happen`);
      }

      const publicKeyInfo = {
        key: RustModule.WalletV4.Bip32PublicKey.from_bytes(
          Buffer.from(request.wallet.publicKey, 'hex')
        ),
        addressing: {
          startLevel: 1,
          path: request.wallet.pathToPublic,
        },
      };

      const stakingKey = derivePublicByAddressing({
        addressing: request.wallet.stakingAddressing.addressing,
        startingFrom: {
          level: publicKeyInfo.addressing.startLevel + publicKeyInfo.addressing.path.length - 1,
          key: publicKeyInfo.key,
        }
      });

      let metadata;

      if (request.params.signRequest.trezorTCatalystRegistrationTxSignData) {
        const {
          votingPublicKey,
          stakingKey: stakingKeyHex,
          paymentAddress,
          nonce,
        } = request.params.signRequest.trezorTCatalystRegistrationTxSignData;

        const auxDataSupplement = trezorSignTxResp.payload.auxiliaryDataSupplement;
        if (
          !auxDataSupplement
          || auxDataSupplement.type !== 1
          || auxDataSupplement.governanceSignature == null
        ) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error(`${nameof(TrezorSendStore)}::${nameof(this.signAndBroadcast)} unexpected Trezor sign transaction response`);
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
      } else {
        metadata = request.params.signRequest.metadata;
      }

      if (metadata) {
        request.params.signRequest.self().set_auxiliary_data(metadata);
      }

      const tx = request.params.signRequest.self().build_tx();

      const signedTx = buildSignedTransaction(
        tx,
        request.params.signRequest.senderUtxos,
        trezorSignTxResp.payload.witnesses,
        publicKeyInfo,
        stakingKey,
        metadata,
      );

      const txId = Buffer.from(
        RustModule.WalletV4.hash_transaction(tx.body()).to_bytes()
      ).toString('hex');

      await broadcastTransaction({
        publicDeriverId: request.wallet.publicDeriverId,
        signedTxHex: signedTx.to_hex(),
      });
      return { txId };
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
