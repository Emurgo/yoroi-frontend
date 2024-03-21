//@flow
import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as InfoIcon } from '../../assets/images/revamp/icons/info.inline.svg';
import Dialog from '../widgets/Dialog';
import AssetPair from '../common/assets/AssetPair';
import TextField from '../common/TextField';
import type { RemoteTokenInfo } from '../../api/ada/lib/state-fetch/types';

type Props = {|
  order: any,
  onCancelOrder: void => void,
  onClose: void => void,
  defaultTokenInfo: RemoteTokenInfo,
|};

export default function CancelSwapOrderDialog({
  order,
  onCancelOrder,
  onClose,
  defaultTokenInfo,
}: Props): React$Node {
  const handleCancelOrder = () => {
    onCancelOrder();
    onClose();
  };
  return (
    <Dialog title="Cancel order" onClose={onClose} withCloseButton closeOnOverlayClick>
      <Box display="flex" mt="8px" mb="24px" flexDirection="column" gap="16px">
        <Box>
          <Typography component="div" variant="body1">Are you sure you want to cancel this order?</Typography>
        </Box>
        <AssetPair
          from={order.fromToken}
          to={order.toToken}
          defaultTokenInfo={defaultTokenInfo}
        />
        <Box display="flex" flexDirection="column" gap="8px">
          <SummaryRow col1="Asset price">
            {order.price} {order.fromToken.ticker}
          </SummaryRow>
          <SummaryRow col1="Asset amount">
            {order.amount} {order.toToken.ticker}
          </SummaryRow>
          <SummaryRow col1="Total returned" withInfo>
            {order.totalValues.map(v => (
              <Box>{v.formattedValue} {v.ticker}</Box>
            ))}
          </SummaryRow>
          <SummaryRow col1="Cancellation fee">
            -
          </SummaryRow>
        </Box>
        <Box>
          <TextField
            className="walletPassword"
            value=""
            label="Password"
            type="password"
            // error={walletPasswordField.error}
          />
        </Box>
      </Box>
      <Box display="flex" gap="24px" mt="24px">
        <Button fullWidth variant="secondary" onClick={onClose}>
          Back
        </Button>
        <Button fullWidth variant="destructive" onClick={handleCancelOrder}>
          Cancel order
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
