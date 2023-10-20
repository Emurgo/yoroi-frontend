import { useState } from 'react';
import { Box, Button, Input, Typography } from '@mui/material';
import { ReactComponent as SwitchIcon } from '../../../assets/images/revamp/icons/switch.inline.svg';
import { ReactComponent as RefreshIcon } from '../../../assets/images/revamp/icons/refresh.inline.svg';
import { ReactComponent as InfoIcon } from '../../../assets/images/revamp/icons/info.inline.svg';
import { ReactComponent as EditIcon } from '../../../assets/images/revamp/icons/edit.inline.svg';
import { ReactComponent as AdaTokenImage } from './img.inline.svg';
import { ReactComponent as UsdaTokenImage } from './usda.inline.svg';
import SwapInput from '../../../components/swap/SwapInput';
import PriceInput from '../../../components/swap/PriceInput';

const defaultFromAsset = { amount: '', walletAmount: 212, ticker: 'TADA' };
const defaultToAsset = { amount: '', walletAmount: 0, ticker: '' };

export default function SwapForm() {
  const [isMarketOrder, setIsMarketOrder] = useState(true);
  const [fromAsset, setFromAsset] = useState(defaultFromAsset);
  const [toAsset, setToAsset] = useState(defaultToAsset);

  const handleOpenedDialog = type => setOpenedDialog(type);

  const handleSwitchSelectedAssets = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
  };

  const handleAmountChange = (amount, type) => {
    const func = type === 'from' ? setFromAsset : setToAsset;
    func(p => ({ ...p, amount }));
  };

  const handleResetForm = () => {
    setFromAsset(defaultFromAsset);
    setToAsset(defaultToAsset);
  };

  return (
    <Box width="100%" mx="auto" maxWidth="506px" display="flex" flexDirection="column" gap="16px">
      <Box display="flex" alignItems="center" justifyContent="space-between" mb="16px">
        <Box sx={{ cursor: 'pointer' }} display="flex" alignItems="center">
          <Box
            onClick={() => setIsMarketOrder(true)}
            p="8px"
            borderRadius="8px"
            bgcolor={isMarketOrder ? 'grayscale.200' : ''}
          >
            <Typography variant="body1" fontWeight={500}>
              Market
            </Typography>
          </Box>
          <Box
            onClick={() => setIsMarketOrder(false)}
            p="8px"
            borderRadius="8px"
            bgcolor={!isMarketOrder ? 'grayscale.200' : ''}
          >
            <Typography variant="body1" fontWeight={500}>
              Limit
            </Typography>
          </Box>
        </Box>
        <Box sx={{ cursor: 'pointer' }}>
          <RefreshIcon />
        </Box>
      </Box>

      {/* From Field */}
      <SwapInput
        label="Swap from"
        image={fromAsset.ticker.includes('ADA') ? <AdaTokenImage /> : <UsdaTokenImage />}
        asset={fromAsset}
        onAssetSelect={() => null}
        handleAmountChange={amount => handleAmountChange(amount, 'from')}
        showMax
        isFrom
      />

      {/* Clear and switch */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box sx={{ cursor: 'pointer', color: 'primary.500' }} onClick={handleSwitchSelectedAssets}>
          <SwitchIcon />
        </Box>
        <Box>
          <Button onClick={handleResetForm} variant="tertiary" color="primary">
            Clear
          </Button>
        </Box>
      </Box>

      {/* To Field */}
      <SwapInput
        label="Swap to"
        image={toAsset.ticker.includes('ADA') ? <AdaTokenImage /> : <UsdaTokenImage />}
        asset={toAsset}
        onAssetSelect={() => null}
        handleAmountChange={amount => handleAmountChange(amount, 'to')}
      />

      {/* Price between assets */}
      <Box mt="16px">
        <PriceInput
          baseCurrency={fromAsset}
          quoteCurrency={toAsset}
          readonly={isMarketOrder}
          label="Market price"
        />
      </Box>
    </Box>
  );
}
