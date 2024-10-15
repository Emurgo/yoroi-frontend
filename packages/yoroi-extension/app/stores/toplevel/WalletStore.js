// @flow
import { action, computed, observable, runInAction } from 'mobx';
import Store from '../base/Store';
import Request from '../lib/LocalizedRequest';
import { ROUTES } from '../../routes-config';
import environment from '../../environment';
import config from '../../config';
import globalMessages from '../../i18n/global-messages';
import type { Notification } from '../../types/notification.types';
import type { IGetLastSyncInfoResponse } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import { Logger, stringifyError } from '../../utils/logging';
import type { WalletChecksum } from '@emurgo/cip4-js';
import { createDebugWalletDialog } from '../../containers/wallet/dialogs/DebugWalletDialogContainer';
import { createProblematicWalletDialog } from '../../containers/wallet/dialogs/ProblematicWalletDialogContainer';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import { getNetworkById, getCardanoHaskellBaseConfig } from '../../api/ada/lib/storage/database/prepackaged/networks';
import type { WalletState } from '../../../chrome/extension/background/types';
import { getWallets, subscribe, listenForWalletStateUpdate } from '../../api/thunk';
import { FlagsApi } from '@emurgo/yoroi-lib/dist/flags';
import type { StorageAPI } from '@emurgo/yoroi-lib/dist/flags';
import { createFlagStorage, loadSubmittedTransactions } from '../../api/localStorage';
import { forceNonNull, noop, timeCached } from '../../coreUtils';
import type { BestBlockResponse } from '../../api/ada/lib/state-fetch/types';
import TimeUtils from '../../api/ada/lib/storage/bridge/timeUtils';
import type { CardanoAddressedUtxo } from '../../api/ada/transactions/types';
import { asAddressedUtxo } from '../../api/ada/transactions/utils';

/*::
declare var chrome;
*/

export type SendMoneyRequest = Request<DeferredCall<{| txId: string |}>>;

/**
 * The base wallet store that contains the shared logic
 * dealing with wallets / accounts.
 */
export default class WalletStore extends Store<StoresMap, ActionsMap> {
  ON_VISIBLE_DEBOUNCE_WAIT: number = 1000;

  @observable initialSyncingWalletIds: Set<number> = observable.set();
  @observable wallets: Array<WalletState> = [];
  @observable selectedIndex: null | number = null;
  // mobx is not smart enough to update the wallet name on the nav bar without this
  @observable selectedWalletName: null | string = null;

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

  flagStorage: StorageAPI;
  absoluteSlotGetters: { [string]: () => Promise<number> } = {};

  setup(): void {
    super.setup();
    this.flagStorage = createFlagStorage();

    listenForWalletStateUpdate(async (params) => {
      if (params.eventType === 'update') {
        const index = this.wallets.findIndex(wallet => wallet.publicDeriverId === params.publicDeriverId);
        if (index === -1) {
          return;
        }
        if (params.isRefreshing) {
          runInAction(() => {
            this.wallets[index].isRefreshing = true;
          });
        } else {
          const newWalletState = params.walletState;
          // Reloading token info must happen before updating the wallet state because if there is
          // a new transaction that brings a never-seen-before token and we are on the assets page
          // then it crashes due to missing token.
          await this.stores.tokenInfoStore.refreshTokenInfo();
          runInAction(() => {
            Object.assign(this.wallets[index], newWalletState);
          });
          if (this.initialSyncingWalletIds.has(params.publicDeriverId)) {
            this.stores.addresses.refreshAddressesFromDb(this.wallets[index]);
          }
          runInAction(() => {
            this.initialSyncingWalletIds.delete(params.publicDeriverId);
          });
          await this.stores.transactions.updateNewTransactions(params.newTxs, this.wallets[index]);
        }
      } else if (params.eventType === 'remove') {
        const index = this.wallets.findIndex(wallet => wallet.publicDeriverId === params.publicDeriverId);
        if (index === -1) {
          return;
        }
        runInAction(() => {
          this.wallets.splice(index, 1);
        });
      }
      // we don't handle (params.eventType === 'new') because currently there is only one open tab allowed
    });
  }

  // <TODO:ENCAPSULATE> make it a part of the wallet.network api
  async getRemoteFeatureFlag(feature: string): Promise<?boolean> {
    const wallet: ?WalletState = this.selected;
    if (wallet == null) return null;
    const network = getNetworkById(wallet.networkId);
    const networkName = network.NetworkFeatureName;
    if (networkName == null) return null;

    let absoluteSlotGetter = this.absoluteSlotGetters[networkName];
    if (absoluteSlotGetter == null) {
      const fetcher = this.stores.substores.ada.stateFetchStore.fetcher;
      absoluteSlotGetter = timeCached(
        async () => {
          const bestblockInfo: BestBlockResponse = await fetcher.getBestBlock({ network });
          const { epoch, slot } = bestblockInfo;
          if (epoch != null && slot != null) {
            return TimeUtils.toAbsoluteSlotNumber(getCardanoHaskellBaseConfig(network), { epoch, slot });
          }
          console.warn('Failing to resolve absolute slot, bestblock info without epoch or slot: ', bestblockInfo);
          return -1;
        },
        60_000, // 1 minute
      );
      this.absoluteSlotGetters[networkName] = absoluteSlotGetter;
    }

    const absoluteSlot = await absoluteSlotGetter();

    return await new FlagsApi(forceNonNull(network.Backend.BackendService) + '/api', this.flagStorage)
      .readFlag(feature, networkName, absoluteSlot);
  }

