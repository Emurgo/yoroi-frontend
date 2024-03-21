// @flow
import type { Node } from 'react';
import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { mockCompletedOrders } from './mockData';
import Table from '../../../components/common/table/Table';
import CancelSwapOrderDialog from '../../../components/swap/CancelOrderDialog';
import AssetPair from '../../../components/common/assets/AssetPair';
import Tabs from '../../../components/common/tabs/Tabs';
import { useRichOpenOrders } from '../hooks';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import { SwapPoolLabel } from '../../../components/swap/SwapPoolComponents';
import ExplorableHashContainer from '../../widgets/ExplorableHashContainer';
import { truncateAddressShort } from '../../../utils/formatters';
import { Quantities } from '../../../utils/quantities';
import { PRICE_PRECISION } from '../../../components/swap/common';
import { fail, maybe } from '../../../coreUtils';

const orderColumns = [
  'Pair (From / To)',
  'Asset price',
  'Asset amount',
  'Total',
  'DEX',
  'Time created',
  'Transaction ID',
];

export default function SwapOrdersPage(props: StoresAndActionsProps): Node {

  const [showCompletedOrders, setShowCompletedOrders] = useState(false);
  const [cancelOrder, setCancelOrder] = useState(null);

  const wallet = props.stores.wallets.selectedOrFail;
  const network = wallet.getParent().getNetworkInfo();
  const defaultTokenInfo = props.stores.tokenInfoStore
    .getDefaultTokenInfoSummary(network.NetworkId);

  const selectedExplorer = props.stores.explorers.selectedExplorer.get(network.NetworkId)
    ?? fail('No explorer for wallet network');

  const openOrders = useRichOpenOrders();
  console.log('1 >>> ', openOrders);

  const handleCancelOrder = order => {
    console.log('🚀 > order:', order);
  };

  return (
    <>
      <Box>
        <Box sx={{ mb: '24px' }}>
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
          columnNames={orderColumns}
          columnAlignment={['left', '', '', '', 'left', 'left', 'left']}
          columnLeftPaddings={['', '', '', '', '32px']}
          gridTemplateColumns="186px 160px 176px 160px 186px 260px auto"
          columnGap="0px"
        >
          {showCompletedOrders
            ? mockCompletedOrders.map(order => (
              <OrderRow
                key={order.txId}
                order={order}
                defaultTokenInfo={defaultTokenInfo}
                selectedExplorer={selectedExplorer}
              />
            ))
            : openOrders.map(order => (
              <OrderRow
                key={order.utxo}
                handleCancel={() => setCancelOrder(order)}
                order={order}
                defaultTokenInfo={defaultTokenInfo}
                selectedExplorer={selectedExplorer}
              />
            ))}
        </Table>
      </Box>
      {cancelOrder && (
        <CancelSwapOrderDialog
          order={cancelOrder}
          onCancelOrder={() => handleCancelOrder(cancelOrder)}
          onClose={() => setCancelOrder(null)}
          defaultTokenInfo={defaultTokenInfo}
        />
      )}
    </>
  );
}

function createFormattedAttachedValues({ order, defaultTokenInfo }): Array<{ formattedValue: string, ticker: string }> {
  const attachedValueMap = order.valueAttached.reduce((map, v) =>
    ({ ...map, [v.token]: Quantities.sum([map[v.token] ?? '0', v.amount]) }), {});
  const decimalsAda = defaultTokenInfo.decimals;
  const formattedAttachedValues = [{
    formattedValue: Quantities.format(attachedValueMap['.'] ?? '0', decimalsAda, decimalsAda),
    ticker: defaultTokenInfo.ticker,
  }];
  [order.from, order.to].forEach(t => {
    maybe(attachedValueMap[t.id], v => {
      const formattedValue = Quantities.format(v, t.decimals, t.decimals);
      formattedAttachedValues.push({
        formattedValue,
        ticker: t.ticker,
      });
    })
  })
  return formattedAttachedValues;
}

const OrderRow = ({ handleCancel = null, order, defaultTokenInfo, selectedExplorer }) => {
  const txId = order.utxo.split('#')[0];
  const price = Quantities.quotient(order.from.quantity, order.to.quantity);
  const priceDenomination = order.from.token.decimals - order.to.token.decimals;
  const formattedPrice = Quantities.format(price, priceDenomination, PRICE_PRECISION);
  const formattedToQuantity = Quantities.format(
    order.to.quantity,
    order.to.token.decimals,
    order.to.token.decimals,
  );

  const formattedAttachedValues =
    createFormattedAttachedValues({ order, defaultTokenInfo });

  return (
    <>
      <AssetPair
        sx={{ py: '20px' }}
        from={order.from.token}
        to={order.to.token}
        defaultTokenInfo={defaultTokenInfo}
      />
      <Box textAlign="right">{formattedPrice}</Box>
      <Box textAlign="right">{formattedToQuantity}</Box>
      <Box textAlign="right">
        <Box>
          {order.total} {order.to.ticker}
        </Box>
        <Box>{formattedAttachedValues.map(v => (
          <Box>
            {v.formattedValue} {v.ticker}
          </Box>
        ))}</Box>
      </Box>
      <Box display="flex" pl="32px" justifyContent="flex-start" alignItems="center" gap="8px">
        <SwapPoolLabel provider={order.provider}/>
      </Box>
      <Box textAlign="left">-</Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" gap="12px">
        <ExplorableHashContainer
          selectedExplorer={selectedExplorer}
          linkType="transaction"
          hash={txId}
        >
          <span>{truncateAddressShort(txId)}</span>
        </ExplorableHashContainer>
        {handleCancel == null ? null : (
          <Box>
            <Button onClick={handleCancel} variant="tertiary" color="grayscale">
              Cancel
            </Button>
          </Box>
        )}
      </Box>
    </>
  );
};
