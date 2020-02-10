// @flow
// import { BigNumber } from 'bignumber.js';
import { observable, action } from 'mobx';

import Store from '../base/Store';
import { matchRoute, buildRoute } from '../../utils/routing';
import Request from '../lib/LocalizedRequest';
import { ROUTES } from '../../routes-config';
import type {
  SignAndBroadcastRequest, SignAndBroadcastResponse,
  CreateWalletFunc,
  GetWalletsFunc, RestoreWalletFunc,
  GenerateWalletRecoveryPhraseFunc
} from '../../api/ada/index';
import type { BaseSignRequest } from '../../api/ada/transactions/types';
import {
  asGetSigningKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import type { WalletWithCachedMeta } from '../toplevel/WalletStore';

export default class AdaWalletsStore extends Store {

  // REQUESTS
  @observable getInitialWallets: Request<GetWalletsFunc>
    = new Request<GetWalletsFunc>(this.api.ada.getWallets);

  @observable createWalletRequest: Request<CreateWalletFunc>
    = new Request<CreateWalletFunc>(this.api.ada.createWallet.bind(this.api.ada));

  @observable sendMoneyRequest: Request<typeof AdaWalletsStore.prototype.sendAndRefresh>
    = new Request<typeof AdaWalletsStore.prototype.sendAndRefresh>(this.sendAndRefresh);

  @observable generateWalletRecoveryPhraseRequest: Request<GenerateWalletRecoveryPhraseFunc>
    = new Request<GenerateWalletRecoveryPhraseFunc>(this.api.ada.generateWalletRecoveryPhrase);

  @observable restoreRequest: Request<RestoreWalletFunc>
    = new Request<RestoreWalletFunc>(this.api.ada.restoreWallet);

  setup(): void {
    super.setup();
    const { router, ada } = this.actions;
    const { wallets } = ada;
    wallets.createWallet.listen(this._createWallet);
    wallets.sendMoney.listen(this._sendMoney);
    wallets.restoreWallet.listen(this._restoreWallet);
    router.goToRoute.listen(this._onRouteChange);
  }

  // =================== SEND MONEY ==================== //

  /** Send money and then return to transaction screen */
  _sendMoney:  {|
    signRequest: BaseSignRequest<RustModule.WalletV2.Transaction | RustModule.WalletV3.InputOutput>,
    password: string,
    publicDeriver: WalletWithCachedMeta,
  |} => Promise<void> = async (transactionDetails) => {
    const withSigning = (asGetSigningKey(transactionDetails.publicDeriver.self));
    if (withSigning == null) {
      throw new Error(`${nameof(this._sendMoney)} public deriver missing signing functionality.`);
    }
    await this.sendMoneyRequest.execute({
      broadcastRequest: {
        publicDeriver: withSigning,
        password: transactionDetails.password,
        signRequest: transactionDetails.signRequest,
        sendTx: this.stores.substores.ada.stateFetchStore.fetcher.sendTx,
      },
      refreshWallet: () => this.stores.wallets.refreshWallet(transactionDetails.publicDeriver),
    }).promise;

    this.actions.dialogs.closeActiveDialog.trigger();
    this.sendMoneyRequest.reset();
    // go to transaction screen
    this.stores.wallets.goToWalletRoute(transactionDetails.publicDeriver.self);
  };

  @action _onRouteChange: {| route: string, params: ?Object |} => void = (options) => {
    // Reset the send request anytime we visit the send page (e.g: to remove any previous errors)
    if (matchRoute(ROUTES.WALLETS.SEND, buildRoute(options.route, options.params)) !== false) {
      this.sendMoneyRequest.reset();
    }
  };

  // =================== VALIDITY CHECK ==================== //

  isValidMnemonic: {|
    mnemonic: string,
    numberOfWords: number,
  |} => boolean = request => this.api.ada.isValidMnemonic(request);

  isValidPaperMnemonic: {|
    mnemonic: string,
    numberOfWords: number,
  |} => boolean = request => this.api.ada.isValidPaperMnemonic(request);

  // =================== WALLET RESTORATION ==================== //

  _createWallet: {|
    name: string,
    password: string,
  |} => Promise<void> = async (params) => {
    await this.stores.wallets.create(params);
  };
  _restoreWallet: {|
    recoveryPhrase: string,
    walletName: string,
    walletPassword: string,
  |} => Promise<void> = async (params) => {
    await this.stores.wallets.restore(params);
  };

  sendAndRefresh: {|
    broadcastRequest: SignAndBroadcastRequest,
    refreshWallet: () => Promise<void>,
  |} => Promise<SignAndBroadcastResponse> = async (request) => {
    const result = await this.api.ada.signAndBroadcast(request.broadcastRequest);
    try {
      await request.refreshWallet();
    } catch (_e) {
      // even if refreshing the wallet fails, we don't want to fail the tx
      // otherwise user may try and re-send the tx
    }
    return result;
  }
}
