//@flow
import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as InfoIcon } from '../../assets/images/revamp/icons/info.inline.svg';
import Dialog from '../widgets/Dialog';
import AssetPair from '../common/assets/AssetPair';
import TextField from '../common/TextField';
import type { RemoteTokenInfo } from '../../api/ada/lib/state-fetch/types';
import LoadingSpinner from '../widgets/LoadingSpinner';
import { useState } from 'react';
import BigNumber from 'bignumber.js';
import { Quantities } from '../../utils/quantities';

type Props = {|
  order: any,
  transactionFee: ?BigNumber,
  onCancelOrder: (order: any, password: string) => void,
  onDialogClose: void => void,
  defaultTokenInfo: RemoteTokenInfo,
|};

export default function CancelSwapOrderDialog({
  order,
  transactionFee,
  onCancelOrder,
  onDialogClose,
  defaultTokenInfo,
}: Props): React$Node {
  const [password, setPassword] = useState('');
  const isLoading = transactionFee == null;
  const ptDecimals = defaultTokenInfo.decimals ?? 0;
  const calcDefaultTokenReturnValue: string => ?string = baseValue => {
    // TODO: add frontend fee
    return transactionFee ? Quantities.format(
      Quantities.sum([baseValue, `-${transactionFee.toString()}`]),
      ptDecimals,
    ) : null;
  }
  return (
    <Dialog title="Cancel order" onClose={onDialogClose} withCloseButton closeOnOverlayClick>
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
            {order.totalValues.map(v => {
              const val = v.defaultToken
                ? calcDefaultTokenReturnValue(v.value)
                : v.formattedValue;
              return (
                <Box>{val ? `${val} ${v.ticker}` : (<LoadingSpinner small />)}</Box>
              );
            })}
          </SummaryRow>
          <SummaryRow col1="Cancellation fee">
            {transactionFee ? (
              Quantities.format(
                transactionFee.toString(),
                ptDecimals,
              )
            ) : (
              <LoadingSpinner small />
            )}
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
