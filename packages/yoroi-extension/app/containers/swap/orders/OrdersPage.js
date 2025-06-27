// @flow
import type { Node } from 'react';
import type { CardanoConnectorSignRequest } from '../../../connector/types';
import type { RemoteTokenInfo } from '../../../api/ada/lib/state-fetch/types';
import type { MappedOrder } from './hooks';
import moment from 'moment';
import AssetPair, { tokenImg } from '../../../components/common/assets/AssetPair';
import Table from '../../../components/common/table/Table';
import Tabs from '../../../components/common/tabs/Tabs';
import ExplorableHashContainer from '../../widgets/ExplorableHashContainer';
import NoCompleteOrders from './NoCompleteOrders';
import NoOpenOrders from './NoOpenOrders';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useSwap } from 'legacySwap';
import { useEffect, useState } from 'react';
import { addressBech32ToHex } from '../../../api/ada/lib/cardanoCrypto/utils';
import { getTransactionFeeFromCbor, getTransactionTotalOutputFromCbor } from '../../../api/ada/transactions/utils';
import { SwapPoolLabel } from '../../../components/swap/SwapPoolComponents';
import { fail, forceNonNull, maybe } from '../../../coreUtils';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import { truncateAddressShort } from '../../../utils/formatters';
import { Quantities } from '../../../utils/quantities';
import { useRichOrders } from './hooks';
import { LoadingCompletedOrders, LoadingOpenOrders } from './OrdersPlaceholders';
import { ampli } from '../../../../ampli/index';
import { tokenInfoToAnalyticsFromAndToAssets } from '../swapAnalytics';
import { useStrings } from '../common/useStrings';
import { isHex } from '@emurgo/yoroi-lib/dist/internals/utils/index';
import type { StoresProps } from '../../../stores';
// $FlowIgnore[cannot-resolve-module]
import { useTxReviewModal } from '../../../UI/features/transaction-review/module/ReviewTxProvider';
import { SummaryRow } from '../asset-swap/SwapTxInfo';
// $FlowIgnore[cannot-resolve-module]
import { TransactionResult } from '../../../UI/features/transaction-review/common/types';
// $FlowIgnore[cannot-resolve-module]
import { asQuantity } from '../../../UI/utils/createCurrentWalletInfo';

type ColumnContext = {|
  completedOrders: boolean,
|};

type ColumnValueOrGetter = string | (ColumnContext => string);

type Column = {|
  name: ColumnValueOrGetter,
  align?: ColumnValueOrGetter,
  width?: ColumnValueOrGetter,
  leftPadding?: ColumnValueOrGetter,
  openOrdersOnly?: boolean,
|};

function resolveValueOrGetter(v: ColumnValueOrGetter, ctx: ColumnContext): string {
  return typeof v === 'function' ? v(ctx) : v;
}

