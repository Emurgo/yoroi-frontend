// @flow
import type { Node } from 'react';
import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { mockOpenOrders, mockCompletedOrders } from './mockData';
import Table from '../../../components/common/table/Table';
import CancelSwapOrderDialog from '../../../components/swap/CancelOrderDialog';
import AssetPair from '../../../components/common/assets/AssetPair';

const orderColumns = [
  'Pair (From / To)',
  'Asset price',
  'Asset amount',
  'Total',
  'DEX',
  'Time created',
  'Transaction ID',
];

export default function SwapOrdersPage(): Node {
  const [showCompletedOrders, setShowCompletedOrders] = useState(false);
  const [cancelOrder, setCancelOrder] = useState(null);

  const handleCancelOrder = order => {
    console.log('🚀 > order:', order);
  };

  return (
    <>
      <Box>
        <Box
          sx={{
            cursor: 'pointer',
            mb: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TabButton
            label="Open orders"
            isActive={!showCompletedOrders}
            onClick={() => setShowCompletedOrders(false)}
          />
          <TabButton
            label="Completed orders"
            isActive={showCompletedOrders}
            onClick={() => setShowCompletedOrders(true)}
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
            ? mockCompletedOrders.map(order => <OrderRow isCompleted key={order.txId} {...order} />)
            : mockOpenOrders.map(order => (
              <OrderRow key={order.txId} handleCancel={() => setCancelOrder(order)} {...order} />
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

const OrderRow = ({ isCompleted = false, handleCancel, ...order }) => (
  <>
    <AssetPair sx={{ py: '20px' }} from={order.from} to={order.to} />
    <Box textAlign="right">{order.price}</Box>
    <Box textAlign="right">{order.amount}</Box>
    <Box textAlign="right">
      <Box>
        {order.total} {order.to.ticker}
      </Box>
      <Box>{order.totalAda} ADA</Box>
    </Box>
    <Box display="flex" pl="32px" justifyContent="flex-start" alignItems="center" gap="8px">
      <Box width="32px" height="32px">
        {order.dex.image}
      </Box>
      <Box fontWeight={500} color="primary.500">
        {order.dex.name}
      </Box>
    </Box>
    <Box textAlign="left">{order.datetime}</Box>
    <Box display="flex" justifyContent="space-between" alignItems="center" gap="12px">
      <Box color="primary.500">{order.txId}</Box>
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

const TabButton = ({ label, isActive, onClick }) => (
  <Box onClick={onClick} p="8px" borderRadius="8px" bgcolor={isActive ? 'grayscale.200' : ''}>
    <Typography variant="body1" fontWeight={500}>
      {label}
    </Typography>
  </Box>
);
