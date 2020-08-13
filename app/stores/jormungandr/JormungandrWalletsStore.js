// @flow
import { observable, } from 'mobx';

import Store from '../base/Store';
import {
  Logger,
  stringifyError
} from '../../utils/logging';
import Request from '../lib/LocalizedRequest';
import type {
  GenerateWalletRecoveryPhraseFunc
} from '../../api/jormungandr/index';
import {
  asGetSigningKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { JormungandrTxSignRequest } from '../../api/jormungandr/lib/transactions/JormungandrTxSignRequest';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { ROUTES } from '../../routes-config';
import { buildCheckAndCall } from '../lib/check';
import { getApiForNetwork, ApiOptions } from '../../api/common/utils';
import type { ISignRequest } from '../../api/common/lib/transactions/ISignRequest';

export default class JormungandrWalletsStore extends Store {

  // REQUESTS

  @observable generateWalletRecoveryPhraseRequest: Request<GenerateWalletRecoveryPhraseFunc>
    = new Request<GenerateWalletRecoveryPhraseFunc>(
      this.api.jormungandr.generateWalletRecoveryPhrase
    );

  setup(): void {
    super.setup();
    const { jormungandr, walletBackup } = this.actions;
    const { asyncCheck } = buildCheckAndCall(
      ApiOptions.jormungandr,
      () => {
        if (this.stores.profile.selectedNetwork == null) return undefined;
        return getApiForNetwork(this.stores.profile.selectedNetwork);
      }
    );
    walletBackup.finishWalletBackup.listen(asyncCheck(this._createInDb));
    jormungandr.wallets.createWallet.listen(this._startWalletCreation);
  }

  // =================== SEND MONEY ==================== //

  jormungandrSendAndRefresh: {|
    broadcastRequest: {|
      normal: {|
        publicDeriver: PublicDeriver<>,
        signRequest: JormungandrTxSignRequest,
        password: string,
      |}
    |},
    refreshWallet: () => Promise<void>,
  |} => Promise<void> = async (request) => {

    const broadcastRequest = async () => {
      if (request.broadcastRequest.normal) {
        return await this.stores.substores.jormungandr.mnemonicSend.signAndBroadcast(
          request.broadcastRequest.normal
        );
      }
      throw new Error(`${nameof(JormungandrWalletsStore)}::${nameof(this.jormungandrSendAndRefresh)} unhandled wallet type`);
    };
    const publicDeriver = (() => {
      if (request.broadcastRequest.normal) return request.broadcastRequest.normal.publicDeriver;
      throw new Error(`${nameof(JormungandrWalletsStore)}::${nameof(this.jormungandrSendAndRefresh)} unhandled wallet type`);
    })();
    await this.stores.wallets.sendAndRefresh({
      publicDeriver,
      broadcastRequest,
      refreshWallet: request.refreshWallet,
    });
  }

  // =================== WALLET RESTORATION ==================== //

  _startWalletCreation: {|
    name: string,
    password: string,
  |} => Promise<void> = async (params) => {
    const recoveryPhrase = await (
      this.generateWalletRecoveryPhraseRequest.execute({}).promise
    );
    if (recoveryPhrase == null) {
      throw new Error(`${nameof(this._startWalletCreation)} failed to generate recovery phrase`);
    }
    this.actions.walletBackup.initiateWalletBackup.trigger({
      recoveryPhrase,
      name: params.name,
      password: params.password,
    });
  };

  /** Create the wallet and go to wallet summary screen */
  _createInDb: void => Promise<void> = async () => {
    const persistentDb = this.stores.loading.loadPersistentDbRequest.result;
    if (persistentDb == null) {
      throw new Error(`${nameof(this._createInDb)} db not loaded. Should never happen`);
    }
    const { selectedNetwork } = this.stores.profile;
    if (selectedNetwork == null) throw new Error(`${nameof(this._createInDb)} no network selected`);
    await this.stores.wallets.createWalletRequest.execute(async () => {
      const wallet = await this.api.jormungandr.createWallet({
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
}
