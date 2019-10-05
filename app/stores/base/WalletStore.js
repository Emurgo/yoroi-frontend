// @flow
import { observable, action, computed, runInAction } from 'mobx';
import BigNumber from 'bignumber.js';
import { debounce, } from 'lodash';
import Store from './Store';
import Request from '../lib/LocalizedRequest';
import { buildRoute, matchRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import environment from '../../environment';
import type {
  CreateWalletFunc,
  GetWalletsFunc, RestoreWalletFunc,
  GenerateWalletRecoveryPhraseFunc,
  RestoreWalletResponse,
} from '../../api/ada';
import {
  PublicDeriver,
  asGetPublicKey,
  asGetSigningKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { ConceptualWallet } from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import type { WalletAccountNumberPlate } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { createAccountPlate } from '../../api/ada/lib/cardanoCrypto/cryptoWallet';
import { LOVELACES_PER_ADA } from '../../config/numbersConfig';
import type { AssuranceMode, } from '../../types/transactionAssuranceTypes';
import { assuranceModes, } from '../../config/transactionAssuranceConfig';

type GroupedWallets = {|
  publicDerivers: Array<PublicDeriverWithCachedMeta>;
  conceptualWallet: ConceptualWallet;
|};

function groupWallets(
  publicDerivers: Array<PublicDeriverWithCachedMeta>,
): Array<GroupedWallets> {
  const pairingMap = new Map();
  for (const publicDeriver of publicDerivers) {
    // note: this may override previous entries but the result is the same
    const parent = publicDeriver.self.getConceptualWallet();
    pairingMap.set(parent, {
      conceptualWallet: parent,
      publicDerivers: [],
    });
  }
  // now fill them with public derivers
  for (const publicDeriver of publicDerivers) {
    const parentEntry = pairingMap.get(publicDeriver.self.getConceptualWallet());
    if (parentEntry == null) throw new Error('getPairing public deriver without parent');
    parentEntry.publicDerivers.push(publicDeriver);
  }
  return Array.from(pairingMap.values());
}

// TODO: should be made into a Domain class
export type PublicDeriverWithCachedMeta = {|
  self: PublicDeriver,
  // no plate if no public key
  plate: null | WalletAccountNumberPlate,
  publicDeriverName: string,
  conceptualWalletName: string,
  amount: BigNumber,
  assuranceMode: AssuranceMode,
  signingKeyUpdateDate: null | Date,
|};

/**
 * The base wallet store that contains the shared logic
 * dealing with wallets / accounts.
 */
export default class WalletsStore extends Store {

  WALLET_REFRESH_INTERVAL = environment.walletRefreshInterval;
  ON_VISIBLE_DEBOUNCE_WAIT = 1000;

  @observable publicDerivers: Array<PublicDeriverWithCachedMeta>;
  @observable selected: null | PublicDeriverWithCachedMeta;
  @observable getInitialWallets: Request<GetWalletsFunc>;
  @observable createWalletRequest: Request<CreateWalletFunc>;
  @observable generateWalletRecoveryPhraseRequest: Request<GenerateWalletRecoveryPhraseFunc>;
  @observable restoreRequest: Request<RestoreWalletFunc>;
  @observable isImportActive: boolean = false;

  setup() {
    this.publicDerivers = [];
    setInterval(this._pollRefresh, this.WALLET_REFRESH_INTERVAL);
    document.addEventListener('visibilitychange', debounce(this._pollRefresh, this.ON_VISIBLE_DEBOUNCE_WAIT));

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

  _addCachedData = async (
    publicDeriver: PublicDeriver,
  ): Promise<PublicDeriverWithCachedMeta> => {
    const withPubKey = asGetPublicKey(publicDeriver);

    let plate = null;
    if (withPubKey != null) {
      const publicKey = await withPubKey.getPublicKey();
      if (publicKey.IsEncrypted) {
        throw new Error('_addCachedData unexpected encrypted public key');
      }
      plate = createAccountPlate(publicKey.Hash);
    }

    const publicDeriverInfo = await publicDeriver.getFullPublicDeriverInfo();
    const conceptualWalletInfo = await publicDeriver
      .getConceptualWallet()
      .getFullConceptualWalletInfo();

    let signingKeyUpdateDate = null;
    {
      const withSigningKey = asGetSigningKey(publicDeriver);
      if (withSigningKey) {
        const key = await withSigningKey.getSigningKey();
        signingKeyUpdateDate = key.row.PasswordLastUpdate;
      }
    }
    return {
      self: publicDeriver,
      plate,
      publicDeriverName: publicDeriverInfo.Name,
      conceptualWalletName: conceptualWalletInfo.Name,
      amount: new BigNumber(0), // assume 0 for now. Updated later if necessary
      assuranceMode: assuranceModes.NORMAL,
      signingKeyUpdateDate,
    };
  }

  @action
  _baseAddNewWallet = async (
    newWallet: RestoreWalletResponse,
  ): Promise<void> => {
    // set the first created as the result
    const newWithCachedData: Array<PublicDeriverWithCachedMeta> = [];
    for (const newPublicDeriver of newWallet.publicDerivers) {
      const withCache = await this._addCachedData(newPublicDeriver);
      newWithCachedData.push(withCache);
    }
    this.publicDerivers.push(...newWithCachedData);

    this.selected = newWithCachedData[0];
    this.actions.dialogs.closeActiveDialog.trigger();
    this.goToWalletRoute(newWithCachedData[0].self);

    const { wallets } = this.stores.substores[environment.API];
    wallets.showWalletCreatedNotification();

    for (const pubDeriver of newWithCachedData) {
      this.registerObserversForNewWallet(pubDeriver);
    }
  }

  /** Create the wallet and go to wallet summary screen */
  _finishCreation = async () => {
    const persistentDb = this.stores.loading.loadPersitentDbRequest.result;
    if (persistentDb == null) {
      throw new Error('_finishCreation db not loaded. Should never happen');
    }
    const createdWallet = await this.createWalletRequest.execute({
      db: persistentDb,
      walletName: this.stores.walletBackup.name,
      walletPassword: this.stores.walletBackup.password,
      recoveryPhrase: this.stores.walletBackup.recoveryPhrase.join(' '),
    }).promise;
    if (!createdWallet) throw new Error('_finishCreation should never happen');

    await this._baseAddNewWallet(createdWallet);

    this.stores.walletBackup.teardown();
  };

  /** Restore wallet and move to wallet summary screen */
  _restore = async (params: {
    recoveryPhrase: string,
    walletName: string,
    walletPassword: string,
  }) => {
    this.restoreRequest.reset();

    const persistentDb = this.stores.loading.loadPersitentDbRequest.result;
    if (persistentDb == null) {
      throw new Error('_finishCreation db not loaded. Should never happen');
    }
    const createdWallet = await this.restoreRequest.execute({
      db: persistentDb,
      ...params,
    }).promise;
    if (!createdWallet) throw new Error('Restored wallet was not received correctly');

    await this._baseAddNewWallet(createdWallet);

    this.restoreRequest.reset();
  };

  // =================== PUBLIC API ==================== //

  // GETTERS

  @computed get hasActiveWallet(): boolean {
    return this.selected != null;
  }

  @computed get hasLoadedWallets(): boolean {
    return this.getInitialWallets.wasExecuted;
  }

  @computed get hasAnyWallets(): boolean {
    if (!this.hasLoadedWallets) return false;
    if (this.publicDerivers.length === 0) return false;
    return this.publicDerivers.length > 0;
  }

  @computed get grouped(): Array<GroupedWallets> {
    return groupWallets(
      this.publicDerivers,
    );
  }

  @computed get first(): null | PublicDeriverWithCachedMeta {
    return this.publicDerivers.length === 0
      ? null
      : this.publicDerivers[0];
  }

  @computed get hasAnyPublicDeriver(): boolean {
    return this.publicDerivers.length > 0;
  }

  @computed get activeWalletRoute(): ?string {
    if (this.selected == null) return null;
    return this.getWalletRoute(this.selected.self);
  }

  @computed get isWalletRoute(): boolean {
    const { currentRoute } = this.stores.app;
    return matchRoute(ROUTES.WALLETS.ROOT + '(/*rest)', currentRoute);
  }

  getWalletRoute = (
    publicDeriver: PublicDeriver,
    page: string = 'transactions'
  ): string => (
    buildRoute(ROUTES.WALLETS.PAGE, { id: publicDeriver.getPublicDeriverId(), page })
  );

  goToWalletRoute(publicDeriver: PublicDeriver) {
    const route = this.getWalletRoute(publicDeriver);
    this.actions.router.goToRoute.trigger({ route });
  }

  refreshWallet(
    publicDeriver: PublicDeriverWithCachedMeta
  ): void {
    this.stores.substores[environment.API].addresses.addObservedWallet(publicDeriver);
    this.stores.substores[environment.API].transactions.addObservedWallet(publicDeriver);
  }

  @action
  addHwWallet = async (
    publicDeriver: PublicDeriver,
  ): Promise<void> => {
    const withCache = await this._addCachedData(publicDeriver);
    // set the first created as the result
    this.publicDerivers.push(withCache);

    this.selected = withCache;
    this.goToWalletRoute(withCache.self);

    this.registerObserversForNewWallet(withCache);
  }

  // ACTIONS

  @action.bound _updateBalance(balance: BigNumber): void {
    const selected = this.selected;
    if (selected != null) {
      selected.amount = balance.dividedBy(
        LOVELACES_PER_ADA
      );
    }
  }

  /** Make all API calls required to setup/update wallet */
  @action restoreWalletsFromStorage = async (): Promise<void> => {
    // TODO
    // const result = await this.walletsRequest.execute({}).promise;
    const result: Array<PublicDeriverWithCachedMeta> = [];
    if (!result) return;
    runInAction('refresh active wallet', () => {
      if (this.selected != null) {
        this._setActiveWallet({
          wallet: this.selected
        });
      }
    });
    for (const publicDeriver of result) {
      this.stores.substores[environment.API].addresses.addObservedWallet(publicDeriver);
      this.stores.substores[environment.API].transactions.addObservedWallet(publicDeriver);
    }
  };

  @action registerObserversForNewWallet = async (
    publicDeriver: PublicDeriverWithCachedMeta
  ) => {
    this.stores.substores[environment.API].addresses.addObservedWallet(publicDeriver);
    this.stores.substores[environment.API].transactions.addObservedWallet(publicDeriver);
  };

  /** Make all API calls required to setup imported wallet */
  @action refreshImportedWalletData = async () => {
    if (this.hasAnyPublicDeriver) this._setActiveWallet({ wallet: this.publicDerivers[0] });
    return await this.restoreWalletsFromStorage();
  };

  // =================== ACTIVE WALLET ==================== //

  @action _setActiveWallet = (
    { wallet }: { wallet: PublicDeriverWithCachedMeta }
  ): void => {
    this.selected = wallet;
  };

  @action _unsetActiveWallet = (): void => {
    this.selected = null;
  };

  // =================== PRIVATE API ==================== //

  @computed get _canRedirectToWallet(): boolean {
    const currentRoute = this.stores.app.currentRoute;
    const isRootRoute = matchRoute(ROUTES.WALLETS.ROOT, currentRoute);
    const isNoWalletsRoute = matchRoute(ROUTES.NO_WALLETS, currentRoute);
    return isRootRoute || isNoWalletsRoute;
  }

  _pollRefresh = async (): Promise<void> => {
    // Do not update if screen not active
    if (!document.hidden) {
      const selected = this.selected;
      if (selected) {
        this.refreshWallet(selected);
      }
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
    const hasAnyPublicDeriver = this.hasAnyPublicDeriver;
    runInAction('WalletsStore::_updateActiveWalletOnRouteChanges', () => {
      // There are not wallets loaded (yet) -> unset active and return
      if (!hasAnyPublicDeriver) {
        return this._unsetActiveWallet();
      }
      const matchWalletRoute = matchRoute(`${ROUTES.WALLETS.ROOT}/:id(*page)`, currentRoute);
      if (matchWalletRoute) {
        // We have a route for a specific wallet -> lets try to find it
        let publicDeriverForRoute = undefined;
        for (const publicDeriver of this.publicDerivers) {
          if (publicDeriver.self.getPublicDeriverId().toString() === matchWalletRoute) {
            publicDeriverForRoute = publicDeriver;
          }
        }
        if (publicDeriverForRoute != null) {
          // The wallet exists, we are done
          this._setActiveWallet({ wallet: publicDeriverForRoute });
        } else if (hasAnyPublicDeriver) {
          // There is no wallet with given id -> pick first wallet
          this._setActiveWallet({ wallet: this.publicDerivers[0] });
          if (this.selected != null) {
            this.goToWalletRoute(this.selected.self);
          }
        }
      } else if (this._canRedirectToWallet) {
        // The route does not specify any wallet -> pick first wallet
        if (!this.hasActiveWallet && hasAnyPublicDeriver) {
          this._setActiveWallet({ wallet: this.publicDerivers[0] });
        }
        if (this.selected != null) {
          this.goToWalletRoute(this.selected.self);
        }
      }
    });
  };

}
