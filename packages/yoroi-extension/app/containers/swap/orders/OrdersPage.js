// @flow
import { Fragment, type Node } from 'react';
import Table from '../../../components/common/table/Table';
import { Box } from '@mui/material';

const orderColumns = [
  'Pair (From / To)',
  'Asset price',
  'Asset amount',
  'Total',
  'DEX',
  'Time created',
  'Transaction ID',
];

const mockOrders = [
  {
    from: { image: null, ticker: 'ADA' },
    to: { image: null, ticker: 'USDA' },
    price: 3,
    amount: 3,
    total: 11,
    totalAda: 11,
    dex: { image: null, name: 'Minswap' },
    datetime: 'Jun 26, 2023, 22:29:27',
    txId: 'ebc533...86b54',
  },
  {
    from: { image: null, ticker: 'MILK' },
    to: { image: null, ticker: 'LVLC' },
    price: 5,
    amount: 10,
    total: 11,
    totalAda: 5,
    dex: { image: null, name: 'Sundaeswap' },
    datetime: 'Jun 22, 2023, 10:11:04',
    txId: 'ebc533...86b254',
  },
];

export default function SwapOrdersPage(): Node {
  return (
    <Box>
      <Box>
        <Box></Box>
        <Box></Box>
      </Box>
      <Table
        columnNames={orderColumns}
        gridTemplateColumns="186px 160px 176px 160px 186px 260px auto"
      >
        {mockOrders.map(order => (
          <Fragment key={order.txId}>
            <Box py={'20px'} display={'flex'} gap={'8px'}>
              <Box>
                <Box>{order.from.image}</Box>
                <Box>{order.from.ticker}</Box>
              </Box>
              <Box>/</Box>
              <Box>
                <Box>{order.to.image}</Box>
                <Box>{order.to.ticker}</Box>
              </Box>
            </Box>
            <Box textAlign={'right'}>{order.price}</Box>
            <Box textAlign={'right'}>{order.amount}</Box>
            <Box textAlign={'right'}>
              <Box>
                {order.total} {order.to.ticker}
              </Box>
              <Box>{order.totalAda} ADA</Box>
            </Box>
            <Box textAlign={'right'}>
              <Box>{order.dex.image}</Box>
              <Box>{order.dex.name}</Box>
            </Box>
            <Box textAlign={'right'}>{order.datetime}</Box>
            <Box textAlign={'right'}>{order.txId}</Box>
          </Fragment>
        ))}
      </Table>
    </Box>
  );
}
