// @flow
// import { BigNumber } from 'bignumber.js';
import { observable, action } from 'mobx';

import config from '../../config';
import globalMessages from '../../i18n/global-messages';
import type { Notification } from '../../types/notificationType';
import WalletStore from '../base/WalletStore';
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

export default class AdaWalletsStore extends WalletStore {

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
    const { router, walletBackup, ada } = this.actions;
    const { wallets } = ada;
    wallets.createWallet.listen(this._create);
    wallets.sendMoney.listen(this._sendMoney);
    wallets.restoreWallet.listen(this._restoreWallet);
    wallets.updateBalance.listen(this._updateBalance);
    wallets.updateLastSync.listen(this._updateLastSync);
    router.goToRoute.listen(this._onRouteChange);
    walletBackup.finishWalletBackup.listen(this._finishCreation);
  }

  // =================== SEND MONEY ==================== //

  /** Send money and then return to transaction screen */
  _sendMoney = async (transactionDetails: {|
    signRequest: BaseSignRequest<RustModule.WalletV2.Transaction | RustModule.WalletV3.InputOutput>,
    password: string,
  |}): Promise<void> => {
    const publicDeriver = this.selected;
    if (!publicDeriver) throw new Error('Active wallet required before sending.');

    const withSigning = (asGetSigningKey(publicDeriver.self));
    if (withSigning == null) {
      throw new Error(`${nameof(this._sendMoney)} public deriver missing signing functionality.`);
    }
    await this.sendMoneyRequest.execute({
      broadcastRequest: {
        publicDeriver: withSigning,
        ...transactionDetails,
        sendTx: this.stores.substores.ada.stateFetchStore.fetcher.sendTx,
      },
      refreshWallet: () => this.refreshWallet(publicDeriver),
    }).promise;

    this.actions.dialogs.closeActiveDialog.trigger();
    this.sendMoneyRequest.reset();
    // go to transaction screen
    this.goToWalletRoute(publicDeriver.self);
  };

  @action _onRouteChange = (options: { route: string, params: ?Object }): void => {
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

  _restoreWallet = async (params: {|
    recoveryPhrase: string,
    walletName: string,
    walletPassword: string,
  |}) => {
    await this.restore(params);
  };

  // =================== NOTIFICATION ==================== //
  showLedgerNanoWalletIntegratedNotification: void => void = (): void => {
    const notification: Notification = {
      id: globalMessages.ledgerNanoSWalletIntegratedNotificationMessage.id,
      message: globalMessages.ledgerNanoSWalletIntegratedNotificationMessage,
      duration: config.wallets.WALLET_CREATED_NOTIFICATION_DURATION,
    };
    this.actions.notifications.open.trigger(notification);
  }

  showTrezorTWalletIntegratedNotification: void => void = (): void => {
    const notification: Notification = {
      id: globalMessages.trezorTWalletIntegratedNotificationMessage.id,
      message: globalMessages.trezorTWalletIntegratedNotificationMessage,
      duration: config.wallets.WALLET_CREATED_NOTIFICATION_DURATION,
    };
    this.actions.notifications.open.trigger(notification);
  }

  showWalletCreatedNotification: void => void = (): void => {
    const notification: Notification = {
      id: globalMessages.walletCreatedNotificationMessage.id,
      message: globalMessages.walletCreatedNotificationMessage,
      duration: config.wallets.WALLET_CREATED_NOTIFICATION_DURATION,
    };
    this.actions.notifications.open.trigger(notification);
  }

  showWalletRestoredNotification: void => void = (): void => {
    const notification: Notification = {
      id: globalMessages.walletRestoredNotificationMessage.id,
      message: globalMessages.walletRestoredNotificationMessage,
      duration: config.wallets.WALLET_RESTORED_NOTIFICATION_DURATION,
    };
    this.actions.notifications.open.trigger(notification);
  }

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
