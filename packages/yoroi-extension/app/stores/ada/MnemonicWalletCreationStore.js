// @flow
import { observable } from 'mobx';

import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import type { GenerateWalletRecoveryPhraseFunc } from '../../api/ada/index';
import type { StoresMap } from '../index';
import { HARD_DERIVATION_START } from '../../config/numbersConfig';
import { createWallet } from '../../api/thunk';

export default class MnemonicWalletCreationStore extends Store<StoresMap> {
  // REQUESTS

  @observable
  generateWalletRecoveryPhraseRequest: Request<GenerateWalletRecoveryPhraseFunc> = new Request<GenerateWalletRecoveryPhraseFunc>(
    this.api.ada.generateWalletRecoveryPhrase
  );

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
}
