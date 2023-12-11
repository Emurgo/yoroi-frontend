// @flow
import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import Dialog from '../widgets/Dialog';
// <TODO:CHECK_LINT>
// eslint-disable-next-line no-unused-vars
import { ReactComponent as AssetDefault } from '../../assets/images/revamp/asset-default.inline.svg';
// eslint-disable-next-line no-unused-vars
import { ReactComponent as NoAssetsFound } from '../../assets/images/revamp/no-assets-found.inline.svg';
import Tabs from '../common/tabs/Tabs';
import { useSwap } from '@yoroi/swap';

const defaultSlippages = ['0', '0.1', '0.5', '1', '2', '3', '5', '10'];

type Props = {|
  onClose: void => void,
|};

export default function SlippageDialog({ onClose }: Props): React$Node {
  const {
    slippageChanged,
    orderData: { slippage: currentSlippage },
  } = useSwap();
  const [selectedSlippage, setSelectedSlippage] = useState(currentSlippage || '1');
  const [manualSlippage, setManualSlippage] = useState(currentSlippage);
  const [isManual, setIsManual] = useState(!defaultSlippages.includes(currentSlippage));

  const handleSlippageApply = () => {
    slippageChanged(isManual ? manualSlippage : selectedSlippage);
    onClose();
  };

  const handleSlippageChange = e => {
    let val = e.target.value.replace(/[^\d.-]+/g, '');
    const number = Number(val);
    if (number > 100) val = '100';
    else if (number < 0) val = '0';
    setManualSlippage(val);
  };

  const readonly = defaultSlippages.includes(selectedSlippage);

  // <TODO:CHECK_INTL>
  return (
    <Dialog title="Slippage tolerance" onClose={onClose} withCloseButton closeOnOverlayClick>
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
        <Box display="flex" justifyContent="flex-start">
          <Tabs
            tabs={defaultSlippages
              .map(val => ({
                label: `${val}%`,
                isActive: val === selectedSlippage && !isManual,
                onClick: () => {
                  setIsManual(false);
                  setSelectedSlippage(val);
                },
              }))
              .concat({
                label: 'Manual',
                isActive: isManual,
                onClick: () => {
                  setIsManual(true);
                  setSelectedSlippage('');
                },
              })}
          />
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
              onChange={handleSlippageChange}
              bgcolor={readonly ? 'grayscale.50' : 'common.white'}
              readOnly={readonly}
              value={isManual ? manualSlippage : selectedSlippage}
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
