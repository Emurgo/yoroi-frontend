// @flow
import { Box, Button } from '@mui/material';
import { useSwap } from '@yoroi/swap';
import moment from 'moment';
import type { Node } from 'react';
import { useState } from 'react';
import { addressBech32ToHex } from '../../../api/ada/lib/cardanoCrypto/utils';
import { signTransactionHex } from '../../../api/ada/transactions/signTransactionHex';
import {
  getTransactionFeeFromCbor,
  getTransactionTotalOutputFromCbor,
} from '../../../api/ada/transactions/utils';
import AssetPair from '../../../components/common/assets/AssetPair';
import Table from '../../../components/common/table/Table';
import Tabs from '../../../components/common/tabs/Tabs';
import CancelSwapOrderDialog from '../../../components/swap/CancelOrderDialog';
import { SwapPoolLabel } from '../../../components/swap/SwapPoolComponents';
import type { CardanoConnectorSignRequest } from '../../../connector/types';
import { fail, forceNonNull, maybe } from '../../../coreUtils';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import { genLookupOrFail } from '../../../stores/stateless/tokenHelpers';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import { truncateAddressShort } from '../../../utils/formatters';
import { Quantities } from '../../../utils/quantities';
import ExplorableHashContainer from '../../widgets/ExplorableHashContainer';
import { useRichOrders } from './hooks';
import { createFormattedTokenValues } from './util';
import type { RemoteTokenInfo } from '../../../api/ada/lib/state-fetch/types';
import type { MappedOrder } from './hooks';
import type { FormattedTokenValue } from './util';

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

const orderColumns: Array<Column> = [
  {
    name: 'Pair (From / To)',
    align: 'left',
    width: '176px',
  },
  {
    name: 'Asset price',
    width: '150px',
  },
  {
    name: 'Asset amount',
    width: '166px',
  },
  {
    name: 'Total',
    width: '150px',
    openOrdersOnly: true,
  },
  {
    name: 'DEX',
    align: 'left',
    leftPadding: '32px',
    width: '216px',
    openOrdersOnly: true,
  },
  {
    name: ({ completedOrders }) => (completedOrders ? 'Time executed' : 'Time created'),
    align: 'left',
    width: '240px',
  },
  {
    name: 'Transaction ID',
    align: 'left',
    width: 'auto',
  },
];

