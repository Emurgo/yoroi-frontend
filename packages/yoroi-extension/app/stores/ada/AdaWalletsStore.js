// @flow
import { observable } from 'mobx';

import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import type { GenerateWalletRecoveryPhraseFunc } from '../../api/ada/index';
import { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import { HARD_DERIVATION_START } from '../../config/numbersConfig';
import { createWallet } from '../../api/thunk';
import type { Addressing } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';

export default class AdaWalletsStore extends Store<StoresMap, ActionsMap> {
  // REQUESTS

  @observable
  generateWalletRecoveryPhraseRequest: Request<GenerateWalletRecoveryPhraseFunc> = new Request<GenerateWalletRecoveryPhraseFunc>(
    this.api.ada.generateWalletRecoveryPhrase
  );

  setup(): void {
    super.setup();
    const { ada, walletBackup } = this.actions;
    walletBackup.finishWalletBackup.listen(this._createInDb);
    ada.wallets.startWalletCreation.listen(this._startWalletCreation);
    ada.wallets.createWallet.listen(this._createWallet)
  }

  // =================== SEND MONEY ==================== //

  adaSendAndRefresh: ({|
    broadcastRequest:
      | {|
          normal: {|
            publicDeriverId: number,
            signRequest: HaskellShelleyTxSignRequest,
            password: string,
          |},
        |}
      | {|
          trezor: {|
            publicDeriverId: number,
            signRequest: HaskellShelleyTxSignRequest,
            publicKey: string,
            pathToPublic: Array<number>,
            stakingAddressing: Addressing,
            networkId: number,
            hardwareWalletDeviceId: string,
          |},
        |}
      | {|
          ledger: {|
            publicDeriverId: number,
            signRequest: HaskellShelleyTxSignRequest,
            stakingAddressing: Addressing,
            publicKey: string,
            pathToPublic: Array<number>,
            networkId: number,
            hardwareWalletDeviceId: string,
          |},
        |},
    refreshWallet: () => Promise<void>,
  |}) => Promise<void> = async request => {
    const broadcastRequest = async () => {
      if (request.broadcastRequest.ledger) {
        return await this.stores.substores.ada.ledgerSend.signAndBroadcastFromWallet({
          params: { signRequest: request.broadcastRequest.ledger.signRequest },
          publicDeriverId: request.broadcastRequest.ledger.publicDeriverId,
          publicKey: request.broadcastRequest.ledger.publicKey,
          pathToPublic: request.broadcastRequest.ledger.pathToPublic,
          networkId: request.broadcastRequest.ledger.networkId,
          hardwareWalletDeviceId: request.broadcastRequest.ledger.hardwareWalletDeviceId,
        });
      }
      if (request.broadcastRequest.trezor) {
        return await this.stores.substores.ada.trezorSend.signAndBroadcast({
          params: { signRequest: request.broadcastRequest.trezor.signRequest },
          publicDeriverId: request.broadcastRequest.trezor.publicDeriverId,
          publicKey: request.broadcastRequest.trezor.publicKey,
          pathToPublic: request.broadcastRequest.trezor.pathToPublic,
          stakingAddressing: request.broadcastRequest.trezor.stakingAddressing,
          networkId: request.broadcastRequest.trezor.networkId,
          hardwareWalletDeviceId: request.broadcastRequest.trezor.hardwareWalletDeviceId,
        });
      }
      if (request.broadcastRequest.normal) {
        return await this.stores.substores.ada.mnemonicSend.signAndBroadcast(
          request.broadcastRequest.normal
        );
      }
      throw new Error(
        `${nameof(AdaWalletsStore)}::${nameof(this.adaSendAndRefresh)} unhandled wallet type`
      );
    };
    const publicDeriverId = (() => {
      if (request.broadcastRequest.ledger) return request.broadcastRequest.ledger.publicDeriverId;
      if (request.broadcastRequest.trezor) return request.broadcastRequest.trezor.publicDeriverId;
      if (request.broadcastRequest.normal) return request.broadcastRequest.normal.publicDeriverId;
      throw new Error(
        `${nameof(AdaWalletsStore)}::${nameof(this.adaSendAndRefresh)} unhandled wallet type`
      );
    })();
    await this.stores.wallets.sendAndRefresh({
      publicDeriverId,
      broadcastRequest,
      refreshWallet: request.refreshWallet,
    });
  };

  // =================== WALLET RESTORATION ==================== //

  _startWalletCreation: ({|
    name: string,
    password: string,
  |}) => Promise<void> = async params => {
    const recoveryPhrase = await this.generateWalletRecoveryPhraseRequest.execute({}).promise;
    if (recoveryPhrase == null) {
      throw new Error(`${nameof(this._startWalletCreation)} failed to generate recovery phrase`);
    }
    this.actions.walletBackup.initiateWalletBackup.trigger({
      recoveryPhrase,
      name: params.name,
      password: params.password,
    });
  };

  genWalletRecoveryPhrase: void => Promise<Array<string>> = async () => {
    const recoveryPhrase = await this.generateWalletRecoveryPhraseRequest.execute({}).promise;

    if (recoveryPhrase == null) {
      throw new Error(`${nameof(this._startWalletCreation)} failed to generate recovery phrase`);
    }

    return recoveryPhrase;
  };

  /** Create the wallet and go to wallet summary screen */
  _createInDb: void => Promise<void> = async () => {
    await this._createWallet({
      recoveryPhrase: this.stores.walletBackup.recoveryPhrase,
      walletPassword: this.stores.walletBackup.password,
      walletName: this.stores.walletBackup.name,
    });
  };

  _createWallet: {|
    recoveryPhrase: Array<string>,
    walletPassword: string,
    walletName: string,
  |} => Promise<void> = async (request) => {
    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null) throw new Error(`${nameof(this._createInDb)} no network selected`);
    await createWallet({
      walletName: request.walletName,
      walletPassword: request.walletPassword,
      recoveryPhrase: request.recoveryPhrase.join(' '),
      networkId: selectedNetwork.NetworkId,
      accountIndex: 0 + HARD_DERIVATION_START,
    });
  };
}
