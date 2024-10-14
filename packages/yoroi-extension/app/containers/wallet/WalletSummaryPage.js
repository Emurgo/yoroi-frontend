// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, runInAction } from 'mobx';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import { ROUTES } from '../../routes-config';
import Dialog from '../../components/widgets/Dialog';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import globalMessages from '../../i18n/global-messages';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import WalletTransactionsListRevamp from '../../components/wallet/transactions/WalletTransactionsListRevamp';
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
import WalletSummaryRevamp from '../../components/wallet/summary/WalletSummaryRevamp';
import BuySellDialog from '../../components/buySell/BuySellDialog';
import WalletEmptyBanner from './WalletEmptyBanner';
import { Box } from '@mui/material';
import { getNetworkById } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { noop } from '../../coreUtils';

@observer
export default class WalletSummaryPage extends Component<StoresAndActionsProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };
  @observable notificationElementId: string = '';

  render(): Node {
    const { intl } = this.context;
    const { stores } = this.props;
    const {
      hasAny,
      hasMoreToLoad,
      recent,
      isLoadingMore,
      unconfirmedAmount,
      isExporting,
      exportError,
      isLoading,
    } = stores.transactions;
    const { selected } = stores.wallets;
    let walletTransactions = null;
    // Guard against potential null values
    if (selected == null) {
      Logger.error('[WalletSummaryPage::render] Active wallet required');
      return null;
    }
    noop(stores.delegation.checkPoolTransition());

    const walletId = selected.plate.TextPart;

    const { uiDialogs, profile, memos, uiNotifications } = stores;

    const tooltipNotification = {
      duration: config.wallets.ADDRESS_COPY_TOOLTIP_NOTIFICATION_DURATION,
      message: globalMessages.copyTooltipMessage,
    };

    const onCopyAddressTooltip = (address, elementId) => {
      if (!uiNotifications.isOpen(elementId)) {
        runInAction(() => {
          this.notificationElementId = elementId;
        });
        uiNotifications.open({
          id: elementId,
          duration: tooltipNotification.duration,
          message: tooltipNotification.message,
        });
      }
    };
    const notificationToolTip = uiNotifications.getTooltipActiveNotification(this.notificationElementId);

    if (recent.length > 0) {
      if (isLoading || hasAny) {
        walletTransactions = (
          <WalletTransactionsListRevamp
            transactions={recent}
            lastSyncBlock={selected.lastSyncInfo.Height}
            memoMap={stores.memos.txMemoMap.get(walletId) || new Map()}
            selectedExplorer={
              stores.explorers.selectedExplorer.get(
                selected.networkId
              ) ??
              (() => {
                throw new Error('No explorer for wallet network');
              })()
            }
            isLoadingTransactions={isLoadingMore}
            hasMoreToLoad={hasMoreToLoad}
            onLoadMore={() => stores.transactions.loadMoreTransactions(selected)}
            assuranceMode={selected.assuranceMode}
            shouldHideBalance={profile.shouldHideBalance}
            onAddMemo={transaction =>
              this.showMemoDialog({
                dialog: MemoNoExternalStorageDialog,
                continuation: () => {
                  stores.memos.selectTransaction({ tx: transaction });
                  stores.uiDialogs.push({ dialog: AddMemoDialog });
                },
              })
            }
            onEditMemo={transaction =>
              this.showMemoDialog({
                dialog: MemoNoExternalStorageDialog,
                continuation: () => {
                  stores.memos.selectTransaction({ tx: transaction });
                  stores.uiDialogs.push({ dialog: EditMemoDialog });
                },
              })
            }
            unitOfAccountSetting={profile.unitOfAccount}
            getHistoricalPrice={stores.coinPriceStore.getHistoricalPrice}
            getTokenInfo={genLookupOrNull(stores.tokenInfoStore.tokenInfo)}
            addressLookup={genAddressLookup(
              selected.networkId,
              intl,
              route => stores.app.goToRoute({ route }),
              stores.addresses.addressSubgroupMap
            )}
            onCopyAddressTooltip={onCopyAddressTooltip}
            notification={notificationToolTip}
            addressToDisplayString={addr =>
              addressToDisplayString(addr, getNetworkById(selected.networkId))
            }
            complexityLevel={stores.profile.selectedComplexityLevel}
            id="wallet:transaction-transactionsList-box"
          />
        );
      } else {
        walletTransactions = null;
      }
    }

    let exportDialog = (
      <Dialog title={intl.formatMessage(globalMessages.processingLabel)} closeOnOverlayClick={false}>
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
            stores.transactions.exportTransactionsToFile({
              exportRequest,
              publicDeriver: selected,
            })
          }
          toggleIncludeTxIds={stores.transactions.toggleIncludeTxIds}
          shouldIncludeTxIds={stores.transactions.shouldIncludeTxIds}
          cancel={stores.transactions.closeExportTransactionDialog}
        />
      );
    }

    return (
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
          getTokenInfo={genLookupOrFail(stores.tokenInfoStore.tokenInfo)}
          getHistoricalPrice={stores.coinPriceStore.getHistoricalPrice}
          shouldShowEmptyBanner={!isLoading && !hasAny}
          emptyBannerComponent={
            <WalletEmptyBanner
              onBuySellClick={() => this.props.actions.dialogs.open.trigger({ dialog: BuySellDialog })}/>
          }
        />

        {walletTransactions}

        {uiDialogs.isOpen(ExportTransactionDialog) ? exportDialog : null}

        {uiDialogs.isOpen(AddMemoDialog) ? (
          <AddMemoDialog
            selectedWalletId={selected.publicDeriverId}
            selectedTransaction={(() => {
              if (memos.selectedTransaction == null) throw new Error('no selected transaction. Should never happen');
              return memos.selectedTransaction;
            })()}
            error={memos.error}
            onCancel={stores.memos.closeMemoDialog}
            onSubmit={values => {
              return stores.memos.saveTxMemo(values);
            }}
            plateTextPart={selected.plate.TextPart}
          />
        ) : null}

        {uiDialogs.isOpen(MemoNoExternalStorageDialog) ? (
          <MemoNoExternalStorageDialog
            onCancel={stores.memos.closeMemoDialog}
            addExternal={() => {
              stores.memos.closeMemoDialog();
              stores.app.goToRoute({ route: ROUTES.SETTINGS.EXTERNAL_STORAGE });
            }}
            onAcknowledge={() => {
              stores.uiDialogs.getParam<(void) => void>('continuation')?.();
            }}
          />
        ) : null}

        {uiDialogs.isOpen(EditMemoDialog) ? (
          <EditMemoDialog
            selectedWalletId={selected.publicDeriverId}
            existingMemo={(() => {
              if (memos.selectedTransaction == null) throw new Error('no selected transaction. Should never happen');
              const txid = memos.selectedTransaction.txid;
              const memo = stores.memos.txMemoMap.get(walletId)?.get(txid);
              if (memo == null) throw new Error('Should never happen');
              return memo;
            })()}
            error={memos.error}
            onCancel={stores.memos.closeMemoDialog}
            onClickDelete={this.openDeleteMemoDialog}
            onSubmit={values => {
              return stores.memos.updateTxMemo(values);
            }}
            plateTextPart={selected.plate.TextPart}
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
              stores.memos.closeMemoDialog();
            }}
            onClose={stores.memos.closeMemoDialog}
            onDelete={txHash => {
              return stores.memos.deleteTxMemo({
                publicDeriverId: selected.publicDeriverId,
                plateTextPart: selected.plate.TextPart,
                txHash,
              });
            }}
          />
        ) : null}
      </Box>
    );
  }

  openExportTransactionDialog: void => void = () => {
    const { stores } = this.props;
    stores.uiDialogs.push({ dialog: ExportTransactionDialog });
  };

  showMemoDialog: ({|
    continuation: void => void,
    dialog: any,
  |}) => void = request => {
    if (this.props.stores.memos.hasSetSelectedExternalStorageProvider) {
      return request.continuation();
    }

    this.props.stores.uiDialogs.push({
      dialog: request.dialog,
      params: {
        continuation: request.continuation,
      },
    });
  };

  openDeleteMemoDialog: void => void = () => {
    const { stores } = this.props;
    stores.uiDialogs.push({ dialog: DeleteMemoDialog });
  };

  readyToExportHistory: (number) => boolean = publicDeriverId => {
    const delegation = this.props.stores.delegation;
    return !delegation.isRewardWallet(publicDeriverId)
      || delegation.hasRewardHistory(publicDeriverId);
  };
}
