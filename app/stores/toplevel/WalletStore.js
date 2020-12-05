// @flow
import { observable, action, computed, runInAction } from 'mobx';
import { debounce, find } from 'lodash';
import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import { matchRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import environment from '../../environment';
import config from '../../config';
import globalMessages from '../../i18n/global-messages';
import type { Notification } from '../../types/notificationType';
import type { GetWalletsFunc } from '../../api/common/index';
import type { CreateWalletResponse, RestoreWalletResponse } from '../../api/common/types';
import { getWallets } from '../../api/common/index';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetSigningKey,
  asGetPublicKey,
  asGetStakingKey,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { isCardanoHaskell } from '../../api/ada/lib/storage/database/prepackaged/networks';
import type {
  IGetLastSyncInfoResponse,
  IGetSigningKey,
  IGetPublic,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { ConceptualWallet } from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import { Logger, stringifyError } from '../../utils/logging';
import { assuranceModes } from '../../config/transactionAssuranceConfig';
import type { WalletChecksum } from '@emurgo/cip4-js';
import { walletChecksum, legacyWalletChecksum } from '@emurgo/cip4-js';
import { createDebugWalletDialog } from '../../containers/wallet/dialogs/DebugWalletDialogContainer';
import { createProblematicWalletDialog } from '../../containers/wallet/dialogs/ProblematicWalletDialogContainer';
import { getApiForNetwork } from '../../api/common/utils';
import { Bip44Wallet } from '../../api/ada/lib/storage/models/Bip44Wallet/wrapper';

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

/**
 * The base wallet store that contains the shared logic
 * dealing with wallets / accounts.
 */
export default class WalletStore extends Store {
  WALLET_REFRESH_INTERVAL: number = environment.getWalletRefreshInterval();
  ON_VISIBLE_DEBOUNCE_WAIT: number = 1000;

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

  @observable sendMoneyRequest: Request<DeferredCall<{| txId: string |}>> = new Request<
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
    // $FlowExpectedError[incompatible-call] built-in types can't handle visibilitychange
    document.addEventListener(
      'visibilitychange',
      debounce(this._pollRefresh, this.ON_VISIBLE_DEBOUNCE_WAIT)
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
    });
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
    return groupWallets(this.publicDerivers);
  }

  refreshWalletFromRemote: (PublicDeriver<>) => Promise<void> = async publicDeriver => {
    try {
      await this.stores.transactions.refreshTransactionData({
        publicDeriver,
        localRequest: false,
      });
      await this.stores.addresses.refreshAddressesFromDb(publicDeriver);
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
        localRequest: true,
      });
      await this.stores.transactions.reactToTxHistoryUpdate({ publicDeriver });
      // if after querying local history we find nothing, we just reset the DB entirely
      const txRequests = find(this.stores.transactions.transactionsRequests, { publicDeriver });
      if (txRequests == null)
        throw new Error(`${nameof(this.refreshWalletFromLocalOnLaunch)} should never happen`);
      const { result } = txRequests.requests.allRequest;
      if (result == null)
        throw new Error(`${nameof(this.refreshWalletFromLocalOnLaunch)} should never happen`);
      if (result.transactions.length === 0) {
        for (const txRequest of Object.keys(txRequests.requests)) {
          txRequests.requests[txRequest].reset();
        }
      }
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
  };

  /** Make all API calls required to setup/update wallet */
  @action restoreWalletsFromStorage: void => Promise<void> = async () => {
    const persistentDb = this.stores.loading.loadPersistentDbRequest.result;
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
      await this.refreshWalletFromLocalOnLaunch(publicDeriver);
    }
    for (const publicDeriver of newWithCachedData) {
      this._queueWarningIfNeeded(publicDeriver);
    }
    runInAction('refresh active wallet', () => {
      if (this.selected == null && newWithCachedData.length === 1) {
        this._setActiveWallet({
          wallet: newWithCachedData[0],
        });
      }
      this.publicDerivers.push(...newWithCachedData);
    });
  };

  @action registerObserversForNewWallet: ({|
    publicDeriver: PublicDeriver<>,
    lastSyncInfo: IGetLastSyncInfoResponse,
  |}) => void = request => {
    const apiType = getApiForNetwork(request.publicDeriver.getParent().getNetworkInfo());

    const stores = this.stores.substores[apiType];
    this.stores.addresses.addObservedWallet(request.publicDeriver);
    this.stores.transactions.addObservedWallet(request);
    stores.time.addObservedTime(request.publicDeriver);
    if (asGetStakingKey(request.publicDeriver) != null) {
      if (!stores.delegation) {
        throw new Error(
          `${nameof(
            this.registerObserversForNewWallet
          )} wallet has staking key but currency doesn't support delegation`
        );
      }
      stores.delegation.addObservedWallet(request.publicDeriver);
    }
  };

  // =================== ACTIVE WALLET ==================== //

  @action _setActiveWallet: ({| wallet: PublicDeriver<> |}) => void = ({ wallet }) => {
    this.actions.profile.setSelectedNetwork.trigger(wallet.getParent().getNetworkInfo());

    this.selected = wallet;
    // do not await on purpose since the UI will handle adding loaders while refresh is happening
    this.refreshWalletFromRemote(wallet);
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
    if (!document.hidden) {
      const selected = this.selected;
      if (selected) {
        // note: don't need to await since UI will handle this
        this.refreshWalletFromRemote(selected);
      }
    }
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
    const withPubKey = asGetPublicKey(publicDeriver);

    if (withPubKey != null) {
      const publicKey = await withPubKey.getPublicKey();
      if (publicKey.IsEncrypted) {
        throw new Error(`${nameof(this.populateCacheForWallet)} unexpected encrypted public key`);
      }
      const isLegacyWallet =
        isCardanoHaskell(publicDeriver.getParent().getNetworkInfo()) &&
        publicDeriver.getParent() instanceof Bip44Wallet;
      const checksum = isLegacyWallet
        ? legacyWalletChecksum(publicKey.Hash)
        : walletChecksum(publicKey.Hash);
      runInAction(() => {
        this.publicKeyCache.push({
          publicDeriver: withPubKey,
          plate: checksum,
          publicKey: publicKey.Hash,
        });
      });
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
            { stores: this.stores, actions: this.actions }
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
            { stores: this.stores, actions: this.actions }
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
