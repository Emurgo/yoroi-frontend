import { Stack, Typography } from '@mui/material';
import { ReactComponent as NoCompleteOders } from '../../../assets/images/revamp/no-complete-orders.inline.svg';

const NoCompleteOrders = () => {
  return (
    <Stack direction="column" justifyContent="center" alignItems="center" flex={1} pt="122px">
      <NoCompleteOders />
      <Typography variant="h4" fontWeight="500" color="ds.text_gray_normal" mt="66px" pb="8px">
        No orders completed yet
      </Typography>
    </Stack>
  );
};

export default NoCompleteOrders;
