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
    <Dialog title={'Slippage tolerance'} onClose={onClose} closeOnOverlayClick>
      <Box maxWidth="564px">
        <Box>
          <Typography variant="body1" color="grayscale.800">
            Default Slippage Tolerance
          </Typography>
        </Box>
        <Box py="8px">
          <Typography variant="body2" color="grayscale.700">
            Slippage tolerance is set as a percentage of the total swap value. Your transactions
            will not be executed if the price moves by more than this amount.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {defaultSlippages.map(val => (
            <Box
              key={val}
              p="8px"
              sx={{
                cursor: 'pointer',
                borderRadius: '8px',
                bgcolor: val === selectedSlippage ? 'grayscale.200' : '',
              }}
              onClick={() => setSelectedSlippage(val)}
            >
              <Typography variant="body1" fontWeight={500}>
                {val}%
              </Typography>
            </Box>
          ))}
          <Box
            p="8px"
            sx={{
              cursor: 'pointer',
              borderRadius: '8px',
              bgcolor: !defaultSlippages.includes(selectedSlippage) ? 'grayscale.200' : '',
            }}
            onClick={() => setSelectedSlippage('')}
          >
            <Typography variant="body1" fontWeight={500}>
              Manual
            </Typography>
          </Box>
        </Box>
        <Box my="16px">
          <Box
            component="fieldset"
            sx={{
              border: '1px solid',
              borderColor: 'grayscale.400',
              borderRadius: '8px',
              p: '16px',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              justifyContent: 'start',
              position: 'relative',
              bgcolor: readonly ? 'grayscale.50' : 'common.white',
              columnGap: '6px',
              rowGap: '8px',
            }}
          >
            <Box
              component="legend"
              sx={{
                top: '-9px',
                left: '16px',
                position: 'absolute',
                px: '4px',
                bgcolor: 'common.white',
              }}
            >
              Slippage tolerance
            </Box>

            <Typography
              sx={{
                appearance: 'none',
                border: '0',
                outline: 'none',
                '::placeholder': { color: 'grayscale.600' },
              }}
              component="input"
              type="text"
              variant="body1"
              color="#000"
              placeholder="0"
              bgcolor={readonly ? 'grayscale.50' : 'common.white'}
              readOnly={readonly}
              value={selectedSlippage}
            />
          </Box>
        </Box>
        <Box my="24px" p="16px" pt="12px" bgcolor="yellow.100" borderRadius="8px">
          <Typography variant="body1" color="grayscale.max">
            When the slippage tolerance is set really high, it allows the transaction to still
            complete despite large price swings. This can open the door to front-running and
            sandwich attacks.
          </Typography>
        </Box>
        <Box>
          <Button fullWidth onClick={handleSlippageApply} variant="primary">
            Apply
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
