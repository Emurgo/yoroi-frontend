// @flow
import { observable, action, computed, runInAction } from 'mobx';
import { debounce, find, } from 'lodash';
import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import { buildRoute, matchRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import environment from '../../environment';
import config from '../../config';
import globalMessages from '../../i18n/global-messages';
import type { Notification } from '../../types/notificationType';
import type {
  CreateWalletResponse,
  RestoreWalletResponse,
} from '../../api/ada';
import type {
  GetWalletsFunc
} from '../../api/common/index';
import {
  getWallets
} from '../../api/common/index';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetSigningKey,
  asGetPublicKey,
  asGetStakingKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import type {
  IGetLastSyncInfoResponse,
  IGetSigningKey,
  IGetPublic,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { ConceptualWallet } from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import { Logger, stringifyError } from '../../utils/logging';
import { assuranceModes, } from '../../config/transactionAssuranceConfig';
import type { WalletChecksum } from '@emurgo/cip4-js';
import { legacyWalletChecksum } from '@emurgo/cip4-js';
import { createDebugWalletDialog } from '../../containers/wallet/dialogs/DebugWalletDialogContainer';

type GroupedWallets = {|
  publicDerivers: Array<PublicDeriver<>>;
  conceptualWallet: ConceptualWallet;
|};

function groupWallets(
  publicDerivers: Array<PublicDeriver<>>,
): Array<GroupedWallets> {
  const pairingMap = new Map();
  for (const publicDeriver of publicDerivers) {
    // note: this may override previous entries but the result is the same
    const parent = publicDeriver.getParent();
    pairingMap.set(parent, {
      conceptualWallet: parent,
      publicDerivers: [],
    });
  }
  // now fill them with public derivers
  for (const publicDeriver of publicDerivers) {
    const parentEntry = pairingMap.get(publicDeriver.getParent());
    if (parentEntry == null) throw new Error('getPairing public deriver without parent');
    parentEntry.publicDerivers.push(publicDeriver);
  }
  return Array.from(pairingMap.values());
}

export function groupForWallet(
  grouped: Array<GroupedWallets>,
  publicDeriver: PublicDeriver<>,
): void | GroupedWallets {
  for (const conceptualGroup of grouped) {
    for (const pubDeriver of conceptualGroup.publicDerivers) {
      if (pubDeriver === publicDeriver) {
        return conceptualGroup;
      }
    }
  }
  return undefined;
}

export type SigningKeyCache = {|
  publicDeriver: IGetSigningKey,
  // todo: maybe should be a Request instead of just the result data
  signingKeyUpdateDate: null | Date,
|};

export type PublicKeyCache = {|
  publicDeriver: IGetPublic,
  plate: WalletChecksum,
|};

type DeferredCall<T> = (() => Promise<T>) => Promise<T>;

/**
 * The base wallet store that contains the shared logic
 * dealing with wallets / accounts.
 */
export default class WalletStore extends Store {

  WALLET_REFRESH_INTERVAL: number = environment.walletRefreshInterval;
  ON_VISIBLE_DEBOUNCE_WAIT: number = 1000;

  @observable publicDerivers: Array<PublicDeriver<>>;
  @observable selected: null | PublicDeriver<>;
  @observable getInitialWallets: Request<GetWalletsFunc>
    = new Request<GetWalletsFunc>(getWallets);
  @observable createWalletRequest: Request<DeferredCall<CreateWalletResponse>>
    = new Request<DeferredCall<CreateWalletResponse>>(async (create) => {
      const createdWallet = await create();
      if (!createdWallet) throw new Error(`${nameof(this.createWalletRequest)} failed to create wallet`);

      await this._baseAddNewWallet(createdWallet);
      this.stores.walletBackup.teardown();
      return createdWallet;
    });
  @observable restoreRequest: Request<DeferredCall<RestoreWalletResponse>>
    = new Request<DeferredCall<RestoreWalletResponse>>(async (restore) => {
      const restoredWallet = await restore();
      if (!restoredWallet) throw new Error(`${nameof(this.createWalletRequest)} failed to restore wallet`);

      await this._baseAddNewWallet(restoredWallet);
      this.restoreRequest.reset();
      return restoredWallet;
    });
  @observable isImportActive: boolean = false;

  @observable signingKeyCache: Array<SigningKeyCache> = [];
  getSigningKeyCache: IGetSigningKey => SigningKeyCache = (
    publicDeriver
  ) => {
    const foundRequest = find(this.signingKeyCache, { publicDeriver });
    if (foundRequest) return foundRequest;

    throw new Error(`${nameof(WalletStore)}::${nameof(this.getSigningKeyCache)} no signing key in cache`);
  }

  @observable publicKeyCache: Array<PublicKeyCache> = [];
  getPublicKeyCache: IGetPublic => PublicKeyCache = (
    publicDeriver
  ) => {
    const foundRequest = find(this.publicKeyCache, { publicDeriver });
    if (foundRequest) return foundRequest;

    throw new Error(`${nameof(WalletStore)}::${nameof(this.getPublicKeyCache)} no public key in cache`);
  }

  setup(): void {
    super.setup();
    this.publicDerivers = [];
    const { wallets, } = this.actions;
    wallets.unselectWallet.listen(this._unsetActiveWallet);
    wallets.setActiveWallet.listen(this._setActiveWallet);
    setInterval(this._pollRefresh, this.WALLET_REFRESH_INTERVAL);
    // $FlowFixMe built-in types can't handle visibilitychange
    document.addEventListener('visibilitychange', debounce(this._pollRefresh, this.ON_VISIBLE_DEBOUNCE_WAIT));
    this.registerReactions([
      this._updateActiveWalletOnRouteChanges,
      this._showAddWalletPageWhenNoWallets,
    ]);
  }

  @action
  _baseAddNewWallet: RestoreWalletResponse => Promise<void> = async (
    newWallet,
  ) => {
    // set the first created as the result
    const newWithCachedData: Array<PublicDeriver<>> = [];
    for (const newPublicDeriver of newWallet.publicDerivers) {
      const withCache = await this.populateCacheForWallet(newPublicDeriver);
      newWithCachedData.push(withCache);
    }
    this.actions.dialogs.closeActiveDialog.trigger();
    this.goToWalletRoute(newWithCachedData[0]);

    this.showWalletCreatedNotification();

    for (const pubDeriver of newWithCachedData) {
      const lastSyncInfo = await pubDeriver.getLastSyncInfo();
      this.registerObserversForNewWallet({
        publicDeriver: pubDeriver,
        lastSyncInfo
      });
    }
    for (const publicDeriver of newWithCachedData) {
      this._queueWarningIfNeeded(publicDeriver);
    }
    runInAction(() => {
      this.publicDerivers.push(...newWithCachedData);
      this.selected = newWithCachedData[0];
    });
  }

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

  @computed get first(): null | PublicDeriver<> {
    return this.publicDerivers.length === 0
      ? null
      : this.publicDerivers[0];
  }

  @computed get hasAnyPublicDeriver(): boolean {
    return this.publicDerivers.length > 0;
  }

  @computed get activeWalletRoute(): ?string {
    if (this.selected == null) return null;
    return this.getWalletRoute(this.selected);
  }

  @computed get isWalletRoute(): boolean {
    const { currentRoute } = this.stores.app;
    return matchRoute(ROUTES.WALLETS.ROOT + '(/*rest)', currentRoute) !== false;
  }

  getWalletRoute: PublicDeriver<> => string = (
    publicDeriver,
  ) => (
    buildRoute(ROUTES.WALLETS.TRANSACTIONS, {
      id: publicDeriver.getPublicDeriverId(),
    })
  );

  goToWalletRoute: PublicDeriver<> => void = (publicDeriver) => {
    const route = this.getWalletRoute(publicDeriver);
    this.actions.router.goToRoute.trigger({ route });
  }

  refreshWalletFromRemote: PublicDeriver<> => Promise<void> = async (
    publicDeriver
  ) => {
    try {
      const substore = this.stores.substores[environment.API];
      await substore.transactions.refreshTransactionData({
        publicDeriver,
        localRequest: false,
      });
      await substore.addresses.refreshAddressesFromDb(publicDeriver);
    } catch (error) {
      Logger.error(`${nameof(WalletStore)}::${nameof(this.refreshWalletFromRemote)} ` + stringifyError(error));
      throw error;
    }
  };

  refreshWalletFromLocalOnLaunch: PublicDeriver<> => Promise<void> = async (
    publicDeriver
  ) => {
    try {
      const substore = this.stores.substores[environment.API];
      await substore.transactions.refreshTransactionData({
        publicDeriver,
        localRequest: true,
      });
      await substore.transactions.reactToTxHistoryUpdate({ publicDeriver });
      // if after querying local history we find nothing, we just reset the DB entirely
      const txRequests = find(
        substore.transactions.transactionsRequests,
        { publicDeriver }
      );
      if (txRequests == null) throw new Error(`${nameof(this.refreshWalletFromLocalOnLaunch)} should never happen`);
      const { result } = txRequests.requests.allRequest;
      if (result == null) throw new Error(`${nameof(this.refreshWalletFromLocalOnLaunch)} should never happen`);
      if (result.transactions.length === 0) {
        for (const txRequest of Object.keys(txRequests.requests)) {
          txRequests.requests[txRequest].reset();
        }
      }
      await substore.addresses.refreshAddressesFromDb(publicDeriver);
    } catch (error) {
      Logger.error(`${nameof(WalletStore)}::${nameof(this.refreshWalletFromLocalOnLaunch)} ` + stringifyError(error));
      throw error;
    }
  }

  @action
  addHwWallet: PublicDeriver<> => Promise<void> = async (
    publicDeriver: PublicDeriver<>,
  ): Promise<void> => {
    const lastSyncInfo = await publicDeriver.getLastSyncInfo();
    const withCache = await this.populateCacheForWallet(publicDeriver);
    this.goToWalletRoute(withCache);

    this.registerObserversForNewWallet({
      publicDeriver: withCache,
      lastSyncInfo,
    });
    this._queueWarningIfNeeded(withCache);
    runInAction(() => {
      this.publicDerivers.push(withCache);

      this.selected = withCache;
    });
  }

  /** Make all API calls required to setup/update wallet */
  @action restoreWalletsFromStorage: void => Promise<void> = async () => {
    const persistentDb = this.stores.loading.loadPersitentDbRequest.result;
    if (persistentDb == null) {
      throw new Error(`${nameof(this.restoreWalletsFromStorage)} db not loaded. Should never happen`);
    }
    const result = await this.getInitialWallets.execute({
      db: persistentDb,
    }).promise;
    if (result == null || result.length === 0) return;

    const newWithCachedData: Array<PublicDeriver<>> = [];
    for (const newPublicDeriver of result) {
      const withCache = await this.populateCacheForWallet(newPublicDeriver);
      newWithCachedData.push(withCache);
    }
    for (const publicDeriver of newWithCachedData) {
      const lastSyncInfo = await publicDeriver.getLastSyncInfo();
      this.registerObserversForNewWallet({
        publicDeriver,
        lastSyncInfo
      });
    }
    for (const publicDeriver of newWithCachedData) {
      await this.refreshWalletFromLocalOnLaunch(publicDeriver);
    }
    for (const publicDeriver of newWithCachedData) {
      this._queueWarningIfNeeded(publicDeriver);
    }
    runInAction('refresh active wallet', () => {
      if (this.selected == null && newWithCachedData.length === 1) {
        this._setActiveWallet({
          wallet: newWithCachedData[0]
        });
      }
      this.publicDerivers.push(...newWithCachedData);
    });
  };

  @action registerObserversForNewWallet: {|
    publicDeriver: PublicDeriver<>,
    lastSyncInfo: IGetLastSyncInfoResponse,
  |} => void = (
    request
  ) => {
    const stores = this.stores.substores[environment.API];
    stores.addresses.addObservedWallet(request.publicDeriver);
    stores.transactions.addObservedWallet(request);
    stores.time.addObservedTime(request.publicDeriver);
    if (asGetStakingKey(request.publicDeriver) != null) {
      stores.delegation.addObservedWallet(request.publicDeriver);
    }
  };

  // =================== ACTIVE WALLET ==================== //

  @action _setActiveWallet: {| wallet: PublicDeriver<> |} => void = (
    { wallet }
  ) => {
    this.selected = wallet;
    // do not await on purpose since the UI will handle adding loaders while refresh is happening
    this.refreshWalletFromRemote(wallet);
  };

  @action _unsetActiveWallet: void => void = () => {
    this.selected = null;
  };

  // =================== PRIVATE API ==================== //

  @computed get _canRedirectToWallet(): boolean {
    const currentRoute = this.stores.app.currentRoute;
    const isRootRoute = matchRoute(ROUTES.WALLETS.ROOT, currentRoute) !== false;
    return isRootRoute;
  }

  _pollRefresh: void => Promise<void> = async () => {
    // Do not update if screen not active
    // TODO: use visibilityState instead
    if (!document.hidden) {
      const selected = this.selected;
      if (selected) {
        // note: don't need to await since UI will handle this
        this.refreshWalletFromRemote(selected);
      }
    }
  };

  _showAddWalletPageWhenNoWallets: void => void = () => {
    if (this.isWalletRoute && !this.hasAnyWallets) {
      this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
    }
  };

  /* @Attention:
      This method has a really tricky logic because is in charge of some redirection rules
      related to app urls and wallet status. Also, this behaviour is trigger by mobx reactions,
      so it's hard to reason about all the scenarios could happened.
  */
  _updateActiveWalletOnRouteChanges: void => void = () => {
    const currentRoute = this.stores.app.currentRoute;
    const hasAnyPublicDeriver = this.hasAnyPublicDeriver;
    runInAction(`${nameof(WalletStore)}::${nameof(this._updateActiveWalletOnRouteChanges)}`, () => {
      // There are not wallets loaded (yet) -> unset active and return
      if (!hasAnyPublicDeriver) {
        return this._unsetActiveWallet();
      }
      const matchWalletRoute = matchRoute(`${ROUTES.WALLETS.ROOT}/:id(*page)`, currentRoute);
      if (matchWalletRoute !== false) {
        // We have a route for a specific wallet -> lets try to find it
        let publicDeriverForRoute = undefined;
        for (const publicDeriver of this.publicDerivers) {
          if (publicDeriver.getPublicDeriverId().toString() === matchWalletRoute.id) {
            publicDeriverForRoute = publicDeriver;
          }
        }
        if (publicDeriverForRoute != null) {
          // The wallet exists, we are done
          this._setActiveWallet({ wallet: publicDeriverForRoute });
        } else if (hasAnyPublicDeriver) {
          if (this.selected != null) {
            this.goToWalletRoute(this.selected);
          }
        }
      } else if (this._canRedirectToWallet) {
        // The route does not specify any wallet -> pick first wallet
        if (!this.hasActiveWallet && hasAnyPublicDeriver) {
          this._setActiveWallet({ wallet: this.publicDerivers[0] });
        }
        if (this.selected != null) {
          this.goToWalletRoute(this.selected);
        }
      }
    });
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

  // TODO: maybe delete this function and turn it into another "addObservedWallet"
  populateCacheForWallet: PublicDeriver<> => Promise<PublicDeriver<>> = async (
    publicDeriver,
  ) => {
    const withPubKey = asGetPublicKey(publicDeriver);

    if (withPubKey != null) {
      const publicKey = await withPubKey.getPublicKey();
      if (publicKey.IsEncrypted) {
        throw new Error('fromPublicDeriver unexpected encrypted public key');
      }
      runInAction(() => {
        this.publicKeyCache.push({
          publicDeriver: withPubKey,
          plate: legacyWalletChecksum(publicKey.Hash),
        });
      });
    }

    const publicDeriverInfo = await publicDeriver.getFullPublicDeriverInfo();
    const conceptualWalletInfo = await publicDeriver
      .getParent()
      .getFullConceptualWalletInfo();

    {
      const withSigningKey = asGetSigningKey(publicDeriver);
      if (withSigningKey) {
        const key = await withSigningKey.getSigningKey();
        runInAction(() => {
          this.signingKeyCache.push({
            publicDeriver: withSigningKey,
            signingKeyUpdateDate: key.row.PasswordLastUpdate
          });
        });
      }
    }
    runInAction(() => {
      this.stores.substores.ada.walletSettings.publicDeriverSettingsCache.push({
        publicDeriver,
        assuranceMode: assuranceModes.NORMAL,
        publicDeriverName: publicDeriverInfo.Name,
      });
      this.stores.substores.ada.walletSettings.conceptualWalletSettingsCache.push({
        conceptualWallet: publicDeriver.getParent(),
        conceptualWalletName: conceptualWalletInfo.Name,
      });
      this.stores.substores.ada.walletSettings.walletWarnings.push({
        publicDeriver,
        dialogs: [],
      });
    });

    return publicDeriver;
  }

  @action
  _queueWarningIfNeeded: PublicDeriver<> => void = (publicDeriver) => {
    if (environment.isTest()) return;
    if (!environment.isProduction()) return;

    const debugWalletChecksums = [
      'DNKO-8098', 'ATPE-6458', // abandon share
      'ATJK-0805', 'NXTB-2808', // abandon address
      'JSKA-2258', // ledger
      'CZSA-2051', // trezor
      'JEBH-9973', 'ONZO-5595', // mobile debug create
      'SKBE-5478', 'SHHN-6941', // mobile debug restore
    ];
    const withPubKey = asGetPublicKey(publicDeriver);
    if (withPubKey != null) {
      const { plate } = this.getPublicKeyCache(withPubKey);
      if (debugWalletChecksums.find(elem => elem === plate.TextPart) != null) {
        const existingWarnings = this.stores.substores.ada.walletSettings.getWalletWarnings(
          publicDeriver
        );
        existingWarnings.dialogs.push(createDebugWalletDialog(
          plate.TextPart,
          action(() => { existingWarnings.dialogs.pop(); }),
          { stores: this.stores, actions: this.actions },
        ));
      }
    }
  }
}
