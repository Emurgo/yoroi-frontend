// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
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
import ConnectExternalStorageDialog from '../../components/wallet/memos/ConnectExternalStorageDialog';
import { Logger } from '../../utils/logging';

export type GeneratedData = typeof WalletSummaryPage.prototype.generated;

const targetNotificationIds = [
  globalMessages.walletCreatedNotificationMessage.id,
  globalMessages.walletRestoredNotificationMessage.id,
  globalMessages.ledgerNanoSWalletIntegratedNotificationMessage.id,
  globalMessages.trezorTWalletIntegratedNotificationMessage.id,
];

@observer
export default class WalletSummaryPage extends Component<InjectedOrGenerated<GeneratedData>> {
  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const actions = this.generated.actions;
    const { transactions } = this.generated.stores.substores.ada;
    const { wallets } = this.generated.stores;
    const {
      hasAny,
      totalAvailable,
      recent,
      searchOptions,
      recentTransactionsRequest,
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

    const { uiDialogs, profile, memos } = this.generated.stores;
    if (searchOptions) {
      const { limit } = searchOptions;
      const noTransactionsFoundLabel = intl.formatMessage(globalMessages.noTransactionsFound);
      if (!recentTransactionsRequest.wasExecuted || hasAny) {
        const { assuranceMode } = this.generated.stores.substores.ada.walletSettings
          .getPublicDeriverSettingsCache(publicDeriver);
        walletTransactions = (
          <WalletTransactionsList
            transactions={recent}
            memoMap={this.generated.stores.memos.txMemoMap.get(walletId) || new Map()}
            selectedExplorer={this.generated.stores.profile.selectedExplorer}
            isLoadingTransactions={isLoadingTx}
            hasMoreToLoad={totalAvailable > limit}
            onLoadMore={() => actions.ada.transactions.loadMoreTransactions.trigger(publicDeriver)}
            assuranceMode={assuranceMode}
            shouldHideBalance={profile.shouldHideBalance}
            onAddMemo={(transaction) => {
              if (memos.hasSetSelectedExternalStorageProvider) {
                actions.memos.selectTransaction.trigger({ tx: transaction });
                this.openAddMemoDialog();
              } else {
                this.openConnectExternalStorageDialog();
              }
            }}
            onEditMemo={(transaction) => {
              if (memos.hasSetSelectedExternalStorageProvider) {
                actions.memos.selectTransaction.trigger({ tx: transaction });
                this.openEditMemoDialog();
              } else {
                this.openConnectExternalStorageDialog();
              }
            }}
          />
        );
      } else if (!hasAny) {
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
            selectedTransaction={memos.selectedTransaction}
            error={memos.error}
            onCancel={actions.memos.closeAddMemoDialog.trigger}
            onSubmit={(values) => {
              return actions.memos.saveTxMemo.trigger(values);
            }}
            classicTheme={profile.isClassicTheme}
          />
        ) : null}

        {uiDialogs.isOpen(ConnectExternalStorageDialog) ? (
          <ConnectExternalStorageDialog
            onCancel={actions.memos.closeConnectExternalStorageDialog.trigger}
            onConnect={() => {
              actions.memos.closeConnectExternalStorageDialog.trigger();
              actions.router.goToRoute.trigger({ route: ROUTES.SETTINGS.EXTERNAL_STORAGE });
            }}
          />
        ) : null}

        {uiDialogs.isOpen(EditMemoDialog) ? (
          <EditMemoDialog
            selectedWallet={publicDeriver}
            existingMemo={(() => {
              const memo = this.generated.stores.memos.txMemoMap
                .get(walletId)
                ?.get(memos.selectedTransaction.txid);
              if (memo == null) throw new Error('Should never happen');
              return memo;
            })()}
            error={memos.error}
            onCancel={actions.memos.closeEditMemoDialog.trigger}
            onClickDelete={this.openDeleteMemoDialog}
            onSubmit={(values) => {
              return actions.memos.updateTxMemo.trigger(values);
            }}
            classicTheme={profile.isClassicTheme}
          />
        ) : null}

        {uiDialogs.isOpen(DeleteMemoDialog) ? (
          <DeleteMemoDialog
            selectedTransaction={memos.selectedTransaction}
            error={memos.error}
            onCancel={() => {
              actions.memos.goBackDeleteMemoDialog.trigger();
              this.openEditMemoDialog();
            }}
            onClose={actions.memos.closeDeleteMemoDialog.trigger}
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

  openAddMemoDialog: void => void = () => {
    const { actions } = this.generated;
    actions.dialogs.open.trigger({ dialog: AddMemoDialog });
  }

  openEditMemoDialog: void => void = () => {
    const { actions } = this.generated;
    actions.dialogs.open.trigger({ dialog: EditMemoDialog });
  }

  openDeleteMemoDialog: void => void = () => {
    const { actions } = this.generated;
    actions.dialogs.open.trigger({ dialog: DeleteMemoDialog });
  }

  openConnectExternalStorageDialog: void => void = () => {
    const { actions } = this.generated;
    actions.dialogs.open.trigger({ dialog: ConnectExternalStorageDialog });
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
        },
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
        },
        uiNotifications: {
          mostRecentActiveNotification: stores.uiNotifications.mostRecentActiveNotification,
        },
        wallets: {
          selected: stores.wallets.selected,
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
              unconfirmedAmount: adaStores.transactions.unconfirmedAmount,
              isExporting: adaStores.transactions.isExporting,
              exportError: adaStores.transactions.exportError,
            },
          },
        },
      },
      actions: {
        dialogs: {
          open: { trigger: actions.dialogs.open.trigger },
        },
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
        memos: {
          closeAddMemoDialog: { trigger: actions.memos.closeAddMemoDialog.trigger },
          closeEditMemoDialog: { trigger: actions.memos.closeEditMemoDialog.trigger },
          closeDeleteMemoDialog: { trigger: actions.memos.closeDeleteMemoDialog.trigger },
          closeConnectExternalStorageDialog: {
            trigger: actions.memos.closeConnectExternalStorageDialog.trigger
          },
          goBackDeleteMemoDialog: { trigger: actions.memos.goBackDeleteMemoDialog.trigger },
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
