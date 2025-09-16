import React, { useState } from 'react';
import Tabs from '../../../../../components/common/tabs/Tabs';
import Table from '../../../../../components/common/table/Table';
import { fail, maybe } from '../../../../../coreUtils';
import { SwapPoolLabel } from '../../../../../components/swap/SwapPoolComponents';
import ExplorableHashContainer from '../../../../../containers/widgets/ExplorableHashContainer';
import { truncateAddressShort } from '../../../../../utils/formatters';

import { Box, Button, Typography } from '@mui/material';
import { Portfolio, Swap } from '@yoroi/types';
import AssetPair from './AssetPair';
import { useIntl } from 'react-intl';
import { useSwapRevamp } from '../../module/SwapContextProvider';
import { useStrings } from '../../common/hooks/useStrings';
import { ProtocolAvatar } from '../../common/components/ProtocolAvatar/ProtocolAvatar';

type Column = {
  name: ColumnValueOrGetter;
  align?: ColumnValueOrGetter;
  width?: ColumnValueOrGetter;
  leftPadding?: ColumnValueOrGetter;
  openOrdersOnly?: boolean;
};

type ColumnContext = {
  completedOrders: boolean;
};

type ColumnValueOrGetter = string | ((context: ColumnContext) => string);

function resolveValueOrGetter(v: ColumnValueOrGetter, ctx: ColumnContext): string {
  return typeof v === 'function' ? v(ctx) : v;
}

type Props = {
  stores: any;
};

