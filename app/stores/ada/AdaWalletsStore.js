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
} from '../../api/ada/index';
import {
  asGetSigningKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { ByronTxSignRequest } from '../../api/ada/transactions/byron/ByronTxSignRequest';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { ROUTES } from '../../routes-config';
import { buildCheckAndCall } from '../lib/check';
import { getApiForNetwork, ApiOptions } from '../../api/common/utils';
import type { ISignRequest } from '../../api/common/lib/transactions/ISignRequest';

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
    const withSigning = (asGetSigningKey(transactionDetails.publicDeriver));
    if (withSigning == null) {
      throw new Error(`${nameof(this._sendMoney)} public deriver missing signing functionality.`);
    }
    const { signRequest } = transactionDetails;
    if (!(signRequest instanceof ByronTxSignRequest)) {
      throw new Error(`${nameof(this._sendMoney)} wrong tx sign request`);
    }
    await this.stores.wallets.sendMoneyRequest.execute({
      broadcastRequest: async () => await this.api.ada.signAndBroadcast({
        publicDeriver: withSigning,
        password: transactionDetails.password,
        signRequest: signRequest.self(),
        sendTx: this.stores.substores.ada.stateFetchStore.fetcher.sendTx,
      }),
      refreshWallet: () => this.stores.wallets.refreshWalletFromRemote(
        transactionDetails.publicDeriver
      ),
    })
      .then(async (response) => {
        const memo = this.stores.transactionBuilderStore.memo;
        if (memo !== '' && memo !== undefined) {
          try {
            await this.actions.memos.saveTxMemo.trigger({
              publicDeriver: transactionDetails.publicDeriver,
              memo: {
                Content: memo,
                TransactionHash: response.txId,
                LastUpdated: new Date(),
              },
            });
          } catch (error) {
            Logger.error(`${nameof(AdaWalletsStore)}::${nameof(this._sendMoney)} error: ` + stringifyError(error));
            throw new Error('An error has ocurred when saving the transaction memo.');
          }
        }
        return response;
      });

    this.actions.dialogs.closeActiveDialog.trigger();
    this.stores.wallets.sendMoneyRequest.reset();
    this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ROOT });
  };

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
