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
import { asGetAllUtxos } from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { fail, first, sorted } from '../../coreUtils';
import type { QueriedUtxo } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import BigNumber from 'bignumber.js';
import type{ WalletState } from '../../../chrome/extension/background/types';

const MAX_PICKED_COLLATERAL_UTXO_ADA = 10_000_000; // 10 ADA

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
            +wallet: {
              publicDeriverId: number,
              +plate: { TextPart: string, ... },
              ...
            },
            signRequest: HaskellShelleyTxSignRequest,
            password: string,
          |},
        |}
      | {|
          trezor: {|
            signRequest: HaskellShelleyTxSignRequest,
            +wallet: {
              publicDeriverId: number,
              +plate: { TextPart: string, ... },
              publicKey: string,
              pathToPublic: Array<number>,
              stakingAddressing: Addressing,
              networkId: number,
              hardwareWalletDeviceId: ?string,
              ...
            },
          |},
        |}
      | {|
          ledger: {|
            signRequest: HaskellShelleyTxSignRequest,
            +wallet: {
              publicDeriverId: number,
              +plate: { TextPart: string, ... },
              stakingAddressing: Addressing,
              publicKey: string,
              pathToPublic: Array<number>,
              networkId: number,
              hardwareWalletDeviceId: ?string,
              ...
            }
          |},
        |},
    refreshWallet: () => Promise<void>,
  |}) => Promise<void> = async request => {
    let broadcastRequest;
    let publicDeriverId;
    let plateTextPart;

    if (request.broadcastRequest.ledger) {
      const { wallet, signRequest } = request.broadcastRequest.ledger;
      broadcastRequest = async () => {
        return await this.stores.substores.ada.ledgerSend.signAndBroadcastFromWallet({
          params: { signRequest },
          wallet,
        });
      };
      publicDeriverId = wallet.publicDeriverId;
      plateTextPart = wallet.plate.TextPart;
    } else if (request.broadcastRequest.trezor) {
      const { wallet, signRequest } = request.broadcastRequest.trezor;
      broadcastRequest = async () => {
        return await this.stores.substores.ada.trezorSend.signAndBroadcast({
          params: { signRequest },
          wallet: wallet,
        });
      };
      publicDeriverId = request.broadcastRequest.trezor.wallet.publicDeriverId;
      plateTextPart = request.broadcastRequest.trezor.wallet.plate.TextPart;
    } else if (request.broadcastRequest.normal) {
      const { wallet, signRequest, password } = request.broadcastRequest.normal;
      broadcastRequest = async () => {
        return await this.stores.substores.ada.mnemonicSend.signAndBroadcast({
          signRequest,
          password,
          publicDeriverId: wallet.publicDeriverId,
        });
      };
      publicDeriverId = wallet.publicDeriverId;
      plateTextPart = wallet.plate.TextPart;
    } else {
      throw new Error(
        `${nameof(AdaWalletsStore)}::${nameof(this.adaSendAndRefresh)} unhandled wallet type`
      );
    };
    await this.stores.wallets.sendAndRefresh({
      publicDeriverId,
      broadcastRequest,
      refreshWallet: request.refreshWallet,
      plateTextPart,
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
    await this.stores.wallets.createWalletRequest.execute(async () => {
      const wallet = await createWallet({
        walletName: request.walletName,
        walletPassword: request.walletPassword,
        recoveryPhrase: request.recoveryPhrase.join(' '),
        networkId: selectedNetwork.NetworkId,
        accountIndex: 0 + HARD_DERIVATION_START,
      });
      return wallet;
    }).promise;
  };

  pickCollateralUtxo: ({| wallet: WalletState |}) => Promise<?QueriedUtxo> = async ({ wallet }) => {
    const allUtxos = wallet.utxos;
    if (allUtxos.length === 0) {
      fail('Cannot pick a collateral utxo! No utxo available at all in the wallet!');
    }
    const utxoDefaultCoinAmount = (u: QueriedUtxo): BigNumber =>
      new BigNumber(u.output.tokens.find(x => x.Token.Identifier === '')?.TokenList.Amount ?? 0);
    const compareDefaultCoins = (a: QueriedUtxo, b: QueriedUtxo): number =>
      utxoDefaultCoinAmount(a).comparedTo(utxoDefaultCoinAmount(b));
    const smallPureUtxos = allUtxos
      .filter(u => u.output.tokens.length === 1 && utxoDefaultCoinAmount(u).lte(MAX_PICKED_COLLATERAL_UTXO_ADA));
    return first(sorted(smallPureUtxos, compareDefaultCoins));
  }
}
