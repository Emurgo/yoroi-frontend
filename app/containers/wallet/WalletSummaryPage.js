// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, FormattedHTMLMessage } from 'react-intl';
import { ROUTES } from '../../routes-config';
import environment from '../../environment';
import type { Notification } from '../../types/notificationType';
import NotificationMessage from '../../components/widgets/NotificationMessage';
import globalMessages from '../../i18n/global-messages';
import successIcon from '../../assets/images/success-small.inline.svg';
import type { InjectedProps } from '../../types/injectedPropsType';
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

import { formattedWalletAmount } from '../../utils/formatters';

type Props = InjectedProps

const targetNotificationIds = [
  globalMessages.walletCreatedNotificationMessage.id,
  globalMessages.walletRestoredNotificationMessage.id,
  globalMessages.ledgerNanoSWalletIntegratedNotificationMessage.id,
  globalMessages.trezorTWalletIntegratedNotificationMessage.id,
];

@observer
export default class WalletSummaryPage extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const actions = this.props.actions;
    const { wallets, transactions } = this.props.stores.substores.ada;
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
    const wallet = wallets.active;
    let walletTransactions = null;
    // Guard against potential null values
    if (!wallet) {
      Logger.error('[WalletSummaryPage::render] Active wallet required');
      return null;
    }

    const {
      exportTransactionsToFile,
      closeExportTransactionDialog,
    } = actions[environment.API].transactions;

    const { uiDialogs, profile, memos } = this.props.stores;
    if (searchOptions) {
      const { limit } = searchOptions;
      const noTransactionsFoundLabel = intl.formatMessage(globalMessages.noTransactionsFound);
      if (!recentTransactionsRequest.wasExecuted || hasAny) {
        walletTransactions = (
          <WalletTransactionsList
            transactions={recent}
            selectedExplorer={this.props.stores.profile.selectedExplorer}
            isLoadingTransactions={!recentTransactionsRequest.wasExecuted}
            hasMoreToLoad={totalAvailable > limit}
            onLoadMore={() => actions.ada.transactions.loadMoreTransactions.trigger()}
            assuranceMode={wallet.assuranceMode}
            walletId={wallet.id}
            formattedWalletAmount={formattedWalletAmount}
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
          isLoadingTransactions={recentTransactionsRequest.isExecutingFirstTime}
          openExportTxToFileDialog={this.openExportTransactionDialog}
        />

        {walletTransactions}

        {uiDialogs.isOpen(ExportTransactionDialog) ? (
          <ExportTransactionDialog
            isActionProcessing={isExporting}
            error={exportError}
            submit={exportTransactionsToFile.trigger}
            cancel={closeExportTransactionDialog.trigger}
            classicTheme={profile.isClassicTheme}
          />
        ) : null}

        {uiDialogs.isOpen(AddMemoDialog) ? (
          <AddMemoDialog
            selectedTransaction={memos.selectedTransaction}
            error={memos.error}
            onCancel={actions.memos.closeAddMemoDialog.trigger}
            onSubmit={(values: { memo: string, tx: string, lastUpdated: Date }) => {
              actions.memos.saveTxMemo.trigger(values);
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
            classicTheme={profile.isClassicTheme}
          />
        ) : null}

        {uiDialogs.isOpen(EditMemoDialog) ? (
          <EditMemoDialog
            selectedTransaction={memos.selectedTransaction}
            error={memos.error}
            onCancel={actions.memos.closeEditMemoDialog.trigger}
            onClickDelete={this.openDeleteMemoDialog}
            onSubmit={(values: { memo: string, tx: string, lastUpdated: Date }) => {
              actions.memos.updateTxMemo.trigger(values);
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
            onDelete={(tx: string) => {
              actions.memos.deleteTxMemo.trigger(tx);
            }}
            classicTheme={profile.isClassicTheme}
          />
        ) : null}

      </VerticalFlexContainer>
    );
  }

  _getThisPageActiveNotification = (): ?Notification => {
    let notification = null;

    const { mostRecentActiveNotification } = this.props.stores.uiNotifications;
    const activeNotificationId = mostRecentActiveNotification ?
      mostRecentActiveNotification.id :
      '';
    if (targetNotificationIds.includes(activeNotificationId)) {
      notification = mostRecentActiveNotification;
    }

    return notification;
  }

  openExportTransactionDialog = (): void => {
    const { actions } = this.props;
    actions.dialogs.open.trigger({ dialog: ExportTransactionDialog });
  }

  openAddMemoDialog = (): void => {
    const { actions } = this.props;
    actions.dialogs.open.trigger({ dialog: AddMemoDialog });
  }

  openEditMemoDialog = (): void => {
    const { actions } = this.props;
    actions.dialogs.open.trigger({ dialog: EditMemoDialog });
  }

  openDeleteMemoDialog = (): void => {
    const { actions } = this.props;
    actions.dialogs.open.trigger({ dialog: DeleteMemoDialog });
  }

  openConnectExternalStorageDialog = (): void => {
    const { actions } = this.props;
    actions.dialogs.open.trigger({ dialog: ConnectExternalStorageDialog });
  }
}
