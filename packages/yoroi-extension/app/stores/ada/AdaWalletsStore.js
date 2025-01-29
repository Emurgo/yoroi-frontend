// @flow
import { observable } from 'mobx';

import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import type { GenerateWalletRecoveryPhraseFunc } from '../../api/ada/index';
import { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import type { StoresMap } from '../index';
import { HARD_DERIVATION_START } from '../../config/numbersConfig';
import { createWallet, signTransaction } from '../../api/thunk';
import type {
  Addressing,
  QueriedUtxo,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { fail, first, sorted } from '../../coreUtils';
import BigNumber from 'bignumber.js';
import type{ WalletState } from '../../../chrome/extension/background/types';

const MAX_PICKED_COLLATERAL_UTXO_ADA = 10_000_000; // 10 ADA

export default class AdaWalletsStore extends Store<StoresMap> {
  // REQUESTS

  @observable
  generateWalletRecoveryPhraseRequest: Request<GenerateWalletRecoveryPhraseFunc> = new Request<GenerateWalletRecoveryPhraseFunc>(
    this.api.ada.generateWalletRecoveryPhrase
  );

  // =================== SEND MONEY ==================== //

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
        return await this.stores.substores.ada.ledgerSend.signAndBroadcastFromWallet({
          signRequest,
          wallet,
        });
      };
    } else if (wallet.type === 'trezor') {
      broadcastRequest = async () => {
        return await this.stores.substores.ada.trezorSend.signAndBroadcastFromWallet({
          signRequest,
          wallet,
        });
      };
    } else if (wallet.type === 'mnemonic') {
      if (!password) {
        throw new Error('missing password for hardware wallet');
      }
      broadcastRequest = async () => {
        return await this.stores.substores.ada.mnemonicSend.signAndBroadcast({
          signRequest,
          password,
          publicDeriverId: wallet.publicDeriverId,
        });
      };
    } else {
      throw new Error(
        `${nameof(AdaWalletsStore)}::${nameof(this.adaSendAndRefresh)} unhandled wallet type`
      );
    };
    await this.stores.wallets.sendAndRefresh({
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
    const walletType: string = wallet.type;
    const baseSignRequest = { wallet, transactionHex };
    const signRequest = wallet.isHardware
      ? { [walletType]: baseSignRequest }
      : { normal: { ...baseSignRequest, password } };
    // $FlowIgnore[incompatible-call]
    return this.adaSignTransactionHex({ signRequest });
  }

  adaSignTransactionHex: ({|
    signRequest:
      | {|
          normal: {|
            +wallet: {
              publicDeriverId: number,
              +plate: { TextPart: string, ... },
              ...
            },
            transactionHex: string,
            password: string,
          |},
        |}
      | {|
          trezor: {|
            transactionHex: string,
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
            transactionHex: string,
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
  |}) => Promise<{| signedTxHex: string |}> = async request => {
    if (request.signRequest.ledger) {
      const { wallet, transactionHex } = request.signRequest.ledger;
      const { signedTxHex } = await this.stores.substores.ada.ledgerSend
        .signRawTxFromWallet({ rawTxHex: transactionHex, wallet });
      return { signedTxHex };
    }
    if (request.signRequest.trezor) {
      const { wallet, transactionHex } = request.signRequest.trezor;
      const { signedTxHex } = await this.stores.substores.ada.trezorSend
        .signRawTxFromWallet({ rawTxHex: transactionHex, wallet });
      return { signedTxHex };
    }
    if (request.signRequest.normal) {
      const { wallet, transactionHex, password } = request.signRequest.normal;
      const signedTxHex = await signTransaction({
        publicDeriverId: wallet.publicDeriverId,
        transactionHex,
        password,
      });
      return { signedTxHex };
    }
    throw new Error(
      `${nameof(AdaWalletsStore)}::${nameof(this.adaSignTransactionHex)} unhandled wallet type`
    );
  };

  // =================== WALLET RESTORATION ==================== //

  startWalletCreation: ({|
    name: string,
    password: string,
  |}) => Promise<void> = async params => {
    const recoveryPhrase = await this.generateWalletRecoveryPhraseRequest.execute({}).promise;
    if (recoveryPhrase == null) {
      throw new Error(`${nameof(this.startWalletCreation)} failed to generate recovery phrase`);
    }
    this.stores.walletBackup.initiateWalletBackup({
      recoveryPhrase,
      name: params.name,
      password: params.password,
    });
  };

  genWalletRecoveryPhrase: void => Promise<Array<string>> = async () => {
    const recoveryPhrase = await this.generateWalletRecoveryPhraseRequest.execute({}).promise;

    if (recoveryPhrase == null) {
      throw new Error(`${nameof(this.startWalletCreation)} failed to generate recovery phrase`);
    }

    return recoveryPhrase;
  };

  /** Create the wallet and go to wallet summary screen */
  finishWalletBackup: void => Promise<void> = async () => {
    await this.createWallet({
      recoveryPhrase: this.stores.walletBackup.recoveryPhrase,
      walletPassword: this.stores.walletBackup.password,
      walletName: this.stores.walletBackup.name,
    });
  };

  createWallet: {|
    recoveryPhrase: Array<string>,
    walletPassword: string,
    walletName: string,
  |} => Promise<void> = async (request) => {
    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null) throw new Error(`${nameof(this.finishWalletBackup)} no network selected`);
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
