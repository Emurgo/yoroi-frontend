// @flow
import type { Node } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as InfoIcon } from '../../assets/images/revamp/icons/info.inline.svg';
import Dialog from '../widgets/Dialog';
import { FormattedMarketPrice, FormattedPrice } from './PriceImpact';
import { useSwap } from '@yoroi/swap';

type Props = {|
  onContinue: () => void,
  onCancel: () => void,
|};

export default function LimitOrderWarningDialog({ onContinue, onCancel }: Props): Node {
  const { orderData } = useSwap();
  const limitPrice = orderData.selectedPoolCalculation?.order.limitPrice ?? '0';
  return (
    <Dialog title="Limit price" onClose={onCancel} withCloseButton closeOnOverlayClick>
      <Box display="flex" maxWidth="648px" mt="8px" mb="24px" flexDirection="column" gap="24px">
        <Box>
          <Typography component="div" variant="body1" color="ds.text_gray_medium">
            Are you sure you want to proceed this order with the limit price that is 10% or more higher than the market price?
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" gap="16px">
          <SummaryRow col1="Your limit price">
            <FormattedPrice price={limitPrice ?? '0'} />
          </SummaryRow>
          <SummaryRow col1="Market price">
            <FormattedMarketPrice />
          </SummaryRow>
        </Box>
      </Box>
      <Box maxWidth="648px" display="flex" gap="24px" pt="24px">
        <Button fullWidth variant="secondary" onClick={onCancel}>
          Back
        </Button>
        <Button fullWidth variant="primary" onClick={onContinue}>
          Swap
        </Button>
      </Box>
    </Dialog>
  );
}

type SummaryRowProps = {|
  col1: Node,
  children: Node,
  withInfo?: boolean,
|};

const SummaryRow = ({ col1, children, withInfo = false }: SummaryRowProps): Node => (
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
      <Typography component="div" variant="body1" color="ds.text_gray_medium">
        {children}
      </Typography>
    </Box>
  </Box>
);