export default function SwapOrdersPage(props: StoresProps): Node {
  const [openTxModalAfterColateral, setOpenTxModalAfterColateral] = useState({ open: false, tx: null });
  const { order: orderApi } = useSwap();
  const strings = useStrings();

  const orderColumns: Array<Column> = [
    {
      name: strings.ordersPair,
      align: 'left',
      width: 'auto',
    },
    {
      name: strings.assetPrice,
      width: 'auto',
    },
    {
      name: strings.assetAmount,
      width: '166px',
    },
    {
      name: strings.total,
      width: 'auto',
      openOrdersOnly: true,
    },
    {
      name: strings.dex,
      align: 'left',
      leftPadding: '32px',
      width: 'auto',
      openOrdersOnly: true,
    },
    {
      name: ({ completedOrders }) => (completedOrders ? strings.timeExecuted : strings.timeCreated),
      align: 'left',
      width: 'auto',
    },
    {
      name: strings.txId,
      align: 'left',
      width: 'auto',
    },
  ];

  const { openTxReviewModal, startLoadingTxReview, showTxResultModal, changeModalView, closeTxReviewModal } = useTxReviewModal();

  useEffect(() => {
    if (openTxModalAfterColateral.open) {
      openTxReviewModal({
        modalView: 'transactionReview',
        submitTx: passswordInput =>
          submitTx(
            passswordInput,
            openTxModalAfterColateral.cancelTxCbor,
            openTxModalAfterColateral.signedCollateralReorgTx,
            openTxModalAfterColateral.order
          ),
        //> submitTx(passswordInput, cancelTxCbor, collateralReorgTxObj, order),
        cborTx: openTxModalAfterColateral.cancelTxCbor,
        extraOverviewDetails: {
          title: 'Cancel swap order details',
          onClick: () => changeModalView({ modalView: 'extraDetails' }),
          component: (
            <SwapTxCancelInfo
              formattedFeeValue={openTxModalAfterColateral.txInfo.formattedFeeValue}
              defaultTokenInfo={openTxModalAfterColateral.txInfo.defaultTokenInfo}
              order={openTxModalAfterColateral.order}
              returnValues={openTxModalAfterColateral.txInfo.totalCancelOutput}
              swapPoolLabel={<SwapPoolLabel provider={openTxModalAfterColateral.order.provider} />}
            />
          ),
        },
      });
    }
  }, [openTxModalAfterColateral]);

  const [showCompletedOrders, setShowCompletedOrders] = useState<boolean>(false);

  useEffect(() => {
    // on change open/closed orders tab

    ampli.swapConfirmedPageViewed({
      swap_tab: showCompletedOrders ? strings.ordersCompletedLabel : strings.openOrdersLabel,
    });
  }, [showCompletedOrders]);

  const {
    wallets,
    tokenInfoStore,
    explorers,
    substores: {
      ada: { swapStore },
    },
  } = props.stores;

  const wallet = wallets.selectedOrFail;
  const defaultTokenInfo = tokenInfoStore.getDefaultTokenInfoSummary(wallet.networkId);

  const selectedExplorer = explorers.selectedExplorer.get(wallet.networkId) ?? fail('No explorer for wallet network');

  const fetchTransactionTimestamps = txHashes => swapStore.fetchTransactionTimestamps({ wallet, txHashes });
  const { openOrders, completedOrders, transactionTimestamps, openOrdersLoading, completedOrdersLoading } = useRichOrders(
    defaultTokenInfo,
    fetchTransactionTimestamps
  );

  const txHashToRenderedTimestamp: string => string = txHash => {
    const date = transactionTimestamps[txHash];
    return date == null ? '-' : moment(date).format('MMM D, YYYY H:mm');
  };

  const getComparableDate = txHash => {
    const renderedTimestamp = txHashToRenderedTimestamp(txHash);
    return renderedTimestamp === '-' ? null : moment(renderedTimestamp, 'MMM D, YYYY H:mm').toDate();
  };

  const sortOrdersByDate = orders => {
    return orders.sort((a, b) => {
      const dateA = getComparableDate(a.txId);
      const dateB = getComparableDate(b.txId);
      if (dateA && dateB) {
        return dateB - dateA; // Sort descending
      }
      return dateA ? -1 : 1; // Handle null dates
    });
  };

  const handleTxCancelRequest = async order => {
    try {
      let utxoHex = await swapStore.getCollateralUtxoHexForCancel({
        wallet,
      });

      let collateralReorgTxHex: ?string = null;
      let collateralReorgTxData: ?CardanoConnectorSignRequest = null;
      let hasCollateral = true;
      if (utxoHex == null) {
        const { unsignedTxHex, txData, collateralUtxoHex } = await swapStore.createCollateralReorgForCancel({ wallet });
        collateralReorgTxHex = unsignedTxHex;
        collateralReorgTxData = txData;
        utxoHex = collateralUtxoHex;
        hasCollateral = false;
      }
      return handleCreateCancelTransaction(order, utxoHex, collateralReorgTxHex, collateralReorgTxData, hasCollateral);
    } catch (e) {
      console.error('Failed to prepare a collateral utxo for cancel', e);
      const { unsignedTxHex, txData, collateralUtxoHex } = await swapStore.createCollateralReorgForCancel({ wallet });
      console.log('{ unsignedTxHex, txData, collateralUtxoHex }', { unsignedTxHex, txData, collateralUtxoHex });
    }
  };

  const handleCreateCancelTransaction = async (order, utxoHex, collateralReorgTx, collateralReorgTxData, hasCollateral) => {
    const sender = order.sender;
    if (sender == null) {
      throw new Error('Cannot cancel a completed order (sender == null)');
    }
    try {
      const cancelTxCbor = await orderApi.cancel({
        address: addressBech32ToHex(sender),
        utxos: {
          order: order.utxo,
          collateral: utxoHex,
        },
      });

      if (cancelTxCbor == null || !isHex(cancelTxCbor)) {
        console.error('Failed to receive swap cancel tx from API. Expected cbor hex, got: ', cancelTxCbor);
        // eslint-disable-next-line no-alert
        alert(
          'Unfortunately 3rd party API failed to produce cancellation transaction. Please retry later or report the issue and provide logs.'
        );
        return;
      }

      const totalCancelOutput = getTransactionTotalOutputFromCbor(cancelTxCbor, wallet.balance.getDefaults());
      const formattedFeeValue = Quantities.format(
        getTransactionFeeFromCbor(cancelTxCbor).toString(),
        forceNonNull(defaultTokenInfo.decimals),
        forceNonNull(defaultTokenInfo.decimals)
      );

      const collateralReorgTxObj =
        collateralReorgTx && collateralReorgTxData ? { cbor: collateralReorgTx, txData: collateralReorgTxData } : undefined;

      const tx = {
        formattedFeeValue,
        defaultTokenInfo,
        totalCancelOutput,
      };

      if (hasCollateral) {
        openTxReviewModal({
          modalView: 'transactionReview',
          submitTx: passswordInput => submitTx(passswordInput, cancelTxCbor, collateralReorgTxObj, order),
          cborTx: cancelTxCbor,
          extraOverviewDetails: {
            title: 'Cancel swap order details',
            onClick: () => changeModalView({ modalView: 'extraDetails' }),
            component: (
              <SwapTxCancelInfo
                formattedFeeValue={formattedFeeValue}
                defaultTokenInfo={defaultTokenInfo}
                order={order}
                returnValues={totalCancelOutput}
                swapPoolLabel={<SwapPoolLabel provider={order.provider} />}
              />
            ),
          },
        });
      }
      if (hasCollateral === false) {
        openTxReviewModal({
          modalView: 'collateralCreation',
          submitTx: passswordInput => addColateral(passswordInput, cancelTxCbor, collateralReorgTxObj, order, utxoHex, tx),
          cborTx: collateralReorgTxObj?.cbor,
          operations: {
            components: [
              {
                component: <OperationsDetails />,
                duplicated: false,
              },
            ],
            kind: 'swap-cancel',
          },
        });
      }
    } catch (e) {
      console.log('Failed to prepare a cancellation transaction', e);
    }
  };

  const submitTx = async (passswordInput, cancelTxCbor, signedCollateralReorgTx, order: any) => {
    try {
      startLoadingTxReview();
      const { signedTxHex: signedCancelTx } = await props.stores.transactionProcessingStore.adaSignTransactionHexFromWallet({
        wallet,
        transactionHex: cancelTxCbor,
        password: passswordInput,
      });
      const signedTransactionHexes: any =
        signedCollateralReorgTx != null ? [signedCollateralReorgTx, signedCancelTx] : [signedCancelTx];
      await swapStore.executeTransactionHexes({
        wallet,
        signedTransactionHexes,
      });
      showTxResultModal(TransactionResult.SUCCESS);

      try {
        ampli.swapCancelationSubmitted({
          ...tokenInfoToAnalyticsFromAndToAssets(order.from.token, order.to.token),
          from_amount: Number(Quantities.format(order.from.quantity, order.from.token.decimals || 0)),
          to_amount: Number(Quantities.format(order.to.quantity, order.to.token.decimals || 0)),
          pool_source: order.provider,
        });
      } catch (e) {
        console.log('analytics fail', e);
      }
    } catch (error) {
      console.log('Failed to sign transaction', error);
      showTxResultModal(TransactionResult.FAIL);
    }
  };
  const addColateral = async (passswordInput, cancelTxCbor, collateralReorgTxObj, order: any, utxoHex, tx: any) => {
    startLoadingTxReview();
    if (collateralReorgTxObj == null) {
      console.log('Reorg transaction is not available. Ignoring.');
      return;
    }

    try {
      const { signedTxHex: signedCollateralReorgTx } = await props.stores.transactionProcessingStore.adaSignTransactionHexFromWallet({
        wallet,
        transactionHex: collateralReorgTxObj.cbor,
        password: passswordInput,
      });

      setOpenTxModalAfterColateral({
        open: true,
        cancelTxCbor,
        signedCollateralReorgTx,
        collateralReorgTxObj,
        txInfo: tx,
        order,
      });
      closeTxReviewModal();
    } catch (error) {
      console.log('Failed to sign collateral transaction', error);
    }
  };

  const columnContext = { completedOrders: showCompletedOrders };
  const columnKeys = orderColumns.map(c => resolveValueOrGetter(c.name, columnContext));
  const columnNames = orderColumns.map(c =>
    showCompletedOrders && c.openOrdersOnly ? '' : resolveValueOrGetter(c.name, columnContext)
  );
  const columnAlignment = orderColumns.map(c => resolveValueOrGetter(c.align ?? '', columnContext));
  const columnLeftPaddings = orderColumns.map(c => resolveValueOrGetter(c.leftPadding ?? '', columnContext));
  const gridTemplateColumns = orderColumns.map(c => resolveValueOrGetter(c.width ?? 'auto', columnContext)).join(' ');

  const isDisplayOpenOrdersEmpty = !showCompletedOrders && openOrders?.length === 0;
  const isDisplayCompletedOrdersEmpty = showCompletedOrders && completedOrders?.length === 0;
  const safeColumnNames = isDisplayOpenOrdersEmpty || isDisplayCompletedOrdersEmpty ? [] : columnNames;

  const sortedCompletedOrders = sortOrdersByDate(completedOrders);

  return (
    <>
      <Box sx={{ mx: '24px' }}>
        <Box sx={{ my: '24px' }}>
          <Tabs
            tabs={[
              {
                label: strings.openOrdersLabel,
                isActive: !showCompletedOrders,
                onClick: () => setShowCompletedOrders(false),
              },
              {
                label: strings.ordersCompletedLabel,
                isActive: showCompletedOrders,
                onClick: () => setShowCompletedOrders(true),
              },
            ]}
          />
        </Box>
        <Table
          columnKeys={columnKeys}
          columnNames={safeColumnNames}
          columnAlignment={columnAlignment}
          columnLeftPaddings={columnLeftPaddings}
          gridTemplateColumns={gridTemplateColumns}
          columnGap="0px"
          columnRightPaddings={['0px', '0px', '0px', '0px', '0px', '0px', '0px']}
        >
          {showCompletedOrders
            ? sortedCompletedOrders.map(order => (
                <OrderRow
                  key={order.txId}
                  order={order}
                  defaultTokenInfo={defaultTokenInfo}
                  selectedExplorer={selectedExplorer}
                  txHashToRenderedTimestamp={txHashToRenderedTimestamp}
                />
              ))
            : openOrders.map(order => (
                <OrderRow
                  key={order.utxo}
                  order={order}
                  defaultTokenInfo={defaultTokenInfo}
                  selectedExplorer={selectedExplorer}
                  handleCancel={() => handleTxCancelRequest(order)}
                  txHashToRenderedTimestamp={txHashToRenderedTimestamp}
                />
              ))}
        </Table>
      </Box>
      {/* {cancellationState && (
        <CancelSwapOrderDialog
          order={cancellationState.order}
          reorgTxData={cancellationState.collateralReorgTx?.txData}
          isSubmitting={Boolean(cancellationState.isSubmitting)}
          transactionParams={maybe(cancellationState.tx, tx => ({
            formattedFee: tx.formattedFee,
            returnValues: tx.formattedReturn,
          }))}
          onReorgConfirm={handleReorgConfirm}
          onCancelOrder={handleCancelConfirm}
          onDialogClose={() => setCancellationState(null)}
          defaultTokenInfo={defaultTokenInfo}
          getTokenInfo={genLookupOrFail(tokenInfoStore.tokenInfo)}
          selectedExplorer={selectedExplorer}
          submissionError={null}
          walletType={wallet.type}
          hwWalletError={null}
        />
      )} */}
      {!showCompletedOrders && openOrdersLoading && <LoadingOpenOrders columnLeftPaddings={columnLeftPaddings} />}
      {showCompletedOrders && completedOrdersLoading && <LoadingCompletedOrders columnLeftPaddings={columnLeftPaddings} />}
      {!openOrdersLoading && isDisplayOpenOrdersEmpty && <NoOpenOrders />}
      {!completedOrdersLoading && isDisplayCompletedOrdersEmpty && <NoCompleteOrders />}
    </>
  );
}

