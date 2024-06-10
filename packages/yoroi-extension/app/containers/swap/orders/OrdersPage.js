// @flow
import type { Node } from 'react';
import { useState } from 'react';
import { Box, Button } from '@mui/material';
import Table from '../../../components/common/table/Table';
import CancelSwapOrderDialog from '../../../components/swap/CancelOrderDialog';
import AssetPair from '../../../components/common/assets/AssetPair';
import Tabs from '../../../components/common/tabs/Tabs';
import { useRichCompletedOrders, useRichOpenOrders } from '../hooks';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import { SwapPoolLabel } from '../../../components/swap/SwapPoolComponents';
import ExplorableHashContainer from '../../widgets/ExplorableHashContainer';
import { truncateAddressShort } from '../../../utils/formatters';
import { Quantities } from '../../../utils/quantities';
import { PRICE_PRECISION } from '../../../components/swap/common';
import { fail, forceNonNull, maybe, noop } from '../../../coreUtils';
import type { RemoteTokenInfo } from '../../../api/ada/lib/state-fetch/types';
import { useSwap } from '@yoroi/swap';
import { addressBech32ToHex } from '../../../api/ada/lib/cardanoCrypto/utils';
import { getTransactionFeeFromCbor, getTransactionTotalOutputFromCbor, } from '../../../api/ada/transactions/utils';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import type { CardanoConnectorSignRequest } from '../../../connector/types';
import { genLookupOrFail } from '../../../stores/stateless/tokenHelpers';
import moment from 'moment';
import { signTransactionHex } from '../../../api/ada/transactions/signTransactionHex';

type ColumnContext = {|
  completedOrders: boolean,
|};

type ColumnValueOrGetter = string | ColumnContext => string;

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
    width: '166px'
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
    name: ({ completedOrders }) => completedOrders ? 'Time executed' : 'Time created',
    align: 'left',
    width: '240px',
  },
  {
    name: 'Transaction ID',
    align: 'left',
    width: 'auto',
  },
];

export type FormattedTokenValue = {|
  value: string,
  formattedValue: string,
  ticker: string,
|};

function createFormattedTokenValues({
  entries,
  order,
  defaultTokenInfo,
}: {|
  entries: Array<{| id: string, amount: string |}>,
  order: any,
  defaultTokenInfo: RemoteTokenInfo,
|}): Array<FormattedTokenValue> {
  const tokenAmountMap = entries.reduce(
    (map, v) => ({ ...map, [v.id]: Quantities.sum([map[v.id] ?? '0', v.amount]) }),
    {}
  );
  const ptDecimals = forceNonNull(defaultTokenInfo.decimals);
  // $FlowIgnore[prop-missing]
  const defaultTokenValue = tokenAmountMap[''] ?? tokenAmountMap['.'] ?? '0';
  const formattedTokenValues = [
    {
      value: defaultTokenValue,
      formattedValue: Quantities.format(defaultTokenValue, ptDecimals, ptDecimals),
      ticker: defaultTokenInfo.ticker ?? '-',
    },
  ];
  [order.from.token, order.to.token].forEach(t => {
    if (t.id !== '' && t.id !== '.') {
      maybe(tokenAmountMap[t.id], v => {
        const formattedValue = Quantities.format(v, t.decimals, t.decimals);
        formattedTokenValues.push({
          value: v,
          formattedValue,
          ticker: t.ticker ?? '-',
        });
      });
    }
  });
  return formattedTokenValues;
}

function mapOrderAssets(
  order: any,
  defaultTokenInfo: RemoteTokenInfo
): {|
  price: string,
  amount: string,
  totalValues: ?Array<FormattedTokenValue>,
  from: any,
  to: any,
|} {
  const price = Quantities.quotient(order.from.quantity, order.to.quantity);
  const priceDenomination = order.from.token.decimals - order.to.token.decimals;
  const formattedPrice = Quantities.format(price, priceDenomination, PRICE_PRECISION);
  const formattedToQuantity = Quantities.format(
    order.to.quantity,
    order.to.token.decimals,
    order.to.token.decimals
  );
  const formattedAttachedValues = maybe(order.valueAttached, val => createFormattedTokenValues({
    entries: val.map(({ token: id, amount }) => ({ id, amount })),
    order,
    defaultTokenInfo,
  }));
  return {
    price: formattedPrice,
    amount: formattedToQuantity,
    totalValues: formattedAttachedValues,
    from: order.from,
    to: order.to,
  };
}

type MappedOrder = {|
  txId: string,
  utxo?: string,
  sender?: string,
  provider?: string,
  price: string,
  amount: string,
  totalValues: ?Array<FormattedTokenValue>,
  from: any,
  to: any,
|};

function mapOpenOrder(
  order: any,
  defaultTokenInfo: RemoteTokenInfo
): MappedOrder {
  const txId = order.utxo.split('#')[0];
  return {
    txId,
    utxo: order.utxo,
    sender: order.sender,
    provider: order.provider,
    ...mapOrderAssets(order, defaultTokenInfo),
  };
}

