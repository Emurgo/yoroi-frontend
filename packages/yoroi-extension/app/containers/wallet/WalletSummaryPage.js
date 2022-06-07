// @flow
import type { ComponentType, Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { computed, runInAction, observable } from 'mobx';
import { intlShape, FormattedHTMLMessage } from 'react-intl';
import { ROUTES } from '../../routes-config';
import type { Notification } from '../../types/notificationType';
import NotificationMessage from '../../components/widgets/NotificationMessage';
import Dialog from '../../components/widgets/Dialog';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import globalMessages from '../../i18n/global-messages';
import { ReactComponent as successIcon }  from '../../assets/images/success-small.inline.svg';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import WalletTransactionsList from '../../components/wallet/transactions/WalletTransactionsList';
import WalletTransactionsListRevamp from '../../components/wallet/transactions/WalletTransactionsListRevamp';
import WalletSummary from '../../components/wallet/summary/WalletSummary';
import WalletNoTransactions from '../../components/wallet/transactions/WalletNoTransactions';
import WalletNoTransactionsRevamp from '../../components/wallet/transactions/WalletNoTransactionsRevamp';
import VerticalFlexContainer from '../../components/layout/VerticalFlexContainer';
import ExportTransactionDialog from '../../components/wallet/export/ExportTransactionDialog';
import AddMemoDialog from '../../components/wallet/memos/AddMemoDialog';
import EditMemoDialog from '../../components/wallet/memos/EditMemoDialog';
import DeleteMemoDialog from '../../components/wallet/memos/DeleteMemoDialog';
import MemoNoExternalStorageDialog from '../../components/wallet/memos/MemoNoExternalStorageDialog';
import { Logger } from '../../utils/logging';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { IGetLastSyncInfoResponse } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import config from '../../config';
import type {
  TxMemoTableUpsert,
  TxMemoTablePreInsert,
  TxMemoPreLookupKey,
} from '../../api/ada/lib/storage/bridge/memos';
import WalletTransaction from '../../domain/WalletTransaction';
import type { TransactionRowsToExportRequest } from '../../actions/common/transactions-actions';
import LocalizableError from '../../i18n/LocalizableError';
import type { MemosForWallet } from '../../stores/toplevel/MemosStore';
import type { DelegationRequests } from '../../stores/toplevel/DelegationStore';
import type { PublicDeriverSettingsCache } from '../../stores/toplevel/WalletSettingsStore';
import { SelectedExplorer } from '../../domain/SelectedExplorer';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import type { GetTransactionsRequestOptions } from '../../api/common/index';
import type { UnconfirmedAmount } from '../../types/unconfirmedAmountType';
import type { IAddressTypeStore, IAddressTypeUiSubset } from '../../stores/stateless/addressStores';
import { genAddressLookup } from '../../stores/stateless/addressStores';
import { addressToDisplayString } from '../../api/ada/lib/storage/bridge/utils';
import type { TokenInfoMap } from '../../stores/toplevel/TokenInfoStore';
import { genLookupOrFail, genLookupOrNull } from '../../stores/stateless/tokenHelpers';
import type { ComplexityLevelType } from '../../types/complexityLevelType';
import { withLayout } from '../../styles/context/layout';
import type { LayoutComponentMap } from '../../styles/context/layout';
import WalletSummaryRevamp from '../../components/wallet/summary/WalletSummaryRevamp';
import BuySellDialog from '../../components/buySell/BuySellDialog';
import WalletEmptyBanner from './WalletEmptyBanner';

export type GeneratedData = typeof WalletSummaryPage.prototype.generated;
type Props = InjectedOrGenerated<GeneratedData>;
type InjectedProps = {|
  +renderLayoutComponent: LayoutComponentMap => Node,
  +selectedLayout: string,
|};
type AllProps = {| ...Props, ...InjectedProps |};

const targetNotificationIds = [
  globalMessages.walletCreatedNotificationMessage.id,
  globalMessages.walletRestoredNotificationMessage.id,
  globalMessages.integratedNotificationMessage.id,
];

@observer
class WalletSummaryPage extends Component<AllProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };
  @observable notificationElementId: string = '';

  render(): Node {
    const { intl } = this.context;
    const actions = this.generated.actions;
    const { wallets } = this.generated.stores;
    const {
      hasAny,
      totalAvailable,
      recent,
      searchOptions,
      recentTransactionsRequest,
      lastSyncInfo,
      unconfirmedAmount,
      isExporting,
      exportError,
    } = this.generated.stores.transactions;
    const publicDeriver = wallets.selected;
    let walletTransactions = null;
    // Guard against potential null values
    if (publicDeriver == null) {
      Logger.error('[WalletSummaryPage::render] Active wallet required');
      return null;
    }

    const { exportTransactionsToFile, closeExportTransactionDialog } = actions.transactions;

    const isLoadingTx =
      !recentTransactionsRequest.wasExecuted || recentTransactionsRequest.isExecuting;

    const walletId = this.generated.stores.memos.getIdForWallet(publicDeriver);

    const { uiDialogs, profile, memos, uiNotifications } = this.generated.stores;

    const tooltipNotification = {
      duration: config.wallets.ADDRESS_COPY_TOOLTIP_NOTIFICATION_DURATION,
      message: globalMessages.copyTooltipMessage,
    };

    const onCopyAddressTooltip = (address, elementId) => {
      if (!uiNotifications.isOpen(elementId)) {
        runInAction(() => {
          this.notificationElementId = elementId;
        });
        actions.notifications.open.trigger({
          id: elementId,
          duration: tooltipNotification.duration,
          message: tooltipNotification.message,
        });
      }
    };
    const notificationToolTip = uiNotifications.getTooltipActiveNotification(
      this.notificationElementId
    );

    if (searchOptions) {
      const { limit } = searchOptions;
      const noTransactionsFoundLabel = intl.formatMessage(globalMessages.noTransactionsFound);

      const mapWalletTransactionLayout = {
        CLASSIC: WalletTransactionsList,
        REVAMP: WalletTransactionsListRevamp,
      };
      const mapWalletNoTransactionsLayout = {
        CLASSIC: WalletNoTransactions,
        REVAMP: WalletNoTransactionsRevamp,
      };
      const WalletTransactionsListComp = mapWalletTransactionLayout[this.props.selectedLayout];
      const WalletNoTransactionsComp = mapWalletNoTransactionsLayout[this.props.selectedLayout];

      if (!recentTransactionsRequest.wasExecuted || hasAny) {
        const {
          assuranceMode,
        } = this.generated.stores.walletSettings.getPublicDeriverSettingsCache(publicDeriver);

        walletTransactions = (
          <WalletTransactionsListComp
            transactions={recent}
            lastSyncBlock={lastSyncInfo.Height}
            memoMap={this.generated.stores.memos.txMemoMap.get(walletId) || new Map()}
            selectedExplorer={
              this.generated.stores.explorers.selectedExplorer.get(
                publicDeriver.getParent().getNetworkInfo().NetworkId
              ) ??
              (() => {
                throw new Error('No explorer for wallet network');
              })()
            }
            isLoadingTransactions={isLoadingTx}
            hasMoreToLoad={totalAvailable > limit}
            onLoadMore={() => actions.transactions.loadMoreTransactions.trigger(publicDeriver)}
            assuranceMode={assuranceMode}
            shouldHideBalance={profile.shouldHideBalance}
            onAddMemo={transaction =>
              this.showMemoDialog({
                dialog: MemoNoExternalStorageDialog,
                continuation: () => {
                  actions.memos.selectTransaction.trigger({ tx: transaction });
                  actions.dialogs.push.trigger({ dialog: AddMemoDialog });
                },
              })
            }
            onEditMemo={transaction =>
              this.showMemoDialog({
                dialog: MemoNoExternalStorageDialog,
                continuation: () => {
                  actions.memos.selectTransaction.trigger({ tx: transaction });
                  actions.dialogs.push.trigger({ dialog: EditMemoDialog });
                },
              })
            }
            unitOfAccountSetting={profile.unitOfAccount}
            getHistoricalPrice={this.generated.stores.coinPriceStore.getHistoricalPrice}
            getTokenInfo={genLookupOrNull(this.generated.stores.tokenInfoStore.tokenInfo)}
            addressLookup={genAddressLookup(
              publicDeriver,
              intl,
              route => this.generated.actions.router.goToRoute.trigger({ route }),
              this.generated.stores.addresses.addressSubgroupMap
            )}
            onCopyAddressTooltip={onCopyAddressTooltip}
            notification={notificationToolTip}
            addressToDisplayString={addr =>
              addressToDisplayString(addr, publicDeriver.getParent().getNetworkInfo())
            }
            complexityLevel={this.generated.stores.profile.selectedComplexityLevel}
          />
        );
      } else {
        walletTransactions = (
          <WalletNoTransactionsComp
            label={noTransactionsFoundLabel}
            classicTheme={profile.isClassicTheme}
          />
        );
      }
    }

    const notification = this._getThisPageActiveNotification();

    let exportDialog;

    const delegationStore = this.generated.stores.delegation;
    const delegationRequests = delegationStore.getDelegationRequests(publicDeriver);

    if (!this.readyToExportHistory({ delegationRequests, publicDeriver })) {
      exportDialog = (
        <Dialog
          title={intl.formatMessage(globalMessages.processingLabel)}
          closeOnOverlayClick={false}
        >
          <VerticalFlexContainer>
            <LoadingSpinner />
          </VerticalFlexContainer>
        </Dialog>
      );
    } else {
      exportDialog = (
        <ExportTransactionDialog
          isActionProcessing={isExporting}
          error={exportError}
          submit={exportRequest =>
            exportTransactionsToFile.trigger({
              exportRequest,
              publicDeriver,
            })
          }
          toggleIncludeTxIds={this.generated.stores.transactions.toggleIncludeTxIds}
          shouldIncludeTxIds={this.generated.stores.transactions.shouldIncludeTxIds}
          cancel={closeExportTransactionDialog.trigger}
        />
      );
    }

    const walletSummaryPageClassic = (
      <VerticalFlexContainer>
        <NotificationMessage icon={successIcon} show={!!notification}>
          {!!notification && (
            <FormattedHTMLMessage
              {...notification.message}
              values={notification.values == null ? undefined : notification.values(intl)}
            />
          )}
        </NotificationMessage>
        <WalletSummary
          numberOfTransactions={totalAvailable}
          pendingAmount={unconfirmedAmount}
          shouldHideBalance={profile.shouldHideBalance}
          isLoadingTransactions={
            /**
             * only use first load
             * to avoid wallet summary disappearing when wallet tx list is updating
             */
            !recentTransactionsRequest.wasExecuted
          }
          openExportTxToFileDialog={this.openExportTransactionDialog}
          unitOfAccountSetting={profile.unitOfAccount}
          getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
          getHistoricalPrice={this.generated.stores.coinPriceStore.getHistoricalPrice}
        />

        {walletTransactions}

        {uiDialogs.isOpen(ExportTransactionDialog) ? exportDialog : null}

        {uiDialogs.isOpen(AddMemoDialog) ? (
          <AddMemoDialog
            selectedWallet={publicDeriver}
            selectedTransaction={(() => {
              if (memos.selectedTransaction == null)
                throw new Error('no selected transaction. Should never happen');
              return memos.selectedTransaction;
            })()}
            error={memos.error}
            onCancel={actions.memos.closeMemoDialog.trigger}
            onSubmit={values => {
              return actions.memos.saveTxMemo.trigger(values);
            }}
            classicTheme={profile.isClassicTheme}
          />
        ) : null}

        {uiDialogs.isOpen(MemoNoExternalStorageDialog) ? (
          <MemoNoExternalStorageDialog
            onCancel={actions.memos.closeMemoDialog.trigger}
            addExternal={() => {
              actions.memos.closeMemoDialog.trigger();
              actions.router.goToRoute.trigger({ route: ROUTES.SETTINGS.EXTERNAL_STORAGE });
            }}
            onAcknowledge={() => {
              this.generated.stores.uiDialogs.getParam<(void) => void>('continuation')();
            }}
          />
        ) : null}

        {uiDialogs.isOpen(EditMemoDialog) ? (
          <EditMemoDialog
            selectedWallet={publicDeriver}
            existingMemo={(() => {
              if (memos.selectedTransaction == null)
                throw new Error('no selected transaction. Should never happen');
              const txid = memos.selectedTransaction.txid;
              const memo = this.generated.stores.memos.txMemoMap.get(walletId)?.get(txid);
              if (memo == null) throw new Error('Should never happen');
              return memo;
            })()}
            error={memos.error}
            onCancel={actions.memos.closeMemoDialog.trigger}
            onClickDelete={this.openDeleteMemoDialog}
            onSubmit={values => {
              return actions.memos.updateTxMemo.trigger(values);
            }}
            classicTheme={profile.isClassicTheme}
          />
        ) : null}

        {uiDialogs.isOpen(DeleteMemoDialog) ? (
          <DeleteMemoDialog
            selectedTransaction={(() => {
              if (memos.selectedTransaction == null)
                throw new Error('no selected transaction. Should never happen');
              return memos.selectedTransaction;
            })()}
            error={memos.error}
            onCancel={() => {
              actions.memos.closeMemoDialog.trigger();
            }}
            onClose={actions.memos.closeMemoDialog.trigger}
            onDelete={txHash => {
              return actions.memos.deleteTxMemo.trigger({
                publicDeriver,
                txHash,
              });
            }}
          />
        ) : null}
      </VerticalFlexContainer>
    );

    const walletSummaryPageRevamp = (
      <VerticalFlexContainer>
        <NotificationMessage icon={successIcon} show={!!notification}>
          {!!notification && (
            <FormattedHTMLMessage
              {...notification.message}
              values={notification.values == null ? undefined : notification.values(intl)}
            />
          )}
        </NotificationMessage>
        {!recentTransactionsRequest.wasExecuted || hasAny ? null : (
          <WalletEmptyBanner
            isOpen={this.generated.stores.transactions.showWalletEmptyBanner}
            onClose={this.generated.actions.transactions.closeWalletEmptyBanner.trigger}
            onBuySellClick={() =>
              this.generated.actions.dialogs.open.trigger({ dialog: BuySellDialog })
            }
          />
        )}
        <WalletSummaryRevamp
          numberOfTransactions={totalAvailable}
          pendingAmount={unconfirmedAmount}
          shouldHideBalance={profile.shouldHideBalance}
          isLoadingTransactions={
            /**
             * only use first load
             * to avoid wallet summary disappearing when wallet tx list is updating
             */
            !recentTransactionsRequest.wasExecuted
          }
          openExportTxToFileDialog={this.openExportTransactionDialog}
          unitOfAccountSetting={profile.unitOfAccount}
          getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
          getHistoricalPrice={this.generated.stores.coinPriceStore.getHistoricalPrice}
        />

        {walletTransactions}

        {uiDialogs.isOpen(ExportTransactionDialog) ? exportDialog : null}

        {uiDialogs.isOpen(AddMemoDialog) ? (
          <AddMemoDialog
            selectedWallet={publicDeriver}
            selectedTransaction={(() => {
              if (memos.selectedTransaction == null)
                throw new Error('no selected transaction. Should never happen');
              return memos.selectedTransaction;
            })()}
            error={memos.error}
            onCancel={actions.memos.closeMemoDialog.trigger}
            onSubmit={values => {
              return actions.memos.saveTxMemo.trigger(values);
            }}
            classicTheme={profile.isClassicTheme}
          />
        ) : null}

        {uiDialogs.isOpen(MemoNoExternalStorageDialog) ? (
          <MemoNoExternalStorageDialog
            onCancel={actions.memos.closeMemoDialog.trigger}
            addExternal={() => {
              actions.memos.closeMemoDialog.trigger();
              actions.router.goToRoute.trigger({ route: ROUTES.SETTINGS.EXTERNAL_STORAGE });
            }}
            onAcknowledge={() => {
              this.generated.stores.uiDialogs.getParam<(void) => void>('continuation')();
            }}
          />
        ) : null}

        {uiDialogs.isOpen(EditMemoDialog) ? (
          <EditMemoDialog
            selectedWallet={publicDeriver}
            existingMemo={(() => {
              if (memos.selectedTransaction == null)
                throw new Error('no selected transaction. Should never happen');
              const txid = memos.selectedTransaction.txid;
              const memo = this.generated.stores.memos.txMemoMap.get(walletId)?.get(txid);
              if (memo == null) throw new Error('Should never happen');
              return memo;
            })()}
            error={memos.error}
            onCancel={actions.memos.closeMemoDialog.trigger}
            onClickDelete={this.openDeleteMemoDialog}
            onSubmit={values => {
              return actions.memos.updateTxMemo.trigger(values);
            }}
            classicTheme={profile.isClassicTheme}
          />
        ) : null}

        {uiDialogs.isOpen(DeleteMemoDialog) ? (
          <DeleteMemoDialog
            selectedTransaction={(() => {
              if (memos.selectedTransaction == null)
                throw new Error('no selected transaction. Should never happen');
              return memos.selectedTransaction;
            })()}
            error={memos.error}
            onCancel={() => {
              actions.memos.closeMemoDialog.trigger();
            }}
            onClose={actions.memos.closeMemoDialog.trigger}
            onDelete={txHash => {
              return actions.memos.deleteTxMemo.trigger({
                publicDeriver,
                txHash,
              });
            }}
          />
        ) : null}
      </VerticalFlexContainer>
    );

    return this.props.renderLayoutComponent({
      CLASSIC: walletSummaryPageClassic,
      REVAMP: walletSummaryPageRevamp,
    });
  }

  _getThisPageActiveNotification: void => ?Notification = () => {
    let notification = null;

    const { mostRecentActiveNotification } = this.generated.stores.uiNotifications;
    const activeNotificationId = mostRecentActiveNotification
      ? mostRecentActiveNotification.id
      : '';
    if (targetNotificationIds.includes(activeNotificationId)) {
      notification = mostRecentActiveNotification;
    }

    return notification;
  };

  openExportTransactionDialog: void => void = () => {
    const { actions } = this.generated;
    actions.dialogs.push.trigger({ dialog: ExportTransactionDialog });
  };

  showMemoDialog: ({|
    continuation: void => void,
    dialog: any,
  |}) => void = request => {
    if (this.generated.stores.memos.hasSetSelectedExternalStorageProvider) {
      return request.continuation();
    }

    this.generated.actions.dialogs.push.trigger({
      dialog: request.dialog,
      params: {
        continuation: request.continuation,
      },
    });
  };

  openDeleteMemoDialog: void => void = () => {
    const { actions } = this.generated;
    actions.dialogs.push.trigger({ dialog: DeleteMemoDialog });
  };

  readyToExportHistory: ({|
    delegationRequests?: DelegationRequests,
    publicDeriver: PublicDeriver<>,
  |}) => boolean = request => {
    if (request.delegationRequests == null) {
      // there aren't supposed to be any rewards
      return true;
    }
    const history = request.delegationRequests.rewardHistory.result;
    if (history !== null) {
      return true;
    }
    return false;
  };

  @computed get generated(): {|
    actions: {|
      dialogs: {|
        push: {|
          trigger: (params: {|
            dialog: any,
            params?: any,
          |}) => void,
        |},
        open: {|
          trigger: (params: {|
            dialog: any,
            params?: any,
          |}) => void,
        |},
      |},
      memos: {|
        closeMemoDialog: {|
          trigger: (params: void) => void,
        |},
        deleteTxMemo: {|
          trigger: (params: TxMemoPreLookupKey) => Promise<void>,
        |},
        saveTxMemo: {|
          trigger: (params: TxMemoTablePreInsert) => Promise<void>,
        |},
        selectTransaction: {|
          trigger: (params: {|
            tx: WalletTransaction,
          |}) => void,
        |},
        updateTxMemo: {|
          trigger: (params: TxMemoTableUpsert) => Promise<void>,
        |},
      |},
      notifications: {|
        open: {| trigger: (params: Notification) => void |},
      |},
      router: {|
        goToRoute: {|
          trigger: (params: {|
            publicDeriver?: null | PublicDeriver<>,
            params?: ?any,
            route: string,
          |}) => void,
        |},
      |},
      transactions: {|
        closeWalletEmptyBanner: {|
          trigger: (params: void) => void,
        |},
        closeExportTransactionDialog: {|
          trigger: (params: void) => void,
        |},
        exportTransactionsToFile: {|
          trigger: (params: {|
            exportRequest: TransactionRowsToExportRequest,
            publicDeriver: PublicDeriver<>,
          |}) => Promise<void>,
        |},
        loadMoreTransactions: {|
          trigger: (params: PublicDeriver<>) => Promise<void>,
        |},
      |},
    |},
    stores: {|
      addresses: {|
        addressSubgroupMap: $ReadOnlyMap<Class<IAddressTypeStore>, IAddressTypeUiSubset>,
      |},
      coinPriceStore: {|
        getHistoricalPrice: (from: string, to: string, timestamp: number) => ?string,
      |},
      memos: {|
        error: ?LocalizableError,
        getIdForWallet: (PublicDeriver<>) => string,
        hasSetSelectedExternalStorageProvider: boolean,
        selectedTransaction: void | WalletTransaction,
        txMemoMap: Map<string, MemosForWallet>,
      |},
      explorers: {|
        selectedExplorer: Map<number, SelectedExplorer>,
      |},
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
      |},
      profile: {|
        isClassicTheme: boolean,
        shouldHideBalance: boolean,
        unitOfAccount: UnitOfAccountSettingType,
        selectedComplexityLevel: ?ComplexityLevelType,
      |},
      transactions: {|
        exportError: ?LocalizableError,
        showWalletEmptyBanner: boolean,
        hasAny: boolean,
        isExporting: boolean,
        shouldIncludeTxIds: boolean,
        toggleIncludeTxIds: void => void,
        lastSyncInfo: IGetLastSyncInfoResponse,
        recent: Array<WalletTransaction>,
        recentTransactionsRequest: {|
          isExecuting: boolean,
          wasExecuted: boolean,
        |},
        searchOptions: ?GetTransactionsRequestOptions,
        totalAvailable: number,
        unconfirmedAmount: UnconfirmedAmount,
      |},
      uiDialogs: {|
        getParam: <T>(number | string) => T,
        isOpen: any => boolean,
      |},
      uiNotifications: {|
        getTooltipActiveNotification: string => ?Notification,
        isOpen: string => boolean,
        mostRecentActiveNotification: ?Notification,
      |},
      walletSettings: {|
        getPublicDeriverSettingsCache: (PublicDeriver<>) => PublicDeriverSettingsCache,
      |},
      wallets: {| selected: null | PublicDeriver<> |},
      delegation: {|
        getDelegationRequests: (PublicDeriver<>) => void | DelegationRequests,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WalletSummaryPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        explorers: {
          selectedExplorer: stores.explorers.selectedExplorer,
        },
        profile: {
          shouldHideBalance: stores.profile.shouldHideBalance,
          isClassicTheme: stores.profile.isClassicTheme,
          unitOfAccount: stores.profile.unitOfAccount,
          selectedComplexityLevel: stores.profile.selectedComplexityLevel,
        },
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
          getParam: stores.uiDialogs.getParam,
        },
        uiNotifications: {
          mostRecentActiveNotification: stores.uiNotifications.mostRecentActiveNotification,
          isOpen: stores.uiNotifications.isOpen,
          getTooltipActiveNotification: stores.uiNotifications.getTooltipActiveNotification,
        },
        wallets: {
          selected: stores.wallets.selected,
        },
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
        },
        coinPriceStore: {
          getHistoricalPrice: stores.coinPriceStore.getHistoricalPrice,
        },
        memos: {
          hasSetSelectedExternalStorageProvider: stores.memos.hasSetSelectedExternalStorageProvider,
          selectedTransaction: stores.memos.selectedTransaction,
          error: stores.memos.error,
          getIdForWallet: stores.memos.getIdForWallet,
          txMemoMap: stores.memos.txMemoMap,
        },
        transactions: {
          showWalletEmptyBanner: stores.transactions.showWalletEmptyBanner,
          hasAny: stores.transactions.hasAny,
          totalAvailable: stores.transactions.totalAvailable,
          recent: stores.transactions.recent,
          searchOptions: stores.transactions.searchOptions,
          recentTransactionsRequest: {
            isExecuting: stores.transactions.recentTransactionsRequest.isExecuting,
            wasExecuted: stores.transactions.recentTransactionsRequest.wasExecuted,
          },
          lastSyncInfo: stores.transactions.lastSyncInfo,
          unconfirmedAmount: stores.transactions.unconfirmedAmount,
          isExporting: stores.transactions.isExporting,
          exportError: stores.transactions.exportError,
          shouldIncludeTxIds: stores.transactions.shouldIncludeTxIds,
          toggleIncludeTxIds: stores.transactions.toggleIncludeTxIds,
        },
        addresses: {
          addressSubgroupMap: stores.addresses.addressSubgroupMap,
        },
        walletSettings: {
          getPublicDeriverSettingsCache: stores.walletSettings.getPublicDeriverSettingsCache,
        },
        delegation: {
          getDelegationRequests: stores.delegation.getDelegationRequests,
        },
      },
      actions: {
        notifications: {
          open: {
            trigger: actions.notifications.open.trigger,
          },
        },
        dialogs: {
          push: {
            trigger: actions.dialogs.push.trigger,
          },
          open: {
            trigger: actions.dialogs.open.trigger,
          },
        },
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
        memos: {
          closeMemoDialog: {
            trigger: actions.memos.closeMemoDialog.trigger,
          },
          saveTxMemo: { trigger: actions.memos.saveTxMemo.trigger },
          updateTxMemo: { trigger: actions.memos.updateTxMemo.trigger },
          deleteTxMemo: { trigger: actions.memos.deleteTxMemo.trigger },
          selectTransaction: { trigger: actions.memos.selectTransaction.trigger },
        },
        transactions: {
          closeWalletEmptyBanner: {
            trigger: actions.transactions.closeWalletEmptyBanner.trigger,
          },
          exportTransactionsToFile: {
            trigger: actions.transactions.exportTransactionsToFile.trigger,
          },
          closeExportTransactionDialog: {
            trigger: actions.transactions.closeExportTransactionDialog.trigger,
          },
          loadMoreTransactions: {
            trigger: actions.transactions.loadMoreTransactions.trigger,
          },
        },
      },
    });
  }
}
export default (withLayout(WalletSummaryPage): ComponentType<Props>);