const OrderRow = ({
  order,
  defaultTokenInfo,
  selectedExplorer,
  handleCancel,
  txHashToRenderedTimestamp,
}: {|
  order: MappedOrder,
  defaultTokenInfo: RemoteTokenInfo,
  selectedExplorer: SelectedExplorer,
  handleCancel?: () => Promise<void>,
  txHashToRenderedTimestamp: string => string,
|}) => {
  const strings = useStrings();
  return (
    <>
      <AssetPair sx={{ py: '20px' }} from={order.from.token} to={order.to.token} defaultTokenInfo={defaultTokenInfo} />
      <Box textAlign="right">{order.price}</Box>
      <Box textAlign="right">{order.amount}</Box>
      <Box textAlign="right">
        {(order.totalValues ?? []).map(v => (
          <Box key={v.ticker}>
            {v.formattedValue} {v.ticker}
          </Box>
        ))}
      </Box>
      <Box display="flex" pl="32px" justifyContent="flex-start" alignItems="center" gap="8px">
        {maybe(order.provider, provider => (
          <SwapPoolLabel provider={provider} />
        ))}
      </Box>
      <Box textAlign="left">{txHashToRenderedTimestamp(order.txId)}</Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" gap="12px">
        <ExplorableHashContainer selectedExplorer={selectedExplorer} linkType="transaction" hash={order.txId} primary>
          <Typography variant="body1">{truncateAddressShort(order.txId)}</Typography>
        </ExplorableHashContainer>
        {maybe(handleCancel, f => (
          <Box>
            <Button onClick={f} variant="tertiary" color="grayscale">
              {strings.cancel}
            </Button>
          </Box>
        ))}
      </Box>
    </>
  );
};

