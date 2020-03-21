// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { intlShape, FormattedHTMLMessage } from 'react-intl';
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

    const { uiDialogs, profile } = this.generated.stores;
    if (searchOptions) {
      const { limit } = searchOptions;
      const noTransactionsFoundLabel = intl.formatMessage(globalMessages.noTransactionsFound);
      if (!recentTransactionsRequest.wasExecuted || hasAny) {
        const { assuranceMode } = this.generated.stores.substores.ada.walletSettings
          .getPublicDeriverSettingsCache(publicDeriver);
        walletTransactions = (
          <WalletTransactionsList
            transactions={recent}
            selectedExplorer={this.generated.stores.profile.selectedExplorer}
            isLoadingTransactions={isLoadingTx}
            hasMoreToLoad={totalAvailable > limit}
            onLoadMore={() => actions.ada.transactions.loadMoreTransactions.trigger(publicDeriver)}
            assuranceMode={assuranceMode}
            shouldHideBalance={profile.shouldHideBalance}
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

      </VerticalFlexContainer>
    );
  }

  _getThisPageActiveNotification = (): ?Notification => {
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

  openExportTransactionDialog = (): void => {
    const { actions } = this.generated;
    actions.dialogs.open.trigger({ dialog: ExportTransactionDialog });
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
