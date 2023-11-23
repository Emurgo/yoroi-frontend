// @flow
import type { Node } from 'react';
import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as InfoIcon } from '../../assets/images/revamp/icons/info.inline.svg';
import Dialog from '../widgets/Dialog';

type Props = {|
  limitPrice: number,
  marketPrice: number,
  exchangePair: string,
  onConfirm(): void,
  onClose(): void,
|};

export default function LimitOrderDialog({
  limitPrice,
  marketPrice,
  exchangePair,
  onConfirm,
  onClose,
}: Props): Node {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog title="Limit price" onClose={onClose} withCloseButton closeOnOverlayClick>
      <Box display="flex" maxWidth="648px" mt="8px" mb="24px" flexDirection="column" gap="24px">
        <Box>
          <Typography variant="body1" color="grayscale.900">
            Are you sure you want to proceed this order with the limit price that is 10% or more
            higher than the market price?
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" gap="16px">
          <SummaryRow col1="Your limit price" col2={`${limitPrice} ${exchangePair}`} />
          <SummaryRow col1="Market price" col2={`${marketPrice} ${exchangePair}`} />
        </Box>
      </Box>
      <Box maxWidth="648px" display="flex" gap="24px" pt="24px">
        <Button fullWidth variant="secondary" onClick={onClose}>
          Back
        </Button>
        <Button fullWidth variant="primary" onClick={handleConfirm}>
          Swap
        </Button>
      </Box>
    </Dialog>
  );
}

type SummaryRowProps = {|
  col1: Node,
  col2: Node,
  withInfo?: boolean,
|};

const SummaryRow = ({ col1, col2, withInfo = false }: SummaryRowProps): Node => (
  <Box display="flex" alignItems="center" justifyContent="space-between">
    <Box display="flex" alignItems="center">
      <Typography variant="body1" color="grayscale.500">
        {col1}
      </Typography>
      {withInfo ? (
        <Box ml="8px">
          <InfoIcon />
        </Box>
      ) : null}
    </Box>
    <Box>
      <Typography variant="body1">{col2}</Typography>
    </Box>
  </Box>
);
