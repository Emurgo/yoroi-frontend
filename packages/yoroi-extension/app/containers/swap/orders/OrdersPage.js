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
                isCompleted
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
        />
      )}
    </>
  );
}

const OrderRow = ({ isCompleted = false, handleCancel, order, defaultTokenInfo, selectedExplorer }) => {
  const txId = order.utxo.split('#')[0];
  const price = Quantities.quotient(order.from.quantity, order.to.quantity);
  const priceDenomination = order.from.token.decimals - order.to.token.decimals;
  const formattedPrice = Quantities.format(price, priceDenomination, PRICE_PRECISION);
  const formattedToQuantity = Quantities.format(
    order.to.quantity,
    order.to.token.decimals,
    order.to.token.decimals,
  );
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
        <Box>{order.totalAda} ADA</Box>
      </Box>
      <Box display="flex" pl="32px" justifyContent="flex-start" alignItems="center" gap="8px">
        <SwapPoolLabel provider={order.provider}/>
      </Box>
      <Box textAlign="left">{order.datetime}</Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" gap="12px">
        <ExplorableHashContainer
          selectedExplorer={selectedExplorer}
          linkType="transaction"
          hash={txId}
        >
          <span>{truncateAddressShort(txId)}</span>
        </ExplorableHashContainer>
        {!isCompleted && (
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

// <TODO:CHECK_LINT>
// eslint-disable-next-line no-unused-vars
const TabButton = ({ label, isActive, onClick }): React$Node => (
  <Box onClick={onClick} p="8px" borderRadius="8px" bgcolor={isActive ? 'grayscale.200' : ''}>
    <Typography component="div" variant="body1" fontWeight={500}>
      {label}
    </Typography>
  </Box>
);
