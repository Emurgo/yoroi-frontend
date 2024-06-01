// @flow
import type { ComponentType, Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, runInAction } from 'mobx';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { FormattedHTMLMessage, intlShape } from 'react-intl';
import { ROUTES } from '../../routes-config';
import type { Notification } from '../../types/notification.types';
import NotificationMessage from '../../components/widgets/NotificationMessage';
import Dialog from '../../components/widgets/Dialog';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import globalMessages from '../../i18n/global-messages';
import { ReactComponent as successIcon } from '../../assets/images/success-small.inline.svg';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import WalletTransactionsList from '../../components/wallet/transactions/WalletTransactionsList';
import WalletTransactionsListRevamp from '../../components/wallet/transactions/WalletTransactionsListRevamp';
import WalletSummary from '../../components/wallet/summary/WalletSummary';
import VerticalFlexContainer from '../../components/layout/VerticalFlexContainer';
import ExportTransactionDialog from '../../components/wallet/export/ExportTransactionDialog';
import AddMemoDialog from '../../components/wallet/memos/AddMemoDialog';
import EditMemoDialog from '../../components/wallet/memos/EditMemoDialog';
import DeleteMemoDialog from '../../components/wallet/memos/DeleteMemoDialog';
import MemoNoExternalStorageDialog from '../../components/wallet/memos/MemoNoExternalStorageDialog';
import { Logger } from '../../utils/logging';
import config from '../../config';
import { genAddressLookup } from '../../stores/stateless/addressStores';
import { addressToDisplayString } from '../../api/ada/lib/storage/bridge/utils';
import { genLookupOrFail, genLookupOrNull } from '../../stores/stateless/tokenHelpers';
import type { LayoutComponentMap } from '../../styles/context/layout';
import { withLayout } from '../../styles/context/layout';
import WalletSummaryRevamp from '../../components/wallet/summary/WalletSummaryRevamp';
import BuySellDialog from '../../components/buySell/BuySellDialog';
import WalletEmptyBanner from './WalletEmptyBanner';
import { Box } from '@mui/material';
import { getNetworkById } from '../../api/ada/lib/storage/database/prepackaged/networks';

