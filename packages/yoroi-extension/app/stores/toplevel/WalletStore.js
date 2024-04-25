// @flow
import { action, computed, observable, runInAction } from 'mobx';
import { debounce, find } from 'lodash';
import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import { matchRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import environment from '../../environment';
import config from '../../config';
import globalMessages from '../../i18n/global-messages';
import type { Notification } from '../../types/notification.types';
import type { GetWalletsFunc } from '../../api/common/index';
import { getWallets } from '../../api/common/index';
import type { CreateWalletResponse, RestoreWalletResponse } from '../../api/common/types';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetPublicKey,
  asGetSigningKey,
  asGetStakingKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import type {
  IGetLastSyncInfoResponse,
  IGetPublic,
  IGetSigningKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { ConceptualWallet } from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import { Logger, stringifyError } from '../../utils/logging';
import { assuranceModes } from '../../config/transactionAssuranceConfig';
import type { WalletChecksum } from '@emurgo/cip4-js';
import { createDebugWalletDialog } from '../../containers/wallet/dialogs/DebugWalletDialogContainer';
import { createProblematicWalletDialog } from '../../containers/wallet/dialogs/ProblematicWalletDialogContainer';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import { getCurrentWalletFromLS, updateSyncedWallets } from '../../utils/localStorage';
import { getWalletChecksum } from '../../api/export/utils';

type GroupedWallets = {|
  publicDerivers: Array<PublicDeriver<>>,
  conceptualWallet: ConceptualWallet,
|};

function groupWallets(publicDerivers: Array<PublicDeriver<>>): Array<GroupedWallets> {
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
  publicDeriver: PublicDeriver<>
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
  publicKey: string,
|};

export type SendMoneyRequest = Request<DeferredCall<{| txId: string |}>>;

/**
 * The base wallet store that contains the shared logic
 * dealing with wallets / accounts.
 */
export default class WalletStore extends Store<StoresMap, ActionsMap> {
  WALLET_REFRESH_INTERVAL: number = environment.getWalletRefreshInterval();
  ON_VISIBLE_DEBOUNCE_WAIT: number = 1000;

  @observable firstSyncWalletId: ?number;
  @observable publicDerivers: Array<PublicDeriver<>>;
  @observable selected: null | PublicDeriver<>;
  @observable getInitialWallets: Request<GetWalletsFunc> = new Request<GetWalletsFunc>(getWallets);

  @observable createWalletRequest: Request<DeferredCall<CreateWalletResponse>> = new Request<
    DeferredCall<CreateWalletResponse>
  >(async create => {
    const createdWallet = await create();
    if (!createdWallet)
      throw new Error(`${nameof(this.createWalletRequest)} failed to create wallet`);

    await this._baseAddNewWallet(createdWallet);
    this.stores.walletBackup.teardown();
    return createdWallet;
  });
  @observable restoreRequest: Request<DeferredCall<RestoreWalletResponse>> = new Request<
    DeferredCall<RestoreWalletResponse>
  >(async restore => {
    const restoredWallet = await restore();
    if (!restoredWallet)
      throw new Error(`${nameof(this.createWalletRequest)} failed to restore wallet`);

    await this._baseAddNewWallet(restoredWallet);
    this.restoreRequest.reset();
    return restoredWallet;
  });
  @observable isImportActive: boolean = false;

  @observable sendMoneyRequest: SendMoneyRequest = new Request<
    DeferredCall<{| txId: string |}>
  >(request => request());

  @observable signingKeyCache: Array<SigningKeyCache> = [];
  getSigningKeyCache: IGetSigningKey => SigningKeyCache = publicDeriver => {
    const foundRequest = find(this.signingKeyCache, { publicDeriver });
    if (foundRequest) return foundRequest;

    throw new Error(
      `${nameof(WalletStore)}::${nameof(this.getSigningKeyCache)} no signing key in cache`
    );
  };

  @observable publicKeyCache: Array<PublicKeyCache> = [];
  getPublicKeyCache: IGetPublic => PublicKeyCache = publicDeriver => {
    const foundRequest = find(this.publicKeyCache, { publicDeriver });
    if (foundRequest) return foundRequest;

    throw new Error(
      `${nameof(WalletStore)}::${nameof(this.getPublicKeyCache)} no public key in cache`
    );
  };

  setup(): void {
    super.setup();
    this.publicDerivers = [];
    const { wallets } = this.actions;
    wallets.unselectWallet.listen(this._unsetActiveWallet);
    wallets.setActiveWallet.listen(this._setActiveWallet);
    setInterval(this._pollRefresh, this.WALLET_REFRESH_INTERVAL);
    document.addEventListener(
      'visibilitychange',
      debounce(_e => this._pollRefresh(), this.ON_VISIBLE_DEBOUNCE_WAIT)
    );
  }

  @action
  _baseAddNewWallet: RestoreWalletResponse => Promise<void> = async newWallet => {
    // set the first created as the result
    const newWithCachedData: Array<PublicDeriver<>> = [];
    for (const newPublicDeriver of newWallet.publicDerivers) {
      const withCache = await this.populateCacheForWallet(newPublicDeriver);
      newWithCachedData.push(withCache);
    }

    this.showWalletCreatedNotification();

    for (const pubDeriver of newWithCachedData) {
      const lastSyncInfo = await pubDeriver.getLastSyncInfo();
      this.registerObserversForNewWallet({
        publicDeriver: pubDeriver,
        lastSyncInfo,
      });
    }
    for (const publicDeriver of newWithCachedData) {
      this._queueWarningIfNeeded(publicDeriver);
    }
    runInAction(() => {
      this.publicDerivers.push(...newWithCachedData);
      this._setActiveWallet({
        wallet: newWithCachedData[0],
      });
      this.actions.dialogs.closeActiveDialog.trigger();
      this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ROOT });
      for (const publicDeriver of newWithCachedData) {
        this._startParallelRefreshForWallet(publicDeriver);
      }
    });
  };

  // =================== PUBLIC API ==================== //

  // GETTERS

  @computed get hasActiveWallet(): boolean {
    return this.selected != null;
  }

  @computed get selectedOrFail(): PublicDeriver<> {
    if (this.selected == null) {
      throw new Error('A selected wallet is required!');
    }
    return this.selected;
  }

  @computed get activeWalletPlate(): ?WalletChecksum {
    const selectedPublicDeriverId = this.selected?.publicDeriverId;
    if (selectedPublicDeriverId != null) {
      const selectedCache: ?PublicKeyCache = this.publicKeyCache
        // $FlowFixMe[prop-missing]
        .find(c => c.publicDeriver.publicDeriverId === selectedPublicDeriverId);
      return selectedCache == null ? null : selectedCache.plate;
    }
    return null;
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
    return groupWallets(this.publicDerivers);
  }

  refreshWalletFromRemote: (PublicDeriver<>) => Promise<void> = async publicDeriver => {
    try {
      const wallet = await getCurrentWalletFromLS(publicDeriver);
      if (!wallet || !wallet.isSynced) {
        runInAction(() => {
          this.firstSyncWalletId = publicDeriver.getPublicDeriverId();
        });
      }

      await this.stores.transactions.refreshTransactionData({
        publicDeriver,
        isLocalRequest: false,
      });
      await this.stores.addresses.refreshAddressesFromDb(publicDeriver);
      await updateSyncedWallets(publicDeriver);

      if (typeof this.firstSyncWalletId === 'number') {
        runInAction(() => {
          this.firstSyncWalletId = null;
        });
      }
    } catch (error) {
      Logger.error(
        `${nameof(WalletStore)}::${nameof(this.refreshWalletFromRemote)} ` + stringifyError(error)
      );
      throw error;
    }
  };

  refreshWalletFromLocalOnLaunch: (PublicDeriver<>) => Promise<void> = async publicDeriver => {
    try {
      await this.stores.transactions.refreshTransactionData({
        publicDeriver,
        isLocalRequest: true,
      });
      await this.stores.addresses.refreshAddressesFromDb(publicDeriver);
    } catch (error) {
      Logger.error(
        `${nameof(WalletStore)}::${nameof(this.refreshWalletFromLocalOnLaunch)} ` +
          stringifyError(error)
      );
      throw error;
    }
  };

  @action
  addHwWallet: (PublicDeriver<>) => Promise<void> = async (
    publicDeriver: PublicDeriver<>
  ): Promise<void> => {
    const lastSyncInfo = await publicDeriver.getLastSyncInfo();
    const withCache = await this.populateCacheForWallet(publicDeriver);

    this.registerObserversForNewWallet({
      publicDeriver: withCache,
      lastSyncInfo,
    });
    this._queueWarningIfNeeded(withCache);
    runInAction(() => {
      this.publicDerivers.push(withCache);
    });
    this._startParallelRefreshForWallet(withCache);
  };

  /** Make all API calls required to setup/update wallet */
  @action restoreWalletsFromStorage: void => Promise<void> = async () => {
    const persistentDb = this.stores.loading.getDatabase();
    if (persistentDb == null) {
      throw new Error(
        `${nameof(this.restoreWalletsFromStorage)} db not loaded. Should never happen`
      );
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
        lastSyncInfo,
      });
    }
    for (const publicDeriver of newWithCachedData) {
      this._queueWarningIfNeeded(publicDeriver);
    }
    const refreshActiveWallet = () => {
      if (this.selected == null && newWithCachedData.length === 1) {
        this.actions.wallets.setActiveWallet.trigger({
          wallet: newWithCachedData[0],
        });
      }
      this.publicDerivers.push(...newWithCachedData);
    };
    runInAction(refreshActiveWallet);
    setTimeout(async () => {
      await Promise.all(newWithCachedData
        .map(w => this.refreshWalletFromLocalOnLaunch(w)));
      // This should correctly handle both states of `paralletSync`, both
      // initially and when it changes.
      // The initial case is straightforward.
      // When change happens, i.e. when the action fires, the value of `parallelSync`
      // has already been changed, so the new invocation of `_startRefreshAllWallets`
      // should choose the correct mode. And the currently running polling loops
      // (`_refreshAllWalletsSerial` for serial syncing,
      // or `_startParallelRefreshForWallet` for parallel syncing)  should terminate
      // when they see the `parallelSync` value change.
      // There is no need to handle muliple simultaneous refreshing of one
      // wallet because the TransactionStore ensures it couldn't happen.
      this._startRefreshAllWallets();
      this.actions.serverConnection.parallelSyncStateChange.listen(() => {
        this._startRefreshAllWallets();
      });
    }, 50); // let the UI render first so that the loading process is perceived faster
  };

  @action registerObserversForNewWallet: ({|
    publicDeriver: PublicDeriver<>,
    lastSyncInfo: IGetLastSyncInfoResponse,
  |}) => void = request => {
    const { addresses, transactions, substores } = this.stores;
    addresses.addObservedWallet(request.publicDeriver);
    transactions.addObservedWallet(request);
    const { time, delegation } = substores.ada;
    time.addObservedTime(request.publicDeriver);
    if (asGetStakingKey(request.publicDeriver) != null) {
      delegation.addObservedWallet(request.publicDeriver);
      delegation.refreshDelegation(request.publicDeriver);
    }
  };

  // =================== ACTIVE WALLET ==================== //

  @action _setActiveWallet: ({| wallet: PublicDeriver<> |}) => void = ({ wallet }) => {
    this.actions.profile.setSelectedNetwork.trigger(wallet.getParent().getNetworkInfo());
    this.selected = wallet;
    // Cache select wallet
    this.api.localStorage.setSelectedWalletId(wallet.getPublicDeriverId());
    // do not await on purpose since the UI will handle adding loaders while refresh is happening
    this.refreshWalletFromRemote(wallet);
  };

  getLastSelectedWallet: void => ?PublicDeriver<> = () => {
    const walletId = this.api.localStorage.getSelectedWalletId();
    return this.publicDerivers.find(pd => pd.getPublicDeriverId() === walletId);
  };

  @action _unsetActiveWallet: void => void = () => {
    this.actions.profile.setSelectedNetwork.trigger(undefined);
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
    // Also no need to update if we are in parallel sync mode
    if (!document.hidden && !this.stores.serverConnectionStore.parallelSync) {
      const selected = this.selected;
      if (selected) {
        // note: don't need to await since UI will handle this
        this.refreshWalletFromRemote(selected);
      }
    }
  };

  _startRefreshAllWallets: void => Promise<void> = async () => {
    if (this.stores.serverConnectionStore.parallelSync) {
      for (const publicDeriver of this.publicDerivers) {
        this._startParallelRefreshForWallet(publicDeriver);
      }
    } else {
      this._refreshAllWalletsSerial();
    }
  };
  _refreshAllWalletsSerial: void => Promise<void> = async () => {
    for (const publicDeriver of this.publicDerivers) {
      if (this.stores.serverConnectionStore.parallelSync) {
        return;
      }
      if (this.selected !== publicDeriver) {
        try {
          await this.refreshWalletFromRemote(publicDeriver);
        } catch {
          // ignore error
        }
      }
    }
    setTimeout(this._refreshAllWalletsSerial, this.WALLET_REFRESH_INTERVAL);
  };
  _startParallelRefreshForWallet: (PublicDeriver<>) => Promise<void> = async publicDeriver => {
    if (!this.stores.serverConnectionStore.parallelSync) {
      return;
    }

    await this.refreshWalletFromRemote(publicDeriver);

    setTimeout(
      this._startParallelRefreshForWallet.bind(this, publicDeriver),
      this.WALLET_REFRESH_INTERVAL
    );
  };

  // =================== NOTIFICATION ==================== //
  showLedgerWalletIntegratedNotification: void => void = (): void => {
    this.actions.notifications.open.trigger(WalletCreationNotifications.LedgerNotification);
  };

  showTrezorTWalletIntegratedNotification: void => void = (): void => {
    this.actions.notifications.open.trigger(WalletCreationNotifications.TrezorTNotification);
  };

  showWalletCreatedNotification: void => void = (): void => {
    this.actions.notifications.open.trigger(WalletCreationNotifications.WalletCreatedNotification);
  };

  showWalletRestoredNotification: void => void = (): void => {
    this.actions.notifications.open.trigger(WalletCreationNotifications.WalletRestoredNotification);
  };

  // TODO: maybe delete this function and turn it into another "addObservedWallet"
  populateCacheForWallet: (PublicDeriver<>) => Promise<PublicDeriver<>> = async publicDeriver => {
    // $FlowFixMe[incompatible-call]
    const withPubKey = asGetPublicKey(publicDeriver);

    if (withPubKey != null) {
      const publicKey = await withPubKey.getPublicKey();
      if (publicKey.IsEncrypted) {
        throw new Error(`${nameof(this.populateCacheForWallet)} unexpected encrypted public key`);
      }
      const checksum = await getWalletChecksum(withPubKey);
      if (checksum != null) {
        runInAction(() => {
          this.publicKeyCache.push({
            publicDeriver: withPubKey,
            plate: checksum,
            publicKey: publicKey.Hash,
          });
        });
      }
    }

    const publicDeriverInfo = await publicDeriver.getFullPublicDeriverInfo();
    const conceptualWalletInfo = await publicDeriver.getParent().getFullConceptualWalletInfo();

    {
      const withSigningKey = asGetSigningKey(publicDeriver);
      if (withSigningKey) {
        const key = await withSigningKey.getSigningKey();
        runInAction(() => {
          this.signingKeyCache.push({
            publicDeriver: withSigningKey,
            signingKeyUpdateDate: key.row.PasswordLastUpdate,
          });
        });
      }
    }
    runInAction(() => {
      this.stores.walletSettings.publicDeriverSettingsCache.push({
        publicDeriver,
        assuranceMode: assuranceModes.NORMAL,
        publicDeriverName: publicDeriverInfo.Name,
      });
      this.stores.walletSettings.conceptualWalletSettingsCache.push({
        conceptualWallet: publicDeriver.getParent(),
        conceptualWalletName: conceptualWalletInfo.Name,
      });
      this.stores.walletSettings.walletWarnings.push({
        publicDeriver,
        dialogs: [],
      });
    });

    return publicDeriver;
  };

  @action
  _queueWarningIfNeeded: (PublicDeriver<>) => void = publicDeriver => {
    if (environment.isTest()) return;
    if (!environment.isProduction()) return;

    const debugWalletChecksums = [
      'DNKO-8098',
      'ATPE-6458', // abandon share
      'ATJK-0805',
      'NXTB-2808', // abandon address
      'JSKA-2258', // ledger
      'CZSA-2051', // trezor
      'JEBH-9973',
      'ONZO-5595', // mobile debug create
      'SKBE-5478',
      'SHHN-6941', // mobile debug restore
    ];
    const withPubKey = asGetPublicKey(publicDeriver);
    if (withPubKey != null) {
      const { plate } = this.getPublicKeyCache(withPubKey);
      const existingWarnings = this.stores.walletSettings.getWalletWarnings(publicDeriver);
      // bring this back if we ever need it. Removing this code deletes the i18n strings.
      // eslint-disable-next-line no-constant-condition
      if (false) {
        existingWarnings.dialogs.push(
          createProblematicWalletDialog(
            plate.TextPart,
            action(() => {
              existingWarnings.dialogs.pop();
            }),
          )
        );
      }
      if (debugWalletChecksums.find(elem => elem === plate.TextPart) != null) {
        existingWarnings.dialogs.push(
          createDebugWalletDialog(
            plate.TextPart,
            action(() => {
              existingWarnings.dialogs.pop();
            }),
          )
        );
      }
    }
  };

  sendAndRefresh: ({|
    publicDeriver: void | PublicDeriver<>,
    broadcastRequest: void => Promise<{| txId: string |}>,
    refreshWallet: () => Promise<void>,
  |}) => Promise<{| txId: string |}> = async request => {
    this.sendMoneyRequest.reset();
    const tx = await this.sendMoneyRequest.execute(async () => {
      const result = await request.broadcastRequest();

      if (request.publicDeriver != null) {
        const memo = this.stores.transactionBuilderStore.memo;
        if (memo !== '' && memo !== undefined) {
          try {
            await this.actions.memos.saveTxMemo.trigger({
              publicDeriver: request.publicDeriver,
              memo: {
                Content: memo,
                TransactionHash: result.txId,
                LastUpdated: new Date(),
              },
            });
          } catch (error) {
            Logger.error(
              `${nameof(WalletStore)}::${nameof(this.sendAndRefresh)} error: ` +
                stringifyError(error)
            );
            throw new Error('An error has ocurred when saving the transaction memo.');
          }
        }
      }
      try {
        await request.refreshWallet();
      } catch (_e) {
        // even if refreshing the wallet fails, we don't want to fail the tx
        // otherwise user may try and re-send the tx
      }
      return result;
    }).promise;
    if (tx == null) throw new Error(`Should never happen`);
    return tx;
  };
}

export const WalletCreationNotifications: {| [key: string]: Notification |} = {
  LedgerNotification: {
    id: globalMessages.integratedNotificationMessage.id,
    message: globalMessages.integratedNotificationMessage,
    duration: config.wallets.WALLET_CREATED_NOTIFICATION_DURATION,
    values: intl => ({
      deviceName: intl.formatMessage(globalMessages.ledgerTitle),
    }),
  },
  TrezorTNotification: {
    id: globalMessages.integratedNotificationMessage.id,
    message: globalMessages.integratedNotificationMessage,
    duration: config.wallets.WALLET_CREATED_NOTIFICATION_DURATION,
    values: intl => ({
      deviceName: intl.formatMessage(globalMessages.trezorTitle),
    }),
  },
  WalletCreatedNotification: {
    id: globalMessages.walletCreatedNotificationMessage.id,
    message: globalMessages.walletCreatedNotificationMessage,
    duration: config.wallets.WALLET_CREATED_NOTIFICATION_DURATION,
  },
  WalletRestoredNotification: {
    id: globalMessages.walletRestoredNotificationMessage.id,
    message: globalMessages.walletRestoredNotificationMessage,
    duration: config.wallets.WALLET_RESTORED_NOTIFICATION_DURATION,
  },
};
