// @flow
import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import Dialog from '../widgets/Dialog/Dialog';
// <TODO:CHECK_LINT>
// eslint-disable-next-line no-unused-vars
import { ReactComponent as AssetDefault } from '../../assets/images/revamp/asset-default.inline.svg';
// eslint-disable-next-line no-unused-vars
import { ReactComponent as NoAssetsFound } from '../../assets/images/revamp/no-assets-found.inline.svg';
import Tabs from '../common/tabs/Tabs';

const defaultSlippages = ['0', '0.1', '0.5', '1', '2', '3', '5', '10'];

type Props = {|
  onSetNewSlippage: number => void,
  onClose: void => void,
  slippageValue: string,
|};

export default function SlippageDialog({ onSetNewSlippage, onClose, slippageValue }: Props): React$Node {
  const [selectedSlippage, setSelectedSlippage] = useState(slippageValue);
  const [isManualSlippage, setIsManualSlippage] = useState(!defaultSlippages.includes(slippageValue));

  const handleSlippageApply = () => {
    try {
      onSetNewSlippage(parseFloat(selectedSlippage));
      onClose();
    } catch (e) {
      console.error(`Failed to apply new slippage: "${selectedSlippage}"`, e);
    }
  };

  const handleSlippageChange = e => {
    let val = e.target.value.replace(/[^\d.]+/g, '');
    const number = Number(val);
    if (number > 100) val = '100';
    else if (number < 0) val = '0';
    setSelectedSlippage(val);
  };

  const readonly = !isManualSlippage;

  // <TODO:CHECK_INTL>
  return (
    <Dialog title="Slippage tolerance" onClose={onClose} withCloseButton closeOnOverlayClick>
      <Box maxWidth="564px">
        <Box>
          <Typography component="div" variant="body1" color="ds.gray_c800">
            Default Slippage Tolerance
          </Typography>
        </Box>
        <Box py="8px">
          <Typography component="div" variant="body2" color="ds.gray_c700">
            Slippage tolerance is set as a percentage of the total swap value. Your transactions
            will not be executed if the price moves by more than this amount.
          </Typography>
        </Box>
        <Box display="flex" justifyContent="flex-start">
          <Tabs
            tabs={defaultSlippages
              .map(val => ({
                label: `${val}%`,
                isActive: !isManualSlippage && val === selectedSlippage,
                onClick: () => {
                  setIsManualSlippage(false);
                  setSelectedSlippage(val);
                },
              }))
              .concat({
                label: 'Manual',
                isActive: isManualSlippage,
                onClick: () => {
                  setIsManualSlippage(true);
                },
              })}
          />
        </Box>
        <Box my="16px">
          <Box
            component="fieldset"
            sx={{
              border: '1px solid',
              borderColor: 'ds.gray_c400',
              borderRadius: '8px',
              p: '16px',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              justifyContent: 'start',
              position: 'relative',
              bgcolor: readonly ? 'ds.gray_c50' : 'ds.gray_cmin',
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
                bgcolor: 'ds.gray_cmin',
              }}
            >
              Slippage tolerance
            </Box>

            <Typography
              sx={{
                appearance: 'none',
                border: '0',
                outline: 'none',
                '::placeholder': { color: 'ds.gray_c600' },
              }}
              component="input"
              type="text"
              variant="body1"
              color="#000"
              placeholder="0"
              onChange={handleSlippageChange}
              bgcolor={readonly ? 'ds.gray_c50' : 'ds.gray_cmin'}
              readOnly={readonly}
              value={selectedSlippage}
            />
          </Box>
        </Box>
        <Box my="24px" p="16px" pt="12px" bgcolor="yellow.100" borderRadius="8px">
          <Typography component="div" variant="body1" color="ds.gray_cmax">
            When the slippage tolerance is set really high, it allows the transaction to still
            complete despite large price swings. This can open the door to front-running and
            sandwich attacks.
          </Typography>
        </Box>
        <Box>
          <Button
            disabled={selectedSlippage.trim().length === 0}
            fullWidth
            onClick={handleSlippageApply}
            variant="primary"
          >
            Apply
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
