// @flow
// import { BigNumber } from 'bignumber.js';
import { observable, action } from 'mobx';

import config from '../../config';
import globalMessages from '../../i18n/global-messages';
import type { Notification } from '../../types/notificationType';
import WalletStore from '../base/WalletStore';
import { matchRoute, buildRoute } from '../../utils/routing';
import {
  Logger,
  stringifyError
} from '../../utils/logging';
import Request from '../lib/LocalizedRequest';
import { ROUTES } from '../../routes-config';
import type { WalletImportFromFileParams } from '../../actions/ada/wallets-actions';
import type {
  SignAndBroadcastFunc, CreateWalletFunc,
  GetWalletsFunc, RestoreWalletFunc,
  GenerateWalletRecoveryPhraseFunc
} from '../../api/ada/index';
import type { DeleteWalletFunc } from '../../api/common';
import type { BaseSignRequest } from '../../api/ada/adaTypes';

export default class AdaWalletsStore extends WalletStore {

  // REQUESTS
  @observable walletsRequest: Request<GetWalletsFunc>
    = new Request<GetWalletsFunc>(this.api.ada.getWallets);

  @observable importFromFileRequest: Request<{} => Promise<{}>>
    = new Request<{} => Promise<{}>>(() => Promise.resolve({}));

  @observable createWalletRequest: Request<CreateWalletFunc>
    = new Request<CreateWalletFunc>(this.api.ada.createWallet.bind(this.api.ada));

  @observable deleteWalletRequestt: Request<DeleteWalletFunc>
    = new Request<DeleteWalletFunc>(() => Promise.resolve(true));

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
    wallets.deleteWallet.listen(this._delete);
    wallets.sendMoney.listen(this._sendMoney);
    wallets.restoreWallet.listen(this._restoreWallet);
    wallets.importWalletFromFile.listen(this._importWalletFromFile);
    wallets.updateBalance.listen(this._updateBalance);
    router.goToRoute.listen(this._onRouteChange);
    walletBackup.finishWalletBackup.listen(this._finishCreation);
  }

  // =================== SEND MONEY ==================== //

  /** Send money and then return to transaction screen */
  _sendMoney = async (transactionDetails: {
    signRequest: BaseSignRequest,
    password: string,
  }) => {
    const wallet = this.active;
    if (!wallet) throw new Error('Active wallet required before sending.');
    const accountId = this.stores.substores.ada.addresses._getAccountIdByWalletId(wallet.id);
    if (!accountId) throw new Error('Active account required before sending.');

    await this.sendMoneyRequest.execute({
      ...transactionDetails,
      sendTx: this.stores.substores.ada.stateFetchStore.fetcher.sendTx,
    })
      .then((response) => {
        const memo = this.stores.substores.ada.transactionBuilderStore.memo;
        if (memo !== '' && memo !== undefined) {
          this.actions.memos.saveTxMemo.trigger({
            memo,
            tx: response.txId,
            lastUpdated: new Date()
          });
        }
        return response;
      })
      .catch(error => {
        Logger.error('AdaWalletsStore::_sendMoney error: ' + stringifyError(error));
        throw new Error('An error has ocurred when saving the transaction memo.');
      });

    this.refreshWalletsData();
    this.actions.dialogs.closeActiveDialog.trigger();
    this.sendMoneyRequest.reset();
    // go to transaction screen
    this.goToWalletRoute(wallet.id);
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

    this.showWalletRestoredNotification();
  };

  // =================== WALLET IMPORTING ==================== //

  // Similar to wallet restoration
  @action _importWalletFromFile = async (params: WalletImportFromFileParams) => {
    this.importFromFileRequest.reset();

    const { filePath, walletName, walletPassword } = params;
    this.importFromFileRequest.execute({
      filePath, walletName, walletPassword,
    });
    // $FlowFixMe fix if we ever implement this
    const importedWallet = await this.importFromFileRequest.promise;

    if (!importedWallet) throw new Error('Imported wallet was not received correctly');
    this.importFromFileRequest.reset();
    await this._patchWalletRequestWithNewWallet(importedWallet);
    this.refreshWalletsData();
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
