// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed, runInAction, action, observable } from 'mobx';
import { intlShape, FormattedHTMLMessage } from 'react-intl';
import { ROUTES } from '../../routes-config';
import environment from '../../environment';
import type { Notification } from '../../types/notificationType';
import NotificationMessage from '../../components/widgets/NotificationMessage';
import globalMessages from '../../i18n/global-messages';
import successIcon from '../../assets/images/success-small.inline.svg';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import WalletTransactionsList from '../../components/wallet/transactions/WalletTransactionsList';
import WalletSummary from '../../components/wallet/summary/WalletSummary';
import WalletNoTransactions from '../../components/wallet/transactions/WalletNoTransactions';
import VerticalFlexContainer from '../../components/layout/VerticalFlexContainer';
import ExportTransactionDialog from '../../components/wallet/export/ExportTransactionDialog';
import AddMemoDialog from '../../components/wallet/memos/AddMemoDialog';
import EditMemoDialog from '../../components/wallet/memos/EditMemoDialog';
import DeleteMemoDialog from '../../components/wallet/memos/DeleteMemoDialog';
import MemoNoExternalStorageDialog from '../../components/wallet/memos/MemoNoExternalStorageDialog';
import { Logger } from '../../utils/logging';
import { buildRoute } from '../../utils/routing';
import type { $npm$ReactIntl$IntlFormat, $npm$ReactIntl$MessageDescriptor } from 'react-intl';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type {
  Address,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import config from '../../config';

export type GeneratedData = typeof WalletSummaryPage.prototype.generated;

const targetNotificationIds = [
  globalMessages.walletCreatedNotificationMessage.id,
  globalMessages.walletRestoredNotificationMessage.id,
  globalMessages.ledgerNanoSWalletIntegratedNotificationMessage.id,
  globalMessages.trezorTWalletIntegratedNotificationMessage.id,
];

@observer
export default class WalletSummaryPage extends Component<InjectedOrGenerated<GeneratedData>> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };
  @observable notificationElementId: string = '';

  render(): null | Node {
    const { intl } = this.context;
    const actions = this.generated.actions;
    const { transactions, addresses } = this.generated.stores.substores.ada;
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
    } = transactions;
    const publicDeriver = wallets.selected;
    let walletTransactions = null;
    // Guard against potential null values
    if (publicDeriver == null) {
      Logger.error('[WalletSummaryPage::render] Active wallet required');
      return null;
    }

    const {
      exportTransactionsToFile,
      closeExportTransactionDialog,
    } = actions[environment.API].transactions;

    const isLoadingTx = (
      !recentTransactionsRequest.wasExecuted || recentTransactionsRequest.isExecuting
    );

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
      if (!recentTransactionsRequest.wasExecuted || hasAny) {
        const { assuranceMode } = this.generated.stores.substores.ada.walletSettings
          .getPublicDeriverSettingsCache(publicDeriver);
        walletTransactions = (
          <WalletTransactionsList
            transactions={recent}
            lastSyncBlock={lastSyncInfo.Height}
            memoMap={this.generated.stores.memos.txMemoMap.get(walletId) || new Map()}
            priceMap={this.generated.stores.coinPriceStore.priceMap}
            selectedExplorer={this.generated.stores.profile.selectedExplorer}
            isLoadingTransactions={isLoadingTx}
            hasMoreToLoad={totalAvailable > limit}
            onLoadMore={() => actions.ada.transactions.loadMoreTransactions.trigger(publicDeriver)}
            assuranceMode={assuranceMode}
            shouldHideBalance={profile.shouldHideBalance}
            onAddMemo={(transaction) => this.showMemoDialog({
              dialog: MemoNoExternalStorageDialog,
              continuation: () => {
                actions.memos.selectTransaction.trigger({ tx: transaction });
                actions.dialogs.open.trigger({ dialog: AddMemoDialog });
              }
            })}
            onEditMemo={(transaction) => this.showMemoDialog({
              dialog: MemoNoExternalStorageDialog,
              continuation: () => {
                actions.memos.selectTransaction.trigger({ tx: transaction });
                actions.dialogs.open.trigger({ dialog: EditMemoDialog });
              }
            })}
            unitOfAccountSetting={profile.unitOfAccount}
            addressLookup={(address) => {
              const addressStores = addresses.getStoresForWallet(publicDeriver);
              for (const addressStore of addressStores) {
                if (addressStore.all.some(addressInStore => addressInStore.address === address)) {
                  const route = buildRoute(addressStore.route, {
                    id: publicDeriver.getPublicDeriverId(),
                  });
                  return {
                    goToRoute: () => this.generated.actions.router.goToRoute.trigger({ route }),
                    displayName: addressStore.displayName,
                  };
                }
              }
              return undefined;
            }}
            onCopyAddressTooltip={onCopyAddressTooltip}
            notification={notificationToolTip}
          />
        );
      } else {
        walletTransactions = (
          <WalletNoTransactions
            label={noTransactionsFoundLabel}
            classicTheme={profile.isClassicTheme}
          />
        );
      }
    }

    const notification = this._getThisPageActiveNotification();

    return (
      <VerticalFlexContainer>

        <NotificationMessage
          icon={successIcon}
          show={!!notification}
        >
          {!!notification && <FormattedHTMLMessage {...notification.message} />}
        </NotificationMessage>

        <WalletSummary
          numberOfTransactions={totalAvailable}
          pendingAmount={unconfirmedAmount}
          isLoadingTransactions={
            /**
             * only use first load
             * to avoid wallet summary disappearing when wallet tx list is updating
            */
            !recentTransactionsRequest.wasExecuted
          }
          openExportTxToFileDialog={this.openExportTransactionDialog}
          unitOfAccountSetting={profile.unitOfAccount}
        />

        {walletTransactions}

        {uiDialogs.isOpen(ExportTransactionDialog) ? (
          <ExportTransactionDialog
            isActionProcessing={isExporting}
            error={exportError}
            submit={exportRequest => exportTransactionsToFile.trigger({
              exportRequest,
              publicDeriver
            })}
            cancel={closeExportTransactionDialog.trigger}
          />
        ) : null}

        {uiDialogs.isOpen(AddMemoDialog) ? (
          <AddMemoDialog
            selectedWallet={publicDeriver}
            selectedTransaction={(() => {
              if (memos.selectedTransaction == null) throw new Error('no selected transaction. Should never happen');
              return memos.selectedTransaction;
            })()}
            error={memos.error}
            onCancel={actions.memos.closeMemoDialog.trigger}
            onSubmit={(values) => {
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
              actions.memos.closeMemoDialog.trigger();
              this.generated.stores.uiDialogs.getParam<void => void>('continuation')();
            }}
          />
        ) : null}

        {uiDialogs.isOpen(EditMemoDialog) ? (
          <EditMemoDialog
            selectedWallet={publicDeriver}
            existingMemo={(() => {
              if (memos.selectedTransaction == null) throw new Error('no selected transaction. Should never happen');
              const txid = memos.selectedTransaction.txid;
              const memo = this.generated.stores.memos.txMemoMap
                .get(walletId)
                ?.get(txid);
              if (memo == null) throw new Error('Should never happen');
              return memo;
            })()}
            error={memos.error}
            onCancel={actions.memos.closeMemoDialog.trigger}
            onClickDelete={this.openDeleteMemoDialog}
            onSubmit={(values) => {
              return actions.memos.updateTxMemo.trigger(values);
            }}
            classicTheme={profile.isClassicTheme}
          />
        ) : null}

        {uiDialogs.isOpen(DeleteMemoDialog) ? (
          <DeleteMemoDialog
            selectedTransaction={(() => {
              if (memos.selectedTransaction == null) throw new Error('no selected transaction. Should never happen');
              return memos.selectedTransaction;
            })()}
            error={memos.error}
            onCancel={() => {
              actions.memos.closeMemoDialog.trigger();
              actions.dialogs.open.trigger({ dialog: EditMemoDialog });
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
  }

  _getThisPageActiveNotification: void => ?Notification = () => {
    let notification = null;

    const { mostRecentActiveNotification } = this.generated.stores.uiNotifications;
    const activeNotificationId = mostRecentActiveNotification ?
      mostRecentActiveNotification.id :
      '';
    if (targetNotificationIds.includes(activeNotificationId)) {
      notification = mostRecentActiveNotification;
    }

    return notification;
  }

  openExportTransactionDialog: void => void = () => {
    const { actions } = this.generated;
    actions.dialogs.open.trigger({ dialog: ExportTransactionDialog });
  }

  showMemoDialog: {|
    continuation: void => void,
    dialog: any,
  |} => void = (request) => {
    if (this.generated.stores.memos.hasSetSelectedExternalStorageProvider) {
      return request.continuation();
    }

    this.generated.actions.dialogs.open.trigger({
      dialog: request.dialog,
      params: {
        continuation: request.continuation,
      },
    });
  }

  openDeleteMemoDialog: void => void = () => {
    const { actions } = this.generated;
    actions.dialogs.open.trigger({ dialog: DeleteMemoDialog });
  }

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WalletSummaryPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const adaStores = stores.substores.ada;
    return Object.freeze({
      stores: {
        profile: {
          selectedExplorer: stores.profile.selectedExplorer,
          shouldHideBalance: stores.profile.shouldHideBalance,
          isClassicTheme: stores.profile.isClassicTheme,
          unitOfAccount: stores.profile.unitOfAccount,
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
        coinPriceStore: {
          priceMap: stores.substores.ada.coinPriceStore.priceMap,
        },
        memos: {
          hasSetSelectedExternalStorageProvider: stores.memos.hasSetSelectedExternalStorageProvider,
          selectedTransaction: stores.memos.selectedTransaction,
          error: stores.memos.error,
          getIdForWallet: stores.memos.getIdForWallet,
          txMemoMap: stores.memos.txMemoMap,
        },
        substores: {
          ada: {
            addresses: {
              getStoresForWallet: (publicDeriver: PublicDeriver<>) => {
                const substore = stores.substores.ada;
                const addressStores = substore.addresses.getStoresForWallet(publicDeriver);
                const functionalitySubset: Array<{|
                  +route: string,
                  +displayName: $Exact<$npm$ReactIntl$MessageDescriptor>,
                  +all: $ReadOnlyArray<$ReadOnly<{ ...Address, ... }>>,
                |}> = addressStores.map(addressStore => ({
                  route: addressStore.route,
                  displayName: addressStore.name.display,
                  all: addressStore.all,
                }));
                return functionalitySubset;
              },
            },
            walletSettings: {
              getPublicDeriverSettingsCache: adaStores.walletSettings.getPublicDeriverSettingsCache,
            },
            transactions: {
              hasAny: adaStores.transactions.hasAny,
              totalAvailable: adaStores.transactions.totalAvailable,
              recent: adaStores.transactions.recent,
              searchOptions: adaStores.transactions.searchOptions,
              recentTransactionsRequest: {
                isExecuting: adaStores.transactions.recentTransactionsRequest.isExecuting,
                wasExecuted: adaStores.transactions.recentTransactionsRequest.wasExecuted,
              },
              lastSyncInfo: adaStores.transactions.lastSyncInfo,
              unconfirmedAmount: adaStores.transactions.unconfirmedAmount,
              isExporting: adaStores.transactions.isExporting,
              exportError: adaStores.transactions.exportError,
            },
          },
        },
      },
      actions: {
        notifications: {
          open: {
            trigger: actions.notifications.open.trigger,
          },
        },
        dialogs: {
          open: { trigger: actions.dialogs.open.trigger },
        },
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
        memos: {
          closeMemoDialog: {
            trigger: actions.memos.closeMemoDialog.trigger
          },
          saveTxMemo: { trigger: actions.memos.saveTxMemo.trigger },
          updateTxMemo: { trigger: actions.memos.updateTxMemo.trigger },
          deleteTxMemo: { trigger: actions.memos.deleteTxMemo.trigger },
          selectTransaction: { trigger: actions.memos.selectTransaction.trigger },
        },
        ada: {
          transactions: {
            exportTransactionsToFile: {
              trigger: actions.ada.transactions.exportTransactionsToFile.trigger
            },
            closeExportTransactionDialog: {
              trigger: actions.ada.transactions.closeExportTransactionDialog.trigger
            },
            loadMoreTransactions: {
              trigger: actions.ada.transactions.loadMoreTransactions.trigger
            },
          },
        },
      },
    });
  }
}
