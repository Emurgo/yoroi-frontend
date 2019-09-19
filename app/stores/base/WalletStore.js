// @flow
import { observable, action, computed, runInAction } from 'mobx';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import Store from './Store';
import Wallet from '../../domain/Wallet';
import Request from '../lib/LocalizedRequest';
import { buildRoute, matchRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import environment from '../../environment';
import { LOVELACES_PER_ADA } from '../../config/numbersConfig';
import type {
  CreateWalletFunc,
  GetWalletsFunc, RestoreWalletFunc,
  GenerateWalletRecoveryPhraseFunc,
} from '../../api/ada';
import type {
  DeleteWalletFunc
} from '../../api/common';
import type { WalletAccount } from '../../domain/Wallet';

/**
 * The base wallet store that contains the shared logic
 * dealing with wallets / accounts.
 */
export default class WalletsStore extends Store {

  WALLET_REFRESH_INTERVAL = environment.walletRefreshInterval;
  ON_VISIBLE_DEBOUNCE_WAIT = 1000;

  @observable active: ?Wallet = null;
  @observable activeAccount: ?WalletAccount = null;
  @observable walletsRequest: Request<GetWalletsFunc>;
  @observable createWalletRequest: Request<CreateWalletFunc>;
  @observable deleteWalletRequest: Request<DeleteWalletFunc>;
  @observable generateWalletRecoveryPhraseRequest: Request<GenerateWalletRecoveryPhraseFunc>;
  @observable restoreRequest: Request<RestoreWalletFunc>;
  @observable isImportActive: boolean = false;

  setup() {
    setInterval(this._pollRefresh, this.WALLET_REFRESH_INTERVAL);
    document.addEventListener('visibilitychange', _.debounce(this._pollRefresh, this.ON_VISIBLE_DEBOUNCE_WAIT));

    this.registerReactions([
      this._updateActiveWalletOnRouteChanges,
      this._showAddWalletPageWhenNoWallets,
    ]);
  }

  _create = async (params: {
    name: string,
    password: string,
  }) => {
    const recoveryPhrase = await (
      this.generateWalletRecoveryPhraseRequest.execute({}).promise
    );
    if (recoveryPhrase != null) {
      this.actions.walletBackup.initiateWalletBackup.trigger({
        recoveryPhrase,
        name: params.name,
        password: params.password,
      });
    }
  };

  /** Create the wallet and go to wallet summary screen */
  _finishCreation = async () => {
    const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
    const wallet = await this.createWalletRequest.execute({
      name: this.stores.walletBackup.name,
      password: this.stores.walletBackup.password,
      mnemonic: this.stores.walletBackup.recoveryPhrase.join(' '),
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
    }).promise;
    if (wallet) {
      await this.walletsRequest.patch(result => { result.push(wallet); });
      this.actions.dialogs.closeActiveDialog.trigger();
      this.goToWalletRoute(wallet.id);
    } else {
      this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
    }
    const { wallets } = this.stores.substores[environment.API];
    wallets.showWalletCreatedNotification();
    this.stores.walletBackup.teardown();
  };

  /** Delete wallet and switch to another existing wallet (if another exists) */
  _delete = async (params: { walletId: string }) => {
    const walletToDelete = this.getWalletById(params.walletId);
    if (!walletToDelete) return;
    const indexOfWalletToDelete = this.all.indexOf(walletToDelete);
    await this.deleteWalletRequest.execute({ walletId: params.walletId });
    // TODO: add back once we support multiple wallets
    // await this.walletsRequest.patch(result => {
    //   result.splice(indexOfWalletToDelete, 1);
    // });
    runInAction('WalletsStore::_delete', () => {
      if (this.hasAnyWallets) {
        const nextIndexInList = Math.max(indexOfWalletToDelete - 1, 0);
        const nextWalletInList = this.all[nextIndexInList];
        this.actions.dialogs.closeActiveDialog.trigger();
        this.goToWalletRoute(nextWalletInList.id);
      } else {
        this.active = null;
        this.activeAccount = null;
        this.actions.router.goToRoute.trigger({ route: ROUTES.NO_WALLETS });
      }
    });
    this.deleteWalletRequest.reset();
    this.refreshWalletsData();
  };

  /** Restore wallet and move to wallet summary screen */
  _restore = async (params: {
    recoveryPhrase: string,
    walletName: string,
    walletPassword: string,
  }) => {
    this.restoreRequest.reset();

    const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
    const restoredWallet = await this.restoreRequest.execute({
      ...params,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
    }).promise;
    if (!restoredWallet) throw new Error('Restored wallet was not received correctly');
    await this._patchWalletRequestWithNewWallet(restoredWallet);
    this.actions.dialogs.closeActiveDialog.trigger();
    this.restoreRequest.reset();
    this.goToWalletRoute(restoredWallet.id);
    this.refreshWalletsData();
  };

  // =================== PUBLIC API ==================== //

  // GETTERS

  @computed get hasActiveWallet(): boolean {
    return !!this.active;
  }

  @computed get hasLoadedWallets(): boolean {
    return this.walletsRequest.wasExecuted;
  }

  @computed get hasAnyWallets(): boolean {
    if (this.walletsRequest.result == null) return false;
    return this.walletsRequest.wasExecuted && this.walletsRequest.result.length > 0;
  }

  @computed get all(): Array<Wallet> {
    return this.walletsRequest.result ? this.walletsRequest.result : [];
  }

  @computed get first(): ?Wallet {
    return this.all.length > 0 ? this.all[0] : null;
  }

  @computed get hasAnyLoaded(): boolean {
    return this.all.length > 0;
  }

  @computed get activeWalletRoute(): ?string {
    if (!this.active) return null;
    return this.getWalletRoute(this.active.id);
  }

  @computed get isWalletRoute(): boolean {
    const { currentRoute } = this.stores.app;
    return matchRoute(ROUTES.WALLETS.ROOT + '(/*rest)', currentRoute);
  }

  getWalletById = (id: string): (?Wallet) => this.all.find(w => w.id === id);

  getWalletByName = (name: string): (?Wallet) => this.all.find(w => w.name === name);

  getWalletRoute = (walletId: string, page: string = 'transactions'): string => (
    buildRoute(ROUTES.WALLETS.PAGE, { id: walletId, page })
  );

  goToWalletRoute(walletId: string) {
    const route = this.getWalletRoute(walletId);
    this.actions.router.goToRoute.trigger({ route });
  }

  // ACTIONS

  @action.bound _updateBalance(balance: BigNumber): void {
    if (this.active) {
      this.active.updateAmount(balance.dividedBy(
        LOVELACES_PER_ADA
      ));
    }
  }

  /** Make all API calls required to setup/update wallet */
  @action refreshWalletsData = async () => {
    const result = await this.walletsRequest.execute({}).promise;
    if (!result) return;
    runInAction('refresh active wallet', () => {
      if (this.active) {
        this._setActiveWallet({ walletId: this.active.id });
      }
    });
    const walletIds = result.map((wallet: Wallet) => wallet.id);
    this.stores.substores[environment.API].addresses.updateObservedWallets(walletIds);
    this.stores.substores[environment.API].transactions.updateObservedWallets(walletIds);
  };

  /** Make all API calls required to setup imported wallet */
  @action refreshImportedWalletData = async () => {
    if (this.hasAnyLoaded) this._setActiveWallet({ walletId: this.all[0].id });
    return await this.refreshWalletsData();
  };

  // =================== ACTIVE WALLET ==================== //

  @action _setActiveWallet = (
    { walletId }: { walletId: string }
  ): void => {
    if (this.hasAnyWallets) {
      const newActiveWallet: ?Wallet = this.all.find(wallet => wallet.id === walletId);
      this.active = newActiveWallet;
      // Set first account as default current when wallet is changed
      this.activeAccount = newActiveWallet &&
        newActiveWallet.accounts &&
        newActiveWallet.accounts[0];
    }
  };

  @action _unsetActiveWallet = (): void => {
    this.active = null;
    this.activeAccount = null;
  };

  // =================== PRIVATE API ==================== //

  @computed get _canRedirectToWallet(): boolean {
    const currentRoute = this.stores.app.currentRoute;
    const isRootRoute = matchRoute(ROUTES.WALLETS.ROOT, currentRoute);
    const isNoWalletsRoute = matchRoute(ROUTES.NO_WALLETS, currentRoute);
    return isRootRoute || isNoWalletsRoute;
  }

  _patchWalletRequestWithNewWallet = async (wallet: Wallet) => {
    // Only add the new wallet if it does not exist yet in the result!
    await this.walletsRequest.patch(result => {
      if (!_.find(result, { id: wallet.id })) result.push(wallet);
    });
  };

  _pollRefresh = async (): Promise<void> => {
    // Do not update if screen not active
    if (!document.hidden) {
      return await this.refreshWalletsData();
    }
  };

  _showAddWalletPageWhenNoWallets = () => {
    if (this.isWalletRoute && !this.hasAnyWallets) {
      this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
    }
  };

  /* @Attention:
      This method has a really tricky logic because is in charge of some redirection rules
      related to app urls and wallet status. Also, this behaviour is trigger by mobx reactions,
      so it's hard to reason about all the scenarios could happend.
  */
  _updateActiveWalletOnRouteChanges = () => {
    const currentRoute = this.stores.app.currentRoute;
    const hasAnyWalletLoaded = this.hasAnyLoaded;
    runInAction('WalletsStore::_updateActiveWalletOnRouteChanges', () => {
      // There are not wallets loaded (yet) -> unset active and return
      if (!hasAnyWalletLoaded) {
        return this._unsetActiveWallet();
      }
      const matchWalletRoute = matchRoute(`${ROUTES.WALLETS.ROOT}/:id(*page)`, currentRoute);
      if (matchWalletRoute) {
        // We have a route for a specific wallet -> lets try to find it
        const walletForCurrentRoute = this.all.find(w => w.id === matchWalletRoute.id);
        if (walletForCurrentRoute) {
          // The wallet exists, we are done
          this._setActiveWallet({ walletId: walletForCurrentRoute.id });
        } else if (hasAnyWalletLoaded) {
          // There is no wallet with given id -> pick first wallet
          this._setActiveWallet({ walletId: this.all[0].id });
          if (this.active) this.goToWalletRoute(this.active.id);
        }
      } else if (this._canRedirectToWallet) {
        // The route does not specify any wallet -> pick first wallet
        if (!this.hasActiveWallet && hasAnyWalletLoaded) {
          this._setActiveWallet({ walletId: this.all[0].id });
        }
        if (this.active) {
          this.goToWalletRoute(this.active.id);
        }
      }
    });
  };

}
