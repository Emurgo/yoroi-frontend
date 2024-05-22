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
import { HaskellShelleyTxSignRequest } from '../../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import type { ActionsMap } from '../../../actions/index';
import type { StoresMap } from '../../index';
import { buildSignedTransaction } from '../../../api/ada/transactions/shelley/trezorTx';
import {
  asGetPublicKey,
  asHasLevels,
  asGetStakingKey,
} from '../../../api/ada/lib/storage/models/PublicDeriver/traits';
import { RustModule } from '../../../api/ada/lib/cardanoCrypto/rustLoader';
import type {
  ConceptualWallet
} from '../../../api/ada/lib/storage/models/ConceptualWallet/index';
import { generateRegistrationMetadata } from '../../../api/ada/lib/cardanoCrypto/catalyst';
import { derivePublicByAddressing } from '../../../api/ada/lib/cardanoCrypto/deriveByAddressing';

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
    publicDeriver: PublicDeriver<>,
    onSuccess?: void => void,
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
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(trezorSignTxResp.payload.error);
      }
      if (!trezorSignTxResp.success) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(`${nameof(TrezorSendStore)}::${nameof(this.signAndBroadcast)} should never happen`);
      }

      const withLevels = asHasLevels<ConceptualWallet>(request.publicDeriver);
      if (withLevels == null) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(`${nameof(this.signAndBroadcast)} No public deriver level for this public deriver`);
      }

      const withPublicKey = asGetPublicKey(withLevels);
      if (withPublicKey == null) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(`${nameof(this.signAndBroadcast)} No public key for this public deriver`);
      }
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

      let stakingKey;
      const withStakingKey = asGetStakingKey(request.publicDeriver);
      // Byron wallets have no staking key
      if (withStakingKey) {
        const stakingKeyResp = await withStakingKey.getStakingKey();

        stakingKey = derivePublicByAddressing({
          addressing: stakingKeyResp.addressing,
          startingFrom: {
            level: publicKeyInfo.addressing.startLevel + publicKeyInfo.addressing.path.length - 1,
            key: publicKeyInfo.key,
          }
        });
      }

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

      const txBody = request.params.signRequest.self().build();

      const signedTx = buildSignedTransaction(
        txBody,
        request.params.signRequest.senderUtxos,
        trezorSignTxResp.payload.witnesses,
        publicKeyInfo,
        stakingKey,
        metadata,
      );

      const txId = Buffer.from(
        RustModule.WalletV4.hash_transaction(txBody).to_bytes()
      ).toString('hex');

      await this.api.ada.broadcastTrezorSignedTx({
        signedTxRequest: {
          network,
          id: txId,
          encodedTx: signedTx.to_bytes(),
        },
        sendTx: this.stores.substores.ada.stateFetchStore.fetcher.sendTx,
      });
      await this.stores.substores.ada.transactions.recordSubmittedTransaction(
        request.publicDeriver,
        request.params.signRequest,
        txId,
      );
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