function mapCompletedOrder(
  order: any,
  defaultTokenInfo: RemoteTokenInfo
): MappedOrder {
  return {
    txId: order.txHash,
    ...mapOrderAssets(order, defaultTokenInfo),
  };
}

export default function SwapOrdersPage(props: StoresAndActionsProps): Node {
  const {
    order: { cancel: swapCancelOrder },
  } = useSwap();

  const [showCompletedOrders, setShowCompletedOrders] = useState<boolean>(false);
  const [cancellationState, setCancellationState] = useState<?{|
    order: any,
    collateralReorgTx?: {| cbor: string, txData: CardanoConnectorSignRequest |},
    signedCollateralReorgTx?: string,
    tx: ?{| cbor: string, formattedFee: string, formattedReturn: Array<FormattedTokenValue> |},
    isSubmitting?: boolean,
  |}>(null);

  const wallet = props.stores.wallets.selectedOrFail;
  const network = wallet.getParent().getNetworkInfo();
  const walletVariant = wallet.getParent().getWalletVariant();
  const defaultTokenInfo = props.stores.tokenInfoStore.getDefaultTokenInfoSummary(
    network.NetworkId
  );

  const selectedExplorer =
    props.stores.explorers.selectedExplorer.get(network.NetworkId) ??
    fail('No explorer for wallet network');

  const openOrders = useRichOpenOrders().map(o => mapOpenOrder(o, defaultTokenInfo));
  const completedOrders = useRichCompletedOrders().map(o => mapCompletedOrder(o, defaultTokenInfo));

  const txHashes = [...openOrders, ...completedOrders].map(o => o.txId);
  noop(props.stores.substores.ada.swapStore.fetchTransactionTimestamps({ wallet, txHashes }));

  const txHashToRenderedTimestamp: string => string = txHash => {
    const date = props.stores.substores.ada.swapStore.transactionTimestamps[txHash];
    return date == null ? '-' : moment(date).format('MMM D, YYYY H:mm');
  };

  const handleCancelRequest = async order => {
    setCancellationState({ order, tx: null });
    try {
      let utxoHex = await props.stores.substores.ada.swapStore
        .getCollateralUtxoHexForCancel({ wallet });
      let collateralReorgTxHex: ?string = null;
      let collateralReorgTxData: ?CardanoConnectorSignRequest = null;
      if (utxoHex == null) {
        const { unsignedTxHex, txData, collateralUtxoHex } = await props.stores.substores.ada.swapStore
          .createCollateralReorgForCancel({ wallet });
        collateralReorgTxHex = unsignedTxHex;
        collateralReorgTxData = txData;
        utxoHex = collateralUtxoHex;
      }
      return handleCreateCancelTransaction(order, utxoHex, collateralReorgTxHex, collateralReorgTxData);
    } catch (e) {
      console.error('Failed to prepare a collateral utxo for cancel', e);
      throw e;
    }
  };
  
  const handleCreateCancelTransaction = async (order, utxoHex, collateralReorgTx, collateralReorgTxData) => {
    const sender = order.sender;
    if (sender == null) {
      throw new Error('Cannot cancel a completed order (sender == null)');
    }
    try {
      const cancelTxCbor = await swapCancelOrder({
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
          amount: e.amount.toString()
        })),
        order,
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
          collateralReorgTx: collateralReorgTx && collateralReorgTxData
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
    const signedCollateralReorgTx = await signTransactionHex(wallet, password, collateralReorgTx.cbor);
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
    const signedTransactionHexes = signedCollateralReorgTx != null
      ? [signedCollateralReorgTx, signedCancelTx]
      : [signedCancelTx];
    await props.stores.substores.ada.swapStore.executeTransactionHexes({
      wallet,
      signedTransactionHexes,
    });
    setCancellationState(null);
  };

  const columnContext = { completedOrders: showCompletedOrders };
  const columnKeys = orderColumns.map(c => resolveValueOrGetter(c.name, columnContext));
  const columnNames = orderColumns.map(c => showCompletedOrders && c.openOrdersOnly ? '' : resolveValueOrGetter(c.name, columnContext));
  const columnAlignment = orderColumns.map(c => resolveValueOrGetter(c.align ?? '', columnContext));
  const columnLeftPaddings = orderColumns.map(c => resolveValueOrGetter(c.leftPadding ?? '', columnContext));
  const gridTemplateColumns = orderColumns.map(c => resolveValueOrGetter(c.width ?? 'auto', columnContext)).join(' ');

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
          getTokenInfo={genLookupOrFail(props.stores.tokenInfoStore.tokenInfo)}
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
        {(order.totalValues??[]).map(v => (
          <Box>
            {v.formattedValue} {v.ticker}
          </Box>
        ))}
      </Box>
      <Box display="flex" pl="32px" justifyContent="flex-start" alignItems="center" gap="8px">
        {maybe(order.provider, provider => (
          <SwapPoolLabel provider={provider}/>
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