  @computed get selected(): null | WalletState {
    if (this.selectedIndex != null) {
      return this.wallets[this.selectedIndex];
    }
    return null;
  }

  @computed get selectedOrFail(): WalletState {
    if (this.selected == null) {
      throw new Error('A selected wallet is required!');
    }
    return this.selected;
  }

  @action
  _baseAddNewWallet: WalletState => Promise<void> = async newWallet => {
    this.showWalletCreatedNotification();

    this.registerObserversForNewWallet({
      publicDeriver: newWallet,
      lastSyncInfo: newWallet.lastSyncInfo,
    });

    runInAction(() => {
      this.wallets.push(newWallet);
      this.setActiveWallet({
        publicDeriverId: newWallet.publicDeriverId,
      });
      this.stores.uiDialogs.closeActiveDialog();
      this.initialSyncingWalletIds.add(newWallet.publicDeriverId);
      this.stores.app.goToRoute({ route: ROUTES.WALLETS.ROOT });
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

  refreshWalletFromRemote: (number) => Promise<void> = async _publicDeriverId => {
    // legacy code, no-op now, to be removed
  }

  @action
  addHwWallet: (WalletState) => Promise<void> = async (wallet): Promise<void> => {
    this.registerObserversForNewWallet({
      publicDeriver: wallet,
      lastSyncInfo: wallet.lastSyncInfo,
    });

    runInAction(() => {
      this.wallets.push(wallet);
      this.initialSyncingWalletIds.add(wallet.publicDeriverId);
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

      this.stores.addresses.refreshAddressesFromDb(publicDeriver);
    }

    runInAction(() => {
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

    time.addObservedTime(request.publicDeriver);

    addresses.addObservedWallet(request.publicDeriver);

    transactions.addObservedWallet(request.publicDeriver);

    delegation.addObservedWallet(request.publicDeriver);
    delegation.refreshDelegation(request.publicDeriver);

    this.stores.walletSettings.walletWarnings.push({
      publicDeriverId: request.publicDeriver.publicDeriverId,
      dialogs: [],
    });

    this._queueWarningIfNeeded(request.publicDeriver);

    this.stores.tokenInfoStore.refreshTokenInfo().catch(console.error);
  };

  // =================== ACTIVE WALLET ==================== //

  @action setActiveWallet: ({| publicDeriverId: number |}) => void = ({ publicDeriverId }) => {
    const walletIndex = this.wallets.findIndex(wallet => wallet.publicDeriverId === publicDeriverId);
    if (walletIndex === -1) {
      throw new Error('unexpected missing wallet id');
    }
    this.stores.profile.setSelectedNetwork(
      getNetworkById(this.wallets[walletIndex].networkId)
    );
    this.selectedIndex = walletIndex;
    this.selectedWalletName = this.wallets[walletIndex].name;
    // Cache select wallet
    this.api.localStorage.setSelectedWalletId(publicDeriverId);
    noop(subscribe(publicDeriverId));
    // Catalyst update // todo: maybe check if network changed
    noop(this.stores.substores.ada.votingStore.updateCatalystRoundInfo());
  };

  getLastSelectedWallet: void => ?WalletState = () => {
    const walletId = this.api.localStorage.getSelectedWalletId();
    return this.wallets.find(wallet => wallet.publicDeriverId === walletId);
  };

  @action unsetActiveWallet: void => void = () => {
    this.stores.profile.setSelectedNetwork(undefined);
    this.selectedIndex = null;
    this.selectedWalletName = null;
  };

  // =================== PRIVATE API ==================== //

  // =================== NOTIFICATION ==================== //
  showLedgerWalletIntegratedNotification: void => void = (): void => {
    this.stores.uiNotifications.open(WalletCreationNotifications.LedgerNotification);
  };

  showTrezorTWalletIntegratedNotification: void => void = (): void => {
    this.stores.uiNotifications.open(WalletCreationNotifications.TrezorTNotification);
  };

  showWalletCreatedNotification: void => void = (): void => {
    this.stores.uiNotifications.open(WalletCreationNotifications.WalletCreatedNotification);
  };

  showWalletRestoredNotification: void => void = (): void => {
    this.stores.uiNotifications.open(WalletCreationNotifications.WalletRestoredNotification);
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
    const resp = await this.sendMoneyRequest.execute(async () => {
      const result = await request.broadcastRequest();

      if (request.publicDeriverId != null) {
        const memo = this.stores.transactionBuilderStore.memo;
        if (memo !== '' && memo !== undefined && request.plateTextPart) {
          try {
            await this.stores.memos.saveTxMemo({
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
    if (resp == null) throw new Error(`Should never happen`);
    return resp;
  };

  isInitialSyncing: (number) => boolean = (publicDeriverId) => {
    return this.initialSyncingWalletIds.has(publicDeriverId);
  }

  @action onRenameSelectedWallet: (string) => void = (newName) => {
    this.selectedWalletName = newName;
    if (this.selectedIndex != null) {
      this.wallets[this.selectedIndex].name = newName;
    }
  }

  async getAddressedUtxos(): Promise<Array<CardanoAddressedUtxo>> {
    const wallet = this.selectedOrFail;
    const submittedTxs = await loadSubmittedTransactions() || [];
    return this.api.ada._addressedUtxosWithSubmittedTxs(
      asAddressedUtxo(wallet.utxos),
      wallet.publicDeriverId,
      wallet.allUtxoAddresses,
      submittedTxs,
    );
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