export default function SwapOrdersPage(props: StoresAndActionsProps): Node {
  const { order: orderApi } = useSwap();

  const [showCompletedOrders, setShowCompletedOrders] = useState<boolean>(false);
  const [cancellationState, setCancellationState] = useState<?{|
    order: any,
    collateralReorgTx?: {| cbor: string, txData: CardanoConnectorSignRequest |},
    signedCollateralReorgTx?: string,
    tx: ?{| cbor: string, formattedFee: string, formattedReturn: Array<FormattedTokenValue> |},
    isSubmitting?: boolean,
  |}>(null);

  const {
    wallets,
    tokenInfoStore,
    explorers,
    substores: {
      ada: { swapStore },
    },
  } = props.stores;

  const wallet = wallets.selectedOrFail;
  const network = wallet.getParent().getNetworkInfo();
  const walletVariant = wallet.getParent().getWalletVariant();
  const defaultTokenInfo = tokenInfoStore.getDefaultTokenInfoSummary(network.NetworkId);

  const selectedExplorer =
    explorers.selectedExplorer.get(network.NetworkId) ?? fail('No explorer for wallet network');

  const fetchTransactionTimestamps = txHashes =>
    swapStore.fetchTransactionTimestamps({ wallet, txHashes });
  let { openOrders, completedOrders, transactionTimestamps } = useRichOrders(
    defaultTokenInfo,
    fetchTransactionTimestamps
  );

  const txHashToRenderedTimestamp: string => string = txHash => {
    const date = transactionTimestamps[txHash];
    return date == null ? '-' : moment(date).format('MMM D, YYYY H:mm');
  };

  const handleCancelRequest = async order => {
    setCancellationState({ order, tx: null });
    try {
      let utxoHex = await swapStore.getCollateralUtxoHexForCancel({
        wallet,
      });
      let collateralReorgTxHex: ?string = null;
      let collateralReorgTxData: ?CardanoConnectorSignRequest = null;
      if (utxoHex == null) {
        const {
          unsignedTxHex,
          txData,
          collateralUtxoHex,
        } = await swapStore.createCollateralReorgForCancel({ wallet });
        collateralReorgTxHex = unsignedTxHex;
        collateralReorgTxData = txData;
        utxoHex = collateralUtxoHex;
      }
      return handleCreateCancelTransaction(
        order,
        utxoHex,
        collateralReorgTxHex,
        collateralReorgTxData
      );
    } catch (e) {
      console.error('Failed to prepare a collateral utxo for cancel', e);
      throw e;
    }
  };

  const handleCreateCancelTransaction = async (
    order,
    utxoHex,
    collateralReorgTx,
    collateralReorgTxData
  ) => {
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
      const totalCancelOutput = getTransactionTotalOutputFromCbor(
        cancelTxCbor,
        wallet.getParent().getDefaultToken()
      );
      const formattedCancelValues = createFormattedTokenValues({
        entries: totalCancelOutput.entries().map(e => ({
          id: e.identifier,
          amount: e.amount.toString(),
        })),
        from: order.from,
        to: order.to,
        defaultTokenInfo,
      });
      const formattedFeeValue = Quantities.format(
        getTransactionFeeFromCbor(cancelTxCbor).toString(),
        forceNonNull(defaultTokenInfo.decimals),
        forceNonNull(defaultTokenInfo.decimals)
      );
      setCancellationState(s => {
        // State might have been reset to null in the meantime
        if (s == null) return null;
        // State might have been recreated for another order in the meantime
        if (s.order.utxo !== order.utxo) return s;
        return {
          order: s.order,
          collateralReorgTx:
            collateralReorgTx && collateralReorgTxData
              ? { cbor: collateralReorgTx, txData: collateralReorgTxData }
              : undefined,
          tx: {
            cbor: cancelTxCbor,
            formattedFee: formattedFeeValue,
            formattedReturn: formattedCancelValues,
          },
        };
      });
    } catch (e) {
      console.error('Failed to prepare a cancellation transaction', e);
      throw e;
    }
  };

  const handleReorgConfirm = async (cancelledOrder: any, password: string) => {
    const { order, collateralReorgTx, tx, isSubmitting } = cancellationState ?? {};
    if (isSubmitting) {
      console.log('Cancellation is already submitting. Ignoring.');
    }
    if (order !== cancelledOrder) {
      console.log('Cancellation state order mismatch. Ignoring.');
      return;
    }
    if (collateralReorgTx == null) {
      console.log('Reorg transaction is not available. Ignoring.');
      return;
    }
    const signedCollateralReorgTx = await signTransactionHex(
      wallet,
      password,
      collateralReorgTx.cbor
    );
    setCancellationState({ order, signedCollateralReorgTx, tx });
  };

  const handleCancelConfirm = async (cancelledOrder: any, password: string) => {
    const { order, signedCollateralReorgTx, tx, isSubmitting } = cancellationState ?? {};
    if (isSubmitting) {
      console.log('Cancellation is already submitting. Ignoring.');
    }
    if (order !== cancelledOrder) {
      console.log('Cancellation state order mismatch. Ignoring.');
      return;
    }
    if (tx == null) {
      console.log('Cancellation transaction is not available. Ignoring.');
      return;
    }
    setCancellationState({ order, signedCollateralReorgTx, tx, isSubmitting: true });
    const signedCancelTx = await signTransactionHex(wallet, password, tx.cbor);
    const signedTransactionHexes =
      signedCollateralReorgTx != null
        ? [signedCollateralReorgTx, signedCancelTx]
        : [signedCancelTx];
    await swapStore.executeTransactionHexes({
      wallet,
      signedTransactionHexes,
    });
    setCancellationState(null);
  };

  const columnContext = { completedOrders: showCompletedOrders };
  const columnKeys = orderColumns.map(c => resolveValueOrGetter(c.name, columnContext));
  const columnNames = orderColumns.map(c =>
    showCompletedOrders && c.openOrdersOnly ? '' : resolveValueOrGetter(c.name, columnContext)
  );
  const columnAlignment = orderColumns.map(c => resolveValueOrGetter(c.align ?? '', columnContext));
  const columnLeftPaddings = orderColumns.map(c =>
    resolveValueOrGetter(c.leftPadding ?? '', columnContext)
  );
  const gridTemplateColumns = orderColumns
    .map(c => resolveValueOrGetter(c.width ?? 'auto', columnContext))
    .join(' ');

  return (
    <>
      <Box sx={{ mx: '24px' }}>
        <Box sx={{ my: '24px' }}>
          <Tabs
            tabs={[
              {
                label: 'Open orders',
                isActive: !showCompletedOrders,
                onClick: () => setShowCompletedOrders(false),
              },
              {
                label: 'Completed orders',
                isActive: showCompletedOrders,
                onClick: () => setShowCompletedOrders(true),
              },
            ]}
          />
        </Box>
        <Table
          columnKeys={columnKeys}
          columnNames={columnNames}
          columnAlignment={columnAlignment}
          columnLeftPaddings={columnLeftPaddings}
          gridTemplateColumns={gridTemplateColumns}
          columnGap="0px"
          columnRightPaddings={['0px', '0px', '0px', '0px', '0px', '0px', '0px']}
        >
          {showCompletedOrders
            ? completedOrders.map(order => (
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
                  handleCancel={() => handleCancelRequest(order)}
                  txHashToRenderedTimestamp={txHashToRenderedTimestamp}
                />
              ))}
        </Table>
      </Box>
      {cancellationState && (
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
          walletType={walletVariant}
          hwWalletError={null}
        />
      )}
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
  return (
    <>
      <AssetPair
        sx={{ py: '20px' }}
        from={order.from.token}
        to={order.to.token}
        defaultTokenInfo={defaultTokenInfo}
      />
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
        <ExplorableHashContainer
          selectedExplorer={selectedExplorer}
          linkType="transaction"
          hash={order.txId}
        >
          <span>{truncateAddressShort(order.txId)}</span>
        </ExplorableHashContainer>
        {maybe(handleCancel, f => (
          <Box>
            <Button onClick={f} variant="tertiary" color="grayscale">
              Cancel
            </Button>
          </Box>
        ))}
      </Box>
    </>
  );
};
