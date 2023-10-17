import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as AssetDefault } from '../../assets/images/revamp/asset-default.inline.svg';
import { ReactComponent as NoAssetsFound } from '../../assets/images/revamp/no-assets-found.inline.svg';
import Dialog from '../widgets/Dialog';

const defaultSlippages = ['0', '0.1', '0.5', '1', '2', '3', '5', '10'];

export default function SlippageDialog({ currentSlippage, onSlippageApplied, onClose }) {
  const [selectedSlippage, setSelectedSlippage] = useState(currentSlippage);

  const handleSlippageApply = () => {
    onSlippageApplied(selectedSlippage);
    onClose();
  };

  const readonly = defaultSlippages.includes(selectedSlippage);

  return (
    <Dialog title={'Limit price'} onClose={onClose} closeOnOverlayClick>
      <Box maxWidth="648px">
        <Box py="8px">
          <Typography variant="body2" color="grayscale.900">
            Are you sure you want to proceed this order with the limit price that is 10% or more
            higher than the market price?
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}></Box>
        <Box>
          <Button fullWidth onClick={handleSlippageApply} variant="secondary">
            Back
          </Button>
          <Button fullWidth onClick={handleSlippageApply} variant="primary">
            Swap
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
