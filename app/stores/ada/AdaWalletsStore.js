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
  SignAndBroadcastFunc, CreateWalletFunc,
  GetWalletsFunc, RestoreWalletFunc,
  GenerateWalletRecoveryPhraseFunc
} from '../../api/ada/index';
import type { BaseSignRequest } from '../../api/ada/adaTypes';
import {
  asGetSigningKey, asBip44Parent,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';

export default class AdaWalletsStore extends WalletStore {

  // REQUESTS
  @observable walletsRequest: Request<GetWalletsFunc>
    = new Request<GetWalletsFunc>(this.api.ada.getWallets);

  @observable createWalletRequest: Request<CreateWalletFunc>
    = new Request<CreateWalletFunc>(this.api.ada.createWallet.bind(this.api.ada));

  @observable sendMoneyRequest: Request<SignAndBroadcastFunc>
    = new Request<SignAndBroadcastFunc>(this.api.ada.signAndBroadcast);

  @observable generateWalletRecoveryPhraseRequest: Request<GenerateWalletRecoveryPhraseFunc>
    = new Request<GenerateWalletRecoveryPhraseFunc>(this.api.ada.generateWalletRecoveryPhrase);

  @observable restoreRequest: Request<RestoreWalletFunc>
    = new Request<RestoreWalletFunc>(this.api.ada.restoreWallet);

  setup() {
    super.setup();
    const { router, walletBackup, ada } = this.actions;
    const { wallets } = ada;
    wallets.createWallet.listen(this._create);
    wallets.sendMoney.listen(this._sendMoney);
    wallets.restoreWallet.listen(this._restoreWallet);
    router.goToRoute.listen(this._onRouteChange);
    walletBackup.finishWalletBackup.listen(this._finishCreation);
  }

  // =================== SEND MONEY ==================== //

  /** Send money and then return to transaction screen */
  _sendMoney = async (transactionDetails: {
    signRequest: BaseSignRequest,
    password: string,
  }): Promise<void> => {
    const publicDeriver = this.selected;
    if (!publicDeriver) throw new Error('Active wallet required before sending.');

    const asBip44 = (asBip44Parent(publicDeriver.self));
    if (asBip44 == null) {
      throw new Error('_sendMoney public deriver missing bip44 functionality.');
    }
    const withSigning = (asGetSigningKey(publicDeriver.self));
    if (withSigning == null) {
      throw new Error('_sendMoney public deriver missing signing functionality.');
    }
    await this.sendMoneyRequest.execute({
      publicDeriver: withSigning,
      ...transactionDetails,
      sendTx: this.stores.substores.ada.stateFetchStore.fetcher.sendTx,
    });

    await this.refreshWallet(publicDeriver);
    this.actions.dialogs.closeActiveDialog.trigger();
    this.sendMoneyRequest.reset();
    // go to transaction screen
    this.goToWalletRoute(publicDeriver.self);
  };

  @action _onRouteChange = (options: { route: string, params: ?Object }): void => {
    // Reset the send request anytime we visit the send page (e.g: to remove any previous errors)
    if (matchRoute(ROUTES.WALLETS.SEND, buildRoute(options.route, options.params))) {
      this.sendMoneyRequest.reset();
    }
  };

  // =================== VALIDITY CHECK ==================== //

  isValidAddress = (address: string): Promise<boolean> => this.api.ada.isValidAddress({ address });

  isValidMnemonic = (
    mnemonic: string,
    numberOfWords: ?number
  ): boolean => this.api.ada.isValidMnemonic({ mnemonic, numberOfWords });

  isValidPaperMnemonic = (
    mnemonic: string,
    numberOfWords: ?number
  ): boolean => this.api.ada.isValidPaperMnemonic({ mnemonic, numberOfWords });

  // =================== WALLET RESTORATION ==================== //

  _restoreWallet = async (params: {
    recoveryPhrase: string,
    walletName: string,
    walletPassword: string,
  }) => {
    await this._restore(params);
  };

  // =================== NOTIFICATION ==================== //
  showLedgerNanoSWalletIntegratedNotification = (): void => {
    const notification: Notification = {
      id: globalMessages.ledgerNanoSWalletIntegratedNotificationMessage.id,
      message: globalMessages.ledgerNanoSWalletIntegratedNotificationMessage,
      duration: config.wallets.WALLET_CREATED_NOTIFICATION_DURATION,
    };
    this.actions.notifications.open.trigger(notification);
  }

  showTrezorTWalletIntegratedNotification = (): void => {
    const notification: Notification = {
      id: globalMessages.trezorTWalletIntegratedNotificationMessage.id,
      message: globalMessages.trezorTWalletIntegratedNotificationMessage,
      duration: config.wallets.WALLET_CREATED_NOTIFICATION_DURATION,
    };
    this.actions.notifications.open.trigger(notification);
  }

  showWalletCreatedNotification = (): void => {
    const notification: Notification = {
      id: globalMessages.walletCreatedNotificationMessage.id,
      message: globalMessages.walletCreatedNotificationMessage,
      duration: config.wallets.WALLET_CREATED_NOTIFICATION_DURATION,
    };
    this.actions.notifications.open.trigger(notification);
  }

  showWalletRestoredNotification = (): void => {
    const notification: Notification = {
      id: globalMessages.walletRestoredNotificationMessage.id,
      message: globalMessages.walletRestoredNotificationMessage,
      duration: config.wallets.WALLET_RESTORED_NOTIFICATION_DURATION,
    };
    this.actions.notifications.open.trigger(notification);
  }
}