export const SwapOrders = (props: Props) => {
  const { wallets, explorers } = props.stores;

  const wallet = wallets.selectedOrFail;
  const selectedExplorer = explorers.selectedExplorer.get(wallet.networkId) ?? fail('No explorer for wallet network');

  const {
    swapForm: { orders },
    primaryTokenInfo,
  } = useSwapRevamp();

  const [showCompletedOrders, setShowCompletedOrders] = useState(false);
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
      name: strings.routeLabel,
      align: 'left',
      leftPadding: '32px',
      width: 'auto',
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

  const completedOrders = orders.filter(order => order.status !== 'open');
  const openOrders = orders.filter(order => order.status === 'open');

  console.log('ORDER', { openOrders, completedOrders });

  const columnContext = { completedOrders: showCompletedOrders };
  const visibleColumns = React.useMemo(
    () => orderColumns.filter(c => !(showCompletedOrders && c.openOrdersOnly)),
    [orderColumns, showCompletedOrders]
  );

  const columnNames = visibleColumns.map(c => resolveValueOrGetter(c.name, columnContext));
  const columnKeys = visibleColumns.map((c, i) => (typeof c as any).id ?? `${resolveValueOrGetter(c.name, columnContext)}__${i}`);
  const columnAlignment = visibleColumns.map(c => resolveValueOrGetter(c.align ?? '', columnContext));
  const columnLeftPaddings = visibleColumns.map(c => resolveValueOrGetter(c.leftPadding ?? '', columnContext));
  const gridTemplateColumns = visibleColumns.map(c => resolveValueOrGetter(c.width ?? 'auto', columnContext)).join(' ');

  const isDisplayOpenOrdersEmpty = !showCompletedOrders && openOrders?.length === 0;
  const isDisplayCompletedOrdersEmpty = showCompletedOrders && completedOrders?.length === 0;
  const isEmptyView = isDisplayOpenOrdersEmpty || isDisplayCompletedOrdersEmpty;

  const safeColumnNames = isEmptyView ? [] : columnNames;
  const safeColumnKeys = isEmptyView ? [] : columnKeys;
  const safeColumnAlignment = isEmptyView ? [] : columnAlignment;
  const safeColumnLeftPaddings = isEmptyView ? [] : columnLeftPaddings;
  const safeGridTemplateColumns = isEmptyView ? '' : gridTemplateColumns;

  const columnRightPaddings = isEmptyView ? [] : new Array(visibleColumns.length).fill('0px');

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
          columnKeys={safeColumnKeys}
          columnNames={safeColumnNames}
          columnAlignment={safeColumnAlignment}
          columnLeftPaddings={safeColumnLeftPaddings}
          gridTemplateColumns={safeGridTemplateColumns}
          columnGap="0px"
          columnRightPaddings={columnRightPaddings}
        >
          {showCompletedOrders
            ? completedOrders.map(order => (
                <OrderRow
                  key={order.txHash}
                  order={order}
                  defaultTokenInfo={primaryTokenInfo}
                  selectedExplorer={selectedExplorer}
                />
              ))
            : openOrders.map(order => (
                <OrderRow
                  key={order.txHash}
                  order={order}
                  defaultTokenInfo={primaryTokenInfo}
                  selectedExplorer={selectedExplorer}
                  handleCancel={async () => console.log('handleCancel')}
                  openOrdersOnly
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
      {/* {!showCompletedOrders && openOrdersLoading && <LoadingOpenOrders columnLeftPaddings={columnLeftPaddings} />}
        {showCompletedOrders && completedOrdersLoading && <LoadingCompletedOrders columnLeftPaddings={columnLeftPaddings} />}
        {!openOrdersLoading && isDisplayOpenOrdersEmpty && <NoOpenOrders />}
        {!completedOrdersLoading && isDisplayCompletedOrdersEmpty && <NoCompleteOrders />} */}
    </>
  );
};

interface OrderRowProps {
  order: Swap.Order;
  defaultTokenInfo: Portfolio.Token.Info;
  selectedExplorer: any;
  handleCancel?: () => Promise<void>;
  openOrdersOnly?: boolean;
}

const OrderRow = ({ order, defaultTokenInfo, selectedExplorer, openOrdersOnly = false, handleCancel }: OrderRowProps) => {
  const tokenName = (token?: Portfolio.Token.Info) => token?.ticker ?? token?.name ?? token?.id ?? defaultTokenInfo.ticker;
  const strings = useStrings();
  const intl = useIntl();
  const { tokenInfos } = useSwapRevamp();
  const tokenOut = tokenInfos.get(order.tokenOut);
  const tokenIn = tokenInfos.get(order.tokenIn);

  const amountOut = order.actualAmountOut === 0 ? order.expectedAmountOut : order.actualAmountOut;
  const priceCalc = amountOut === 0 ? 0 : order.amountIn / amountOut;
  const roundedPrice = priceCalc.toFixed(tokenOut?.decimals ?? 0).replace(/\.0+$/, '');
  const price = roundedPrice !== '0' ? roundedPrice : priceCalc.toFixed(6);

  const priceStr = `1 ${tokenName(tokenIn)} = ${price} ${tokenName(tokenOut)}`;

  const amountOutStr = `${Number(amountOut.toFixed(tokenOut?.decimals ?? 0))} ${tokenName(tokenOut)}`;

  // const lastTxHash = order.updateTxHash ?? order.txHash ?? '';
  // const shortenedTxHash = `${truncateString({ value: lastTxHash, maxLength: 22 })}#${order.outputIndex ?? 0}`;
  const totalStr = `${order.amountIn} ${tokenName(tokenIn)}`;

  return (
    <>
      <AssetPair sx={{ py: '20px' }} defaultTokenInfo={defaultTokenInfo} tokenInID={order.tokenIn} tokenOutID={order.tokenOut} />
      <Box textAlign="right">{priceStr}</Box>
      <Box textAlign="right">{amountOutStr}</Box>
      {openOrdersOnly && <Box textAlign="right">{totalStr} </Box>}
      <Box display="flex" pl="32px" justifyContent="flex-start" alignItems="center" gap="8px">
        {maybe(order.protocol, protocol => (
          // <SwapPoolLabel provider={protocol} />
          <ProtocolAvatar protocol={protocol} />
        ))}
      </Box>
      {
        <Box textAlign="left">
          {order.placedAt ? intl.formatDate(new Date(order.placedAt), { dateStyle: 'medium', timeStyle: 'short' }) : null}
        </Box>
      }
      <Box display="flex" justifyContent="space-between" alignItems="center" gap="12px">
        <ExplorableHashContainer selectedExplorer={selectedExplorer} linkType="transaction" hash={order.txHash} primary>
          <Typography variant="body1">{truncateAddressShort(order.txHash)}</Typography>
        </ExplorableHashContainer>
        {maybe(handleCancel, f => (
          <Box>
            <Button onClick={f}>{strings.cancel}</Button>
          </Box>
        ))}
      </Box>
    </>
  );
};
