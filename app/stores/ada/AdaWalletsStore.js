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
import type { WalletImportFromFileParams } from '../../actions/ada/wallets-actions';
import type { ImportWalletFromFileResponse } from '../../api/ada/index';
import type {
  CreateTransactionResponse, CreateWalletResponse, DeleteWalletResponse,
  GetWalletsResponse, RestoreWalletResponse,
  GenerateWalletRecoveryPhraseResponse
} from '../../api/common';

export default class AdaWalletsStore extends WalletStore {

  // REQUESTS
  @observable walletsRequest:
    Request<GetWalletsResponse> = new Request(this.api.ada.getWallets);

  @observable importFromFileRequest:
    Request<ImportWalletFromFileResponse> = new Request(() => {});

  @observable createWalletRequest:
    Request<CreateWalletResponse> = new Request(this.api.ada.createWallet);

  @observable deleteWalletRequest:
    Request<DeleteWalletResponse> = new Request(() => {});

  @observable sendMoneyRequest:
    Request<CreateTransactionResponse> = new Request(this.api.ada.createTransaction);

  @observable generateWalletRecoveryPhraseRequest:
    Request<GenerateWalletRecoveryPhraseResponse> = new Request(
      this.api.ada.generateWalletRecoveryPhrase
    );

  @observable restoreRequest:
    Request<RestoreWalletResponse> = new Request(this.api.ada.restoreWallet);

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
    receiver: string,
    amount: string,
    password: ?string,
  }) => {
    const wallet = this.active;
    if (!wallet) throw new Error('Active wallet required before sending.');
    const accountId = this.stores.substores.ada.addresses._getAccountIdByWalletId(wallet.id);
    if (!accountId) throw new Error('Active account required before sending.');

    await this.sendMoneyRequest.execute({
      ...transactionDetails,
      sender: accountId,
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

  isValidAddress = (address: string): Promise<boolean> => this.api.ada.isValidAddress(address);

  isValidMnemonic = (
    mnemonic: string,
    numberOfWords: ?number
  ): boolean => this.api.ada.isValidMnemonic(mnemonic, numberOfWords);

  isValidPaperMnemonic = (
    mnemonic: string,
    numberOfWords: ?number
  ): boolean => this.api.ada.isValidPaperMnemonic(mnemonic, numberOfWords);

  // =================== WALLET RESTORATION ==================== //

  @action _setIsRestoreActive = (active: boolean) => {
    this.isRestoreActive = active;
  };

  @action _restoreWallet = async (params: {
    recoveryPhrase: string,
    walletName: string,
    walletPassword: string,
  }) => {
    this.restoreRequest.reset();
    this._setIsRestoreActive(true);
    // Hide restore wallet dialog some time after restore has been started
    // ...or keep it open in case it has error'd out (so that error message can be shown)
    setTimeout(() => {
      if (!this.restoreRequest.isExecuting) this._setIsRestoreActive(false);
      if (!this.restoreRequest.isError) this._toggleAddWalletDialogOnActiveRestoreOrImport();
    }, this.WAIT_FOR_SERVER_ERROR_TIME);

    const restoredWallet = await this.restoreRequest.execute(params).promise;

    // if the restore wallet call ended with no error, we close the dialog.
    setTimeout(() => {
      this._setIsRestoreActive(false);
      this.actions.dialogs.closeActiveDialog.trigger(); // WalletRestoreDialog
    }, this.MIN_NOTIFICATION_TIME);

    if (!restoredWallet) throw new Error('Restored wallet was not received correctly');
    this.restoreRequest.reset();
    await this._patchWalletRequestWithNewWallet(restoredWallet);
    this.refreshWalletsData();
    // show success notification
    this.showWalletRestoredNotification();
  };

  // =================== WALLET IMPORTING ==================== //

  @action _setIsImportActive = (active: boolean) => {
    this.isImportActive = active;
  };

  // Similar to wallet restoration
  @action _importWalletFromFile = async (params: WalletImportFromFileParams) => {
    this.importFromFileRequest.reset();
    this._setIsImportActive(true);
    // Hide import wallet dialog some time after import has been started
    // ...or keep it open in case it has errored out (so that error message can be shown)
    setTimeout(() => {
      if (!this.importFromFileRequest.isExecuting) this._setIsImportActive(false);
      if (!this.importFromFileRequest.isError) this._toggleAddWalletDialogOnActiveRestoreOrImport();
    }, this.WAIT_FOR_SERVER_ERROR_TIME);

    const { filePath, walletName, walletPassword } = params;
    const importedWallet = await this.importFromFileRequest.execute({
      filePath, walletName, walletPassword,
    }).promise;
    setTimeout(() => {
      this._setIsImportActive(false);
      this.actions.dialogs.closeActiveDialog.trigger();
    }, this.MIN_NOTIFICATION_TIME);
    if (!importedWallet) throw new Error('Imported wallet was not received correctly');
    this.importFromFileRequest.reset();
    await this._patchWalletRequestWithNewWallet(importedWallet);
    this.refreshWalletsData();
  };

  // =================== NOTIFICATION ==================== //
  showTrezorTWalletIntegratedNotification = (): void => {
    const notification: Notification = {
      id: globalMessages.trezorTWalletIntegratedNotificationMessage.id,
      message: globalMessages.trezorTWalletIntegratedNotificationMessage,
      duration: config.wallets.TREZOR_WALLET_INTEGRATED_NOTIFICATION_DURATION,
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

  // =================== PRIVATE API ==================== //

  /** If no wallet was restored, we don't close the dialog (keep the spinner)
   * but if the user pressed the X button we make sure they go to the wallet add screen
   *
   * If a wallet does exist, we just close the dialog
   */
  _toggleAddWalletDialogOnActiveRestoreOrImport = () => {
    if (this.hasLoadedWallets && !this.hasAnyWallets) {
      this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
    } else {
      this.actions.dialogs.closeActiveDialog.trigger();
    }
  };

}
