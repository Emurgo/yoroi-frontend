// @flow
import { observable } from 'mobx';

import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import type { GenerateWalletRecoveryPhraseFunc } from '../../api/ada/index';
import { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import { HARD_DERIVATION_START } from '../../config/numbersConfig';
import { asGetAllUtxos } from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { fail, first, sorted } from '../../coreUtils';
import type { QueriedUtxo } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import BigNumber from 'bignumber.js';

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
            publicDeriver: PublicDeriver<>,
            signRequest: HaskellShelleyTxSignRequest,
            password: string,
          |},
        |}
      | {|
          trezor: {|
            publicDeriver: PublicDeriver<>,
            signRequest: HaskellShelleyTxSignRequest,
          |},
        |}
      | {|
          ledger: {|
            publicDeriver: PublicDeriver<>,
            signRequest: HaskellShelleyTxSignRequest,
          |},
        |},
    refreshWallet: () => Promise<void>,
  |}) => Promise<void> = async request => {
    const broadcastRequest = async () => {
      if (request.broadcastRequest.ledger) {
        return await this.stores.substores.ada.ledgerSend.signAndBroadcastFromWallet({
          params: { signRequest: request.broadcastRequest.ledger.signRequest },
          publicDeriver: request.broadcastRequest.ledger.publicDeriver,
        });
      }
      if (request.broadcastRequest.trezor) {
        return await this.stores.substores.ada.trezorSend.signAndBroadcast({
          params: { signRequest: request.broadcastRequest.trezor.signRequest },
          publicDeriver: request.broadcastRequest.trezor.publicDeriver,
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
    const publicDeriver = (() => {
      if (request.broadcastRequest.ledger) return request.broadcastRequest.ledger.publicDeriver;
      if (request.broadcastRequest.trezor) return request.broadcastRequest.trezor.publicDeriver;
      if (request.broadcastRequest.normal) return request.broadcastRequest.normal.publicDeriver;
      throw new Error(
        `${nameof(AdaWalletsStore)}::${nameof(this.adaSendAndRefresh)} unhandled wallet type`
      );
    })();
    await this.stores.wallets.sendAndRefresh({
      publicDeriver,
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
    const persistentDb = this.stores.loading.getDatabase();
    if (persistentDb == null) {
      throw new Error(`${nameof(this._createInDb)} db not loaded. Should never happen`);
    }
    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null) throw new Error(`${nameof(this._createInDb)} no network selected`);
    await this.stores.wallets.createWalletRequest.execute(async () => {
      const wallet = await this.api.ada.createWallet({
        db: persistentDb,
        walletName: this.stores.walletBackup.name,
        walletPassword: this.stores.walletBackup.password,
        recoveryPhrase: this.stores.walletBackup.recoveryPhrase.join(' '),
        network: selectedNetwork,
        accountIndex: this.stores.walletBackup.selectedAccount,
      });
      return wallet;
    }).promise;
  };

  _createWallet: {|
    recoveryPhrase: Array<string>,
    walletPassword: string,
    walletName: string,
  |} => Promise<void> = async (request) => {
    const persistentDb = this.stores.loading.getDatabase();
    if (persistentDb == null) {
      throw new Error(`${nameof(this._createInDb)} db not loaded. Should never happen`);
    }
    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null) throw new Error(`${nameof(this._createInDb)} no network selected`);
    await this.stores.wallets.createWalletRequest.execute(async () => {
      const wallet = await this.api.ada.createWallet({
        db: persistentDb,
        walletName: request.walletName,
        walletPassword: request.walletPassword,
        recoveryPhrase: request.recoveryPhrase.join(' '),
        network: selectedNetwork,
        accountIndex: 0 + HARD_DERIVATION_START,
      });
      return wallet;
    }).promise;
  };

  pickCollateralUtxo: ({| wallet: PublicDeriver<> |}) => Promise<?QueriedUtxo> = async ({ wallet }) => {
    const withUtxos = asGetAllUtxos(wallet)
      ?? fail(`${nameof(this.pickCollateralUtxo)} missing utxo functionality`);
    const allUtxos: Array<QueriedUtxo> = await withUtxos.getAllUtxos();
    if (allUtxos.length === 0) {
      fail('Cannot pick a collateral utxo! No utxo available at all in the wallet!');
    }
    const utxoDefaultCoinAmount = (u: QueriedUtxo): BigNumber =>
      new BigNumber(u.output.tokens.find(x => x.Token.Identifier === '')?.TokenList.Amount ?? 0);
    const compareDefaultCoins = (a: QueriedUtxo, b: QueriedUtxo): number =>
      utxoDefaultCoinAmount(a).comparedTo(utxoDefaultCoinAmount(b));
    const pureUtxos = allUtxos.filter(u => u.output.tokens.length === 1);
    return first(sorted(pureUtxos, compareDefaultCoins));
  }
}
