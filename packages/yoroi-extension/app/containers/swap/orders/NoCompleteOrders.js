// @flow

import type { Node } from 'react';
import { Stack, Typography } from '@mui/material';
import { ReactComponent as NoCompleteOders } from '../../../assets/images/revamp/no-complete-orders.inline.svg';
import { useStrings } from '../common/useStrings';

const NoCompleteOrders = (): Node => {
  const strings = useStrings();
  return (
    <Stack direction="column" justifyContent="center" alignItems="center" flex={1} pt="98px">
      <NoCompleteOders />
      <Typography variant="h4" fontWeight="500" color="ds.text_gray_medium" mt="52px" pb="8px">
        {strings.noOrdersCompleted}
      </Typography>
    </Stack>
  );
};

export default NoCompleteOrders;
