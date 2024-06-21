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
import type { CreateWalletResponse, RestoreWalletResponse } from '../../api/common/types';
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
import { getWalletChecksum } from '../../api/export/utils';
import { getNetworkById } from '../../api/ada/lib/storage/database/prepackaged/networks';
import type { WalletState } from '../../../chrome/extension/background/types';
import { getWallets } from '../../api/thunk';

export type SendMoneyRequest = Request<DeferredCall<{| txId: string |}>>;

/**
 * The base wallet store that contains the shared logic
 * dealing with wallets / accounts.
 */
export default class WalletStore extends Store<StoresMap, ActionsMap> {
  ON_VISIBLE_DEBOUNCE_WAIT: number = 1000;

  @observable initialSyncingWalletIds: Array<number> = [];
  @observable wallets: Array<WalletState> = [];
  @observable selected: null | WalletState;
  @observable getInitialWallets: Request<typeof getWallets> = new Request(getWallets);

  @observable sendMoneyRequest: SendMoneyRequest = new Request<
    DeferredCall<{| txId: string |}>
  >(request => request());

  @observable createWalletRequest: Request<
    (() => Promise<WalletState>) => Promise<WalletState>
  > = new Request(async create => {
    const createdWallet = await create();
    if (!createdWallet)
      throw new Error(`${nameof(this.createWalletRequest)} failed to create wallet`);

    await this._baseAddNewWallet(createdWallet);
    this.stores.walletBackup.teardown();
    return createdWallet;
  });
  @observable restoreRequest: Request<
    (() => Promise<WalletState>) => Promise<WalletState>
  > = new Request(async restore => {
    const restoredWallet = await restore();
    if (!restoredWallet)
      throw new Error(`${nameof(this.createWalletRequest)} failed to restore wallet`);

    await this._baseAddNewWallet(restoredWallet);
    this.restoreRequest.reset();
    return restoredWallet;
  });

  setup(): void {
    super.setup();
    const { wallets } = this.actions;
    wallets.unselectWallet.listen(this._unsetActiveWallet);
    wallets.setActiveWallet.listen(this._setActiveWallet);
  }

  @action
  _baseAddNewWallet: WalletState => Promise<void> = async newWallet => {
    this.showWalletCreatedNotification();

    this.registerObserversForNewWallet({
      publicDeriver: newWallet,
      lastSyncInfo: newWallet.lastSyncInfo,
    });

    this._queueWarningIfNeeded(newWallet);

    runInAction(() => {
      this.wallets.push(newWallet);
      this._setActiveWallet({
        publicDeriverId: newWallet.publicDeriverId,
      });
      this.actions.dialogs.closeActiveDialog.trigger();
      this.initialSyncingWalletIds.push(newWallet.publicDeriverId);
      this.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ROOT });
    });
  };

  // =================== PUBLIC API ==================== //

  // GETTERS

  @computed get hasActiveWallet(): boolean {
    return this.selected != null;
  }

  @computed get activeWalletPlate(): ?WalletChecksum {
    return this.selected?.plate;
  }

  @computed get hasLoadedWallets(): boolean {
    return this.getInitialWallets.wasExecuted;
  }

  @computed get hasAnyWallets(): ?boolean {
    if (!this.hasLoadedWallets) return undefined;
    return this.wallets.length > 0;
  }

  refreshWalletFromRemote: (number) => Promise<void> = async publicDeriverId => {
    // legacy code, no-op now, to be removed
  }

  @action
  addHwWallet: (WalletState) => Promise<void> = async (wallet): Promise<void> => {
    this.registerObserversForNewWallet({
      publicDeriver: wallet,
      lastSyncInfo: wallet.lastSyncInfo,
    });
    this._queueWarningIfNeeded(wallet);

    runInAction(() => {
      this.wallets.push(wallet);
      this.initialSyncingWalletIds.push(wallet.publicDeriverId);
    });
  };

  /** Make all API calls required to setup/update wallet */
  @action restoreWalletsFromStorage: void => Promise<void> = async () => {
    const result = await this.getInitialWallets.execute().promise;
    if (result == null || result.length === 0) return;

    for (const publicDeriver of result) {
      this.registerObserversForNewWallet({
        publicDeriver,
        lastSyncInfo: publicDeriver.lastSyncInfo,
      });
      this._queueWarningIfNeeded(publicDeriver);
      this.stores.transactions.refreshTransactionData({
        publicDeriver,
      });
      this.stores.addresses.refreshAddressesFromDb(publicDeriver);
    }

    runInAction('refresh active wallet', () => {
      if (this.selected == null && result.length === 1) {
        this.actions.wallets.setActiveWallet.trigger({
          publicDeriverId: result[0].publicDeriverId,
        });
      }
      this.wallets.push(...result);
    });
  };

  @action registerObserversForNewWallet: ({|
    publicDeriver: WalletState,
    lastSyncInfo: IGetLastSyncInfoResponse,
  |}) => void = request => {
    const { addresses, transactions, substores } = this.stores;
    addresses.addObservedWallet(request.publicDeriver);
    transactions.addObservedWallet(request.publicDeriver);
    const { time, delegation } = substores.ada;
    time.addObservedTime(
      request.publicDeriver.publicDeriverId,
      request.publicDeriver.networkId
    );
    delegation.addObservedWallet(request.publicDeriver);
    delegation.refreshDelegation(request.publicDeriver);

    this.stores.walletSettings.walletWarnings.push({
      publicDeriverId: request.publicDeriver.publicDeriverId,
      dialogs: [],
    });
  };

  // =================== ACTIVE WALLET ==================== //

  @action _setActiveWallet: ({| publicDeriverId: number |}) => void = ({ publicDeriverId }) => {
    const wallet = this.wallets.find(wallet => wallet.publicDeriverId === publicDeriverId);
    if (!wallet) {
      throw new Error('unexpected missing wallet id');
    }
    this.actions.profile.setSelectedNetwork.trigger(
      getNetworkById(wallet.networkId)
    );
    this.selected = wallet;
    // Cache select wallet
    this.api.localStorage.setSelectedWalletId(wallet.publicDeriverId);
  };

  getLastSelectedWallet: void => ?WalletState = () => {
    const walletId = this.api.localStorage.getSelectedWalletId();
    return this.wallets.find(wallet => wallet.publicDeriverId === walletId);
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

  @action
  _queueWarningIfNeeded: (WalletState) => void = publicDeriver => {
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

    const { plate } = publicDeriver;
    const existingWarnings = this.stores.walletSettings.getWalletWarnings(publicDeriver.publicDeriverId);
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
  };

  sendAndRefresh: ({|
    publicDeriverId: void | number,
    plateTextPart: void | string,
    broadcastRequest: void => Promise<{| txId: string |}>,
    refreshWallet: () => Promise<void>,
  |}) => Promise<{| txId: string |}> = async request => {
    this.sendMoneyRequest.reset();
    const tx = await this.sendMoneyRequest.execute(async () => {
      const result = await request.broadcastRequest();

      if (request.publicDeriverId != null) {
        const memo = this.stores.transactionBuilderStore.memo;
        if (memo !== '' && memo !== undefined && request.plateTextPart) {
          try {
            await this.actions.memos.saveTxMemo.trigger({
              publicDeriverId: request.publicDeriverId,
              plateTextPart: request.plateTextPart,
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

  isInitialSyncing: (number) => boolean = (publicDeriverId) => {
    return this.initialSyncingWalletIds.includes(publicDeriverId);
  }
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
