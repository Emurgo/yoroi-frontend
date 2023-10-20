import { useState } from 'react';
import { Box, Button, Input, Typography } from '@mui/material';
import { ReactComponent as SwitchIcon } from '../../../assets/images/revamp/icons/switch.inline.svg';
import { ReactComponent as RefreshIcon } from '../../../assets/images/revamp/icons/refresh.inline.svg';
import { ReactComponent as InfoIcon } from '../../../assets/images/revamp/icons/info.inline.svg';
import { ReactComponent as EditIcon } from '../../../assets/images/revamp/icons/edit.inline.svg';
import { ReactComponent as AdaTokenImage } from './mockAssets/ada.inline.svg';
import { ReactComponent as UsdaTokenImage } from './mockAssets/usda.inline.svg';
import { defaultFromAsset, defaultToAsset, fromAssets, toAssets } from './mockData';
import SwapInput from '../../../components/swap/SwapInput';
import PriceInput from '../../../components/swap/PriceInput';
import SelectAssetDialog from '../../../components/swap/SelectAssetDialog';

export default function SwapForm() {
  const [isMarketOrder, setIsMarketOrder] = useState(true);
  const [openedDialog, setOpenedDialog] = useState('');
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

  const handleSelectedAsset = (asset, type) => {
    const isFrom = type === 'from';
    const setFunc = isFrom ? setFromAsset : setToAsset;

    const assetToSet = (isFrom ? fromAssets : toAssets).find(a => a.address === asset.address);

    if (!assetToSet) return;

    setFunc(assetToSet);
  };

  return (
    <>
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
          image={fromAsset.image}
          asset={fromAsset}
          onAssetSelect={() => handleOpenedDialog('from')}
          handleAmountChange={amount => handleAmountChange(amount, 'from')}
          showMax
          isFrom
        />

        {/* Clear and switch */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box
            sx={{ cursor: 'pointer', color: 'primary.500' }}
            onClick={handleSwitchSelectedAssets}
          >
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
          image={toAsset.image}
          asset={toAsset}
          onAssetSelect={() => handleOpenedDialog('to')}
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

      {/* Dialogs */}
      {(openedDialog === 'from' || openedDialog === 'to') && (
        <SelectAssetDialog
          assets={openedDialog === 'from' ? fromAssets : toAssets}
          type={openedDialog}
          onAssetSelected={asset => handleSelectedAsset(asset, openedDialog)}
          onClose={() => handleOpenedDialog('')}
        />
      )}
    </>
  );
}
