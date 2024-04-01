//@flow
import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as InfoIcon } from '../../assets/images/revamp/icons/info.inline.svg';
import Dialog from '../widgets/Dialog';
import AssetPair from '../common/assets/AssetPair';
import TextField from '../common/TextField';
import type { RemoteTokenInfo } from '../../api/ada/lib/state-fetch/types';
import LoadingSpinner from '../widgets/LoadingSpinner';
import { useState } from 'react';
import type { FormattedTokenValue } from '../../containers/swap/orders/OrdersPage';

type Props = {|
  order: any,
  transactionParams: ?{|
    formattedFee: string,
    returnValues: Array<FormattedTokenValue>,
  |},
  onCancelOrder: (order: any, password: string) => void,
  onDialogClose: void => void,
  defaultTokenInfo: RemoteTokenInfo,
|};

export default function CancelSwapOrderDialog({
  order,
  transactionParams,
  onCancelOrder,
  onDialogClose,
  defaultTokenInfo,
}: Props): React$Node {
  const [password, setPassword] = useState('');
  const isLoading = transactionParams == null;
  return (
    <Dialog title="Cancel order" onClose={onDialogClose} withCloseButton closeOnOverlayClick>
      <Box display="flex" mt="8px" mb="24px" flexDirection="column" gap="16px">
        <Box>
          <Typography component="div" variant="body1">Are you sure you want to cancel this order?</Typography>
        </Box>
        <AssetPair
          from={order.from.token}
          to={order.to.token}
          defaultTokenInfo={defaultTokenInfo}
        />
        <Box display="flex" flexDirection="column" gap="8px">
          <SummaryRow col1="Asset price">
            {order.price} {order.from.token.ticker}
          </SummaryRow>
          <SummaryRow col1="Asset amount">
            {order.amount} {order.to.token.ticker}
          </SummaryRow>
          <SummaryRow col1="Total returned" withInfo>
            {transactionParams ? transactionParams.returnValues.map(v => (
              <Box>{v.formattedValue} {v.ticker}</Box>
            )) : (<LoadingSpinner small />)}
          </SummaryRow>
          <SummaryRow col1="Cancellation fee">
            {transactionParams ? transactionParams.formattedFee : (<LoadingSpinner small />)}
          </SummaryRow>
        </Box>
        <Box>
          <TextField
            className="walletPassword"
            value={password}
            label="Password"
            type="password"
            onChange={e => setPassword(e.target.value)}
          />
        </Box>
      </Box>
      <Box display="flex" gap="24px" mt="24px">
        <Button fullWidth variant="secondary" onClick={onDialogClose}>
          Back
        </Button>
        <Button
          fullWidth
          variant="destructive"
          onClick={() => onCancelOrder(order, password)}
          disabled={isLoading || password.length === 0}
        >
          {isLoading ? (
            <LoadingSpinner small light />
          ) : 'Cancel order'}
        </Button>
      </Box>
    </Dialog>
  );
}

const SummaryRow = ({ col1, children, withInfo = false }) => (
  <Box display="flex" alignItems="center" justifyContent="space-between">
    <Box display="flex" alignItems="center">
      <Typography component="div" variant="body1" color="grayscale.500">
        {col1}
      </Typography>
      {withInfo ? (
        <Box ml="8px">
          <InfoIcon />
        </Box>
      ) : null}
    </Box>
    <Box>
      <Typography component="div" variant="body1">{children}</Typography>
    </Box>
  </Box>
);
