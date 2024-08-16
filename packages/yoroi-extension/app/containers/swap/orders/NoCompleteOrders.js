// @flow

import { Stack, Typography } from '@mui/material';
import { ReactComponent as NoCompleteOders } from '../../../assets/images/revamp/no-complete-orders.inline.svg';
import type { Node } from 'react';

const NoCompleteOrders = (): Node => {
  return (
    <Stack direction="column" justifyContent="center" alignItems="center" flex={1} pt="98px">
      <NoCompleteOders />
      <Typography variant="h4" fontWeight="500" color="ds.text_gray_medium" mt="52px" pb="8px">
        No orders completed yet
      </Typography>
    </Stack>
  );
};

export default NoCompleteOrders;
