// @flow
// import { BigNumber } from 'bignumber.js';
import { observable, action, runInAction } from 'mobx';
import WalletStore from '../WalletStore';
import Wallet from '../../domain/Wallet';
import { matchRoute, buildRoute } from '../../utils/routing';
import Request from '.././lib/LocalizedRequest';
import { ROUTES } from '../../routes-config';
import type { WalletImportFromFileParams } from '../../actions/ada/wallets-actions';
import type { ImportWalletFromFileResponse } from '../../api/ada/index';
import type {
  CreateTransactionResponse,
  CreateWalletResponse,
  DeleteWalletResponse,
  GetWalletsResponse,
  RestoreWalletResponse,
  ConnectTrezorResponse,
  GetWalletRecoveryPhraseResponse,
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

  @observable getWalletRecoveryPhraseRequest:
    Request<GetWalletRecoveryPhraseResponse> = new Request(this.api.ada.getWalletRecoveryPhrase);

  @observable restoreRequest:
    Request<RestoreWalletResponse> = new Request(this.api.ada.restoreWallet);

  @observable connectTrezorRequest:
    Request<ConnectTrezorResponse> = new Request(this.api.ada.connectTrezor);

  setup() {
    super.setup();
    const { router, walletBackup, ada } = this.actions;
    const { wallets } = ada;
    wallets.createWallet.listen(this._create);
    wallets.deleteWallet.listen(this._delete);
    wallets.sendMoney.listen(this._sendMoney);
    wallets.restoreWallet.listen(this._restoreWallet);
    wallets.connectTrezor.listen(this._connectTrezor);
    wallets.importWalletFromFile.listen(this._importWalletFromFile);
    wallets.updateBalance.listen(this._updateBalance);
    router.goToRoute.listen(this._onRouteChange);
    walletBackup.finishWalletBackup.listen(this._finishCreation);
  }

  _sendMoney = async (transactionDetails: {
    receiver: string,
    amount: string,
    password: ?string,
  }) => {
    const wallet = this.active;
    if (!wallet) throw new Error('Active wallet required before sending.');
    const accountId = this.stores.ada.addresses._getAccountIdByWalletId(wallet.id);
    if (!accountId) throw new Error('Active account required before sending.');
    await this.sendMoneyRequest.execute({
      ...transactionDetails,
      sender: accountId,
    });
    this.refreshWalletsData();
    this.actions.dialogs.closeActiveDialog.trigger();
    this.sendMoneyRequest.reset();
    this.goToWalletRoute(wallet.id);
  };

  isValidAddress = (address: string) => this.api.ada.isValidAddress(address);

  isValidMnemonic = (
    mnemonic: string,
    numberOfWords: ?number
  ) => this.api.ada.isValidMnemonic(mnemonic, numberOfWords);

  @action refreshWalletsData = async () => {
    const result = await this.walletsRequest.execute().promise;
    if (!result) return;
    runInAction('refresh active wallet', () => {
      if (this.active) {
        this._setActiveWallet({ walletId: this.active.id });
      }
    });
    // FIXME: We need to take care of this as well
    runInAction('refresh address data', () => {
      const walletIds = result.map((wallet: Wallet) => wallet.id);
      this.stores.ada.addresses.addressesRequests = walletIds.map(walletId => ({
        walletId,
        allRequest: this.stores.ada.addresses._getAddressesAllRequest(walletId),
      }));
      this.stores.ada.addresses._refreshAddresses();
    });
    runInAction('refresh transaction data', () => {
      const walletIds = result.map((wallet: Wallet) => wallet.id);
      this.stores.ada.transactions.transactionsRequests = walletIds.map(walletId => ({
        walletId,
        recentRequest: this.stores.ada.transactions._getTransactionsRecentRequest(walletId),
        allRequest: this.stores.ada.transactions._getTransactionsAllRequest(walletId),
        getBalanceRequest: this.stores.ada.transactions._getBalanceRequest(walletId),
        pendingRequest: this.stores.ada.transactions._getTransactionsPendingRequest(walletId),
      }));
      this.stores.ada.transactions._refreshTransactionData();
    });
  };

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
    // ...or keep it open in case it has errored out (so that error message can be shown)
    setTimeout(() => {
      if (!this.restoreRequest.isExecuting) this._setIsRestoreActive(false);
      if (!this.restoreRequest.isError) this._toggleAddWalletDialogOnActiveRestoreOrImport();
    }, this.WAIT_FOR_SERVER_ERROR_TIME);

    const restoredWallet = await this.restoreRequest.execute(params).promise;
    setTimeout(() => {
      this._setIsRestoreActive(false);
      this.actions.dialogs.closeActiveDialog.trigger();
    }, this.MIN_NOTIFICATION_TIME);
    if (!restoredWallet) throw new Error('Restored wallet was not received correctly');
    this.restoreRequest.reset();
    await this._patchWalletRequestWithNewWallet(restoredWallet);
    this.refreshWalletsData();
  };

  @action _setIsConnectTrezorActive = (active: boolean) => {
    this.isConnectTrezorActive = active;
  };

  @action _connectTrezor = async (params: {
    publicMasterKey: string,
    walletName: string,
    deviceFeatures: any,
  }) => {
    this.connectTrezorRequest.reset();
    this._setIsConnectTrezorActive(true);
    // Hide connnet trezor dialog some time after restore has been started
    // FIXME: give better name for _toggleAddWalletDialogOnActiveRestoreOrImport()
    // ...or keep it open in case it has errored out (so that error message can be shown)
    setTimeout(() => {
      if (!this.connectTrezorRequest.isExecuting) this._setIsConnectTrezorActive(false);
      if (!this.connectTrezorRequest.isError) this._toggleAddWalletDialogOnActiveRestoreOrImport();
    }, this.WAIT_FOR_SERVER_ERROR_TIME);

    const connectedWallet = await this.connectTrezorRequest.execute(params).promise;
    setTimeout(() => {
      this._setIsConnectTrezorActive(false);
      this.actions.dialogs.closeActiveDialog.trigger();
    }, this.MIN_NOTIFICATION_TIME);
    if (!connectedWallet) throw new Error('Connected Trezor wallet was not received correctly');
    this.connectTrezorRequest.reset();
    await this._patchWalletRequestWithNewWallet(connectedWallet);
    this.refreshWalletsData();
  };

  @action _setIsImportActive = (active: boolean) => {
    this.isImportActive = active;
  };

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

  @action _setActiveWallet = ({ walletId }: { walletId: string }) => {
    if (this.hasAnyWallets) {
      this.active = this.all.find(wallet => wallet.id === walletId);
    }
  };

  @action _unsetActiveWallet = () => {
    this.active = null;
  };

  @action _onRouteChange = (options: { route: string, params: ?Object }) => {
    // Reset the send request anytime we visit the send page (e.g: to remove any previous errors)
    if (matchRoute(ROUTES.WALLETS.SEND, buildRoute(options.route, options.params))) {
      this.sendMoneyRequest.reset();
    }
  };

  // =================== PRIVATE API ==================== //

  _toggleAddWalletDialogOnActiveRestoreOrImport = () => {
    // Once restore/import is under way we need to either:
    // A) show the 'Add wallet' dialog (in case we don't have any wallets) or
    // B) just close the active dialog and unblock the UI
    if (this.hasLoadedWallets && !this.hasAnyWallets) {
      this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
    } else {
      this.actions.dialogs.closeActiveDialog.trigger();
    }
  };

}