const SwapTxCancelInfo = ({ defaultTokenInfo, order, swapPoolLabel, formattedFeeValue }: any) => {
  return (
    <Box p="24px">
      <Box display="flex" gap="16px" flexDirection="column" mb="24px">
        <Box>
          <Box>
            <AssetAndAmountRow order={order} defaultTokenInfo={defaultTokenInfo} type="from" />
          </Box>
        </Box>
        <Box>
          <Typography component="div" variant="body1" color="ds.gray_500" mb="14px">
            Swap to
          </Typography>
          <Box>
            <AssetAndAmountRow order={order} defaultTokenInfo={defaultTokenInfo} type="to" />
          </Box>
        </Box>
      </Box>
      <Stack direction="column" gap="8px">
        <SummaryRow col1="DEX">{swapPoolLabel}</SummaryRow>
        <SummaryRow col1="Asset Price">
          {order.price} {order.from.token.ticker}/{order.to.token.ticker}
        </SummaryRow>
        <SummaryRow col1="Asset amount">
          {order.amount} {order.to.token.ticker}
        </SummaryRow>
        <SummaryRow col1="Total returned">{order?.totalValues ? order.totalValues[0].formattedValue : '-'}</SummaryRow>
        <SummaryRow col1="Cancellation Fee">
          {formattedFeeValue} {order.from.token.ticker}
        </SummaryRow>
      </Stack>
    </Box>
  );
};

