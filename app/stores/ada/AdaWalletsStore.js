// @flow
import { observable, } from 'mobx';

import Store from '../base/Store';
import {
  Logger,
  stringifyError
} from '../../utils/logging';
import Request from '../lib/LocalizedRequest';
import type {
  SignAndBroadcastRequest,
  GenerateWalletRecoveryPhraseFunc
} from '../../api/ada/index';
import {
  asGetSigningKey, asHasLevels,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { ROUTES } from '../../routes-config';
import { buildCheckAndCall } from '../lib/check';
import { getApiForNetwork, ApiOptions } from '../../api/common/utils';
import type { ISignRequest } from '../../api/common/lib/transactions/ISignRequest';
import { ConceptualWallet } from '../../api/ada/lib/storage/models/ConceptualWallet';

export default class AdaWalletsStore extends Store {

  // REQUESTS

  @observable generateWalletRecoveryPhraseRequest: Request<GenerateWalletRecoveryPhraseFunc>
    = new Request<GenerateWalletRecoveryPhraseFunc>(this.api.ada.generateWalletRecoveryPhrase);

  setup(): void {
    super.setup();
    const { ada, wallets, walletBackup } = this.actions;
    const { asyncCheck } = buildCheckAndCall(
      ApiOptions.ada,
      () => {
        if (this.stores.profile.selectedNetwork == null) return undefined;
        return getApiForNetwork(this.stores.profile.selectedNetwork);
      }
    );
    walletBackup.finishWalletBackup.listen(asyncCheck(this._createInDb));
    ada.wallets.createWallet.listen(this._startWalletCreation);
    wallets.sendMoney.listen(asyncCheck(this._sendMoney));
  }

  // =================== SEND MONEY ==================== //

  /** Send money and then return to transaction screen */
  _sendMoney:  {|
    signRequest: ISignRequest<any>,
    password: string,
    publicDeriver: PublicDeriver<>,
  |} => Promise<void> = async (transactionDetails) => {
    const publicDeriver = asHasLevels<
      ConceptualWallet
    >(transactionDetails.publicDeriver);
    if (publicDeriver == null) throw new Error();
    const withSigning = (asGetSigningKey(publicDeriver));
    if (withSigning == null) {
      throw new Error(`${nameof(this._sendMoney)} public deriver missing signing functionality.`);
    }
    const { signRequest } = transactionDetails;
    if (!(signRequest instanceof HaskellShelleyTxSignRequest)) {
      throw new Error(`${nameof(this._sendMoney)} wrong tx sign request`);
    }
    this.adaSendAndRefresh({
      broadcastRequest: {
        normal: {
          publicDeriver: withSigning,
          password: transactionDetails.password,
          getStakingWitnesses: () => Promise.resolve(() => []),
          signRequest,
          sendTx: this.stores.substores.ada.stateFetchStore.fetcher.sendTx,
        },
      },
      refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(
        transactionDetails.publicDeriver
      ),
    });

    this.actions.dialogs.closeActiveDialog.trigger();
    this.stores.wallets.sendMoneyRequest.reset();
    this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ROOT });
  };

  adaSendAndRefresh: {|
    broadcastRequest: {|
      normal: SignAndBroadcastRequest,
    |} | {|
     trezor: {|
        publicDeriver: PublicDeriver<>,
        signRequest: HaskellShelleyTxSignRequest,
     |},
    |} | {|
     ledger: {|
        publicDeriver: PublicDeriver<>,
        signRequest: HaskellShelleyTxSignRequest,
     |},
    |},
    refreshWallet: () => Promise<void>,
  |} => Promise<void> = async (request) => {

    const broadcastRequest = async () => {
      if (request.broadcastRequest.ledger) {
        throw new Error(`Not implemented yet`);
      }
      if (request.broadcastRequest.trezor) {
        return await this.stores.substores.ada.trezorSend.signAndBroadcast({
          params: { signRequest: request.broadcastRequest.trezor.signRequest },
          publicDeriver: request.broadcastRequest.trezor.publicDeriver,
        });
      }
      if (request.broadcastRequest.normal) {
        return await this.api.ada.signAndBroadcast(
          request.broadcastRequest.normal
        );
      }
      throw new Error(`${nameof(AdaWalletsStore)}::${nameof(this.adaSendAndRefresh)} unhandled wallet type`);
    };
    const publicDeriver = (() => {
      if (request.broadcastRequest.ledger) return request.broadcastRequest.ledger.publicDeriver;
      if (request.broadcastRequest.trezor) return request.broadcastRequest.trezor.publicDeriver;
      if (request.broadcastRequest.normal) return request.broadcastRequest.normal.publicDeriver;
      throw new Error(`${nameof(AdaWalletsStore)}::${nameof(this.adaSendAndRefresh)} unhandled wallet type`);
    })();
    this.stores.wallets.sendAndRefresh({
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
      const wallet = await this.api.ada.createWallet({
        mode: 'cip1852',
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
