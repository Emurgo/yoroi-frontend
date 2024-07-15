// @flow

import { Stack, Typography } from '@mui/material';
import type { Node } from 'react';
import { ReactComponent as NoOpenOders } from '../../../assets/images/revamp/no-open-orders.inline.svg';

const NoOpenOrders = (): Node => {
  return (
    <Stack direction="column" justifyContent="center" alignItems="center" flex={1} pt="98px">
      <NoOpenOders />
      <Typography variant="h4" fontWeight="500" color="ds.text_gray_normal" mt="52px" pb="8px">
        No orders available yet
      </Typography>
      <Typography variant="body1" color="ds.text_gray_medium" width="343px" textAlign="center">
        Start doing the swap operations to see your open orders here
      </Typography>
    </Stack>
  );
};

export default NoOpenOrders;