type Props = StoresAndActionsProps;
type InjectedLayoutProps = {|
  +renderLayoutComponent: LayoutComponentMap => Node,
  +selectedLayout: string,
|};
type AllProps = {| ...Props, ...InjectedLayoutProps |};

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
    const actions = this.props.actions;
    const { wallets } = this.props.stores;
    const {
      hasAny,
      hasMoreToLoad,
      recent,
      isLoadingMore,
      lastSyncInfo,
      unconfirmedAmount,
      isExporting,
      exportError,
      isLoading,
    } = this.props.stores.transactions;
    const { selected } = wallets;
    let walletTransactions = null;
    // Guard against potential null values
    if (selected == null) {
      Logger.error('[WalletSummaryPage::render] Active wallet required');
      return null;
    }

    const { exportTransactionsToFile, closeExportTransactionDialog } = actions.transactions;

    const walletId = selected.plate.TextPart;

    const { uiDialogs, profile, memos, uiNotifications } = this.props.stores;

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

    if (recent.length > 0) {
      const mapWalletTransactionLayout = {
        CLASSIC: WalletTransactionsList,
        REVAMP: WalletTransactionsListRevamp,
      };

      const WalletTransactionsListComp = mapWalletTransactionLayout[this.props.selectedLayout];

      if (isLoading || hasAny) {
        walletTransactions = (
          <WalletTransactionsListComp
            transactions={recent}
            lastSyncBlock={lastSyncInfo.Height}
            memoMap={this.props.stores.memos.txMemoMap.get(walletId) || new Map()}
            selectedExplorer={
              this.props.stores.explorers.selectedExplorer.get(
                selected.networkId
              ) ??
              (() => {
                throw new Error('No explorer for wallet network');
              })()
            }
            isLoadingTransactions={isLoadingMore}
            hasMoreToLoad={hasMoreToLoad}
            onLoadMore={() => actions.transactions.loadMoreTransactions.trigger({
              publicDeriverId: selected.publicDeriverId
            })}
            assuranceMode={selected.assuranceMode}
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
            getHistoricalPrice={this.props.stores.coinPriceStore.getHistoricalPrice}
            getTokenInfo={genLookupOrNull(this.props.stores.tokenInfoStore.tokenInfo)}
            addressLookup={genAddressLookup(
              selected.networkId,
              intl,
              route => this.props.actions.router.goToRoute.trigger({ route }),
              this.props.stores.addresses.addressSubgroupMap
            )}
            onCopyAddressTooltip={onCopyAddressTooltip}
            notification={notificationToolTip}
            addressToDisplayString={addr =>
              addressToDisplayString(addr, getNetworkById(selected.networkId))
            }
            complexityLevel={this.props.stores.profile.selectedComplexityLevel}
            id='wallet:transaction-transactionsList-box'
          />
        );
      } else {
        walletTransactions = null;
      }
    }

    const notification = this._getThisPageActiveNotification();

    let exportDialog = (
      <Dialog
        title={intl.formatMessage(globalMessages.processingLabel)}
        closeOnOverlayClick={false}
      >
        <VerticalFlexContainer>
          <LoadingSpinner />
        </VerticalFlexContainer>
      </Dialog>
    );

    if (this.readyToExportHistory(selected.publicDeriverId)) {
      exportDialog = (
        <ExportTransactionDialog
          isActionProcessing={isExporting}
          error={exportError}
          submit={exportRequest =>
            exportTransactionsToFile.trigger({
              exportRequest,
              publicDeriverId: selected.publicDeriverId,
            })
          }
          toggleIncludeTxIds={this.props.stores.transactions.toggleIncludeTxIds}
          shouldIncludeTxIds={this.props.stores.transactions.shouldIncludeTxIds}
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
          pendingAmount={unconfirmedAmount}
          shouldHideBalance={profile.shouldHideBalance}
          isLoadingTransactions={
            /**
             * only use first load
             * to avoid wallet summary disappearing when wallet tx list is updating
             */
            isLoading
          }
          openExportTxToFileDialog={this.openExportTransactionDialog}
          unitOfAccountSetting={profile.unitOfAccount}
          getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
          getHistoricalPrice={this.props.stores.coinPriceStore.getHistoricalPrice}
        />

        {walletTransactions}

        {uiDialogs.isOpen(ExportTransactionDialog) ? exportDialog : null}

        {uiDialogs.isOpen(AddMemoDialog) ? (
          <AddMemoDialog
            selectedWalletId={selected.publicDeriverId}
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
            plateTextPart={selected.plate.TextPart}
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
              this.props.stores.uiDialogs.getParam<(void) => void>('continuation')?.();
            }}
          />
        ) : null}

        {uiDialogs.isOpen(EditMemoDialog) ? (
          <EditMemoDialog
            selectedWalletId={selected.publicDeriverId}
            existingMemo={(() => {
              if (memos.selectedTransaction == null)
                throw new Error('no selected transaction. Should never happen');
              const txid = memos.selectedTransaction.txid;
              const memo = this.props.stores.memos.txMemoMap.get(walletId)?.get(txid);
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
            plateTextPart={selected.plate.TextPart}
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
                publicDeriverId: selected.publicDeriverId,
                plateTextPart: selected.plate.TextPart,
                txHash,
              });
            }}
          />
        ) : null}
      </VerticalFlexContainer>
    );

    const walletSummaryPageRevamp = (
      <Box>
        <WalletSummaryRevamp
          pendingAmount={unconfirmedAmount}
          shouldHideBalance={profile.shouldHideBalance}
          isLoadingTransactions={
            /**
             * only use first load
             * to avoid wallet summary disappearing when wallet tx list is updating
             */
            isLoading
          }
          openExportTxToFileDialog={this.openExportTransactionDialog}
          unitOfAccountSetting={profile.unitOfAccount}
          getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
          getHistoricalPrice={this.props.stores.coinPriceStore.getHistoricalPrice}
          shouldShowEmptyBanner={!isLoading && !hasAny}
          emptyBannerComponent={
            <WalletEmptyBanner
              onBuySellClick={() =>
                this.props.actions.dialogs.open.trigger({ dialog: BuySellDialog })
              }
            />
          }
        />

        {walletTransactions}

        {uiDialogs.isOpen(ExportTransactionDialog) ? exportDialog : null}

        {uiDialogs.isOpen(AddMemoDialog) ? (
          <AddMemoDialog
            selectedWalletId={selected.publicDeriverId}
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
            plateTextPart={selected.plate.TextPart}
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
              this.props.stores.uiDialogs.getParam<(void) => void>('continuation')?.();
            }}
          />
        ) : null}

        {uiDialogs.isOpen(EditMemoDialog) ? (
          <EditMemoDialog
            selectedWalletId={selected.publicDeriverId}
            existingMemo={(() => {
              if (memos.selectedTransaction == null)
                throw new Error('no selected transaction. Should never happen');
              const txid = memos.selectedTransaction.txid;
              const memo = this.props.stores.memos.txMemoMap.get(walletId)?.get(txid);
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
            plateTextPart={selected.plate.TextPart}
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
                publicDeriverId: selected.publicDeriverId,
                plateTextPart: selected.plate.TextPart,
                txHash,
              });
            }}
          />
        ) : null}
      </Box>
    );

    return this.props.renderLayoutComponent({
      CLASSIC: walletSummaryPageClassic,
      REVAMP: walletSummaryPageRevamp,
    });
  }

  _getThisPageActiveNotification: void => ?Notification = () => {
    let notification = null;

    const { mostRecentActiveNotification } = this.props.stores.uiNotifications;
    const activeNotificationId = mostRecentActiveNotification
      ? mostRecentActiveNotification.id
      : '';
    if (targetNotificationIds.includes(activeNotificationId)) {
      notification = mostRecentActiveNotification;
    }

    return notification;
  };

  openExportTransactionDialog: void => void = () => {
    const { actions } = this.props;
    actions.dialogs.push.trigger({ dialog: ExportTransactionDialog });
  };

  showMemoDialog: ({|
    continuation: void => void,
    dialog: any,
  |}) => void = request => {
    if (this.props.stores.memos.hasSetSelectedExternalStorageProvider) {
      return request.continuation();
    }

    this.props.actions.dialogs.push.trigger({
      dialog: request.dialog,
      params: {
        continuation: request.continuation,
      },
    });
  };

  openDeleteMemoDialog: void => void = () => {
    const { actions } = this.props;
    actions.dialogs.push.trigger({ dialog: DeleteMemoDialog });
  };

  readyToExportHistory: (number) => boolean = publicDeriverId => {
    const delegation = this.props.stores.delegation;
    return !delegation.isRewardWallet(publicDeriverId)
      || delegation.hasRewardHistory(publicDeriverId);
  };
}
export default (withLayout(WalletSummaryPage): ComponentType<Props>);
