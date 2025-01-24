// @flow
import type { Node } from 'react';
import { Stack, Typography } from '@mui/material';
import { ReactComponent as NoOpenOders } from '../../../assets/images/revamp/no-open-orders.inline.svg';
import { useStrings } from '../common/useStrings';

const NoOpenOrders = (): Node => {
  const strings = useStrings();
  return (
    <Stack direction="column" justifyContent="center" alignItems="center" flex={1} pt="98px">
      <NoOpenOders />
      <Typography variant="h4" fontWeight="500" color="ds.text_gray_medium" mt="52px" pb="8px">
        {strings.noOrdersAvailable}
      </Typography>
      <Typography variant="body1" color="ds.text_gray_low" width="343px" textAlign="center">
        {strings.startDoingSwaps}
      </Typography>
    </Stack>
  );
};

export default NoOpenOrders;