const AssetAndAmountRow = ({ order, defaultTokenInfo, type }) => {
  const assetName = type === 'from' ? order.from?.token.ticker ?? '-' : order.to?.token.ticker ?? '-';
  const assetFingerprint = type === 'from' ? order.from?.token.fingerprint ?? '-' : order.to?.token.fingerprint ?? '-';
  const assetImage =
    type === 'from'
      ? tokenImg(order.from.token, defaultTokenInfo, '48px', '48px')
      : tokenImg(order.to.token, defaultTokenInfo, '48px', '48px');

  const assetAmount =
    type === 'from'
      ? asQuantity(order.from.quantity).shiftedBy(-order.from.token.decimals)
      : asQuantity(order.to.quantity).shiftedBy(-order.to.token.decimals);

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" justifyContent="flex-start">
        <Stack direction="row" justifyContent="flex-start" gap="8px">
          <Box>{assetImage}</Box>
          <Stack direction="column">
            <Typography variant="body1" color="ds.gray_900">
              {assetName}
            </Typography>
            <Typography variant="body2" color="ds.gray_600">
              {truncateAddressShort(assetFingerprint) ?? 'Cardano'}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
      <Stack>
        <Typography variant="body1" color="ds.gray_max">
          {String(assetAmount)} {assetName}
        </Typography>
      </Stack>
    </Stack>
  );
};

const OperationsDetails = () => {
  return (
    <Stack direction="column" spacing={16}>
      <Stack direction="row" justifyContent="space-between">
        <Typography color="ds.text_gray_low">Collateral creation</Typography>
      </Stack>
    </Stack>
  );
};
