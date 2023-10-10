// @flow
import type { Node } from 'react';
import { Component, useState } from 'react';
import { Box, Button, Input, Typography } from '@mui/material';
import { ReactComponent as SwitchIcon } from '../../../assets/images/revamp/swap-icon.inline.svg';
import { ReactComponent as RefreshIcon } from '../../../assets/images/revamp/refresh-icon.inline.svg';
import { ReactComponent as InfoIcon } from '../../../assets/images/revamp/info-icon.inline.svg';
import { ReactComponent as EditIcon } from '../../../assets/images/revamp/edit-icon.inline.svg';
import { ReactComponent as AdaTokenImage } from './img.inline.svg';
import { ReactComponent as PoolImage } from './pool.inline.svg';
import SwapInput from '../../../components/swap/SwapInput';
import PriceInput from '../../../components/swap/PriceInput';
import SwapPool from '../../../components/swap/SwapPool';
import SelectAssetDialog from '../../../components/swap/SelectAssetDialog';

export default function SwapPage(): Node {
  const [isMarketOrder, setIsMarketOrder] = useState(true);
  const [openedDialog, setOpenedDialog] = useState('');
  const [fromAsset, setFromAsset] = useState({ amount: '', walletAmount: 212, ticker: 'TADA' });
  const [toAsset, setToAsset] = useState({ amount: '', walletAmount: 0, ticker: '' });

  const handleOpenedDialog = type => setOpenedDialog(type);
  const handleSwitchSelectedAssets = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
  };
  const handleSelectedAsset = (asset, type) => {
    const func = type === 'from' ? setFromAsset : setToAsset;
    func(asset);
  };

  const handleAmountChange = (amount, type) => {
    const func = type === 'from' ? setFromAsset : setToAsset;
    func(p => ({ ...p, amount }));
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
            <Typography variant="body1" fontWeight={isMarketOrder ? 500 : 400}>
              Market
            </Typography>
          </Box>
          <Box
            onClick={() => setIsMarketOrder(false)}
            p="8px"
            borderRadius="8px"
            bgcolor={!isMarketOrder ? 'grayscale.200' : ''}
          >
            <Typography variant="body1" fontWeight={!isMarketOrder ? 500 : 400}>
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
        key={fromAsset.ticker}
        label="Swap from"
        image={fromAsset.ticker.includes('ADA') ? <AdaTokenImage /> : null}
        asset={fromAsset}
        handleAmountChange={amount => handleAmountChange(amount, 'from')}
        onAssetSelect={() => handleOpenedDialog('from')}
        showMax
        isFrom
      />

      {/* Clear and switch */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box sx={{ cursor: 'pointer' }} onClick={handleSwitchSelectedAssets}>
          <SwitchIcon />
        </Box>
        <Box>
          <Button variant="tertiary" color="primary">
            Clear
          </Button>
        </Box>
      </Box>

      {/* To Field */}
      <SwapInput
        key={toAsset.ticker}
        label="Swap to"
        image={toAsset.ticker.includes('ADA') ? <AdaTokenImage /> : null}
        asset={toAsset}
        onAssetSelect={() => handleOpenedDialog('to')}
        handleAmountChange={amount => handleAmountChange(amount, 'to')}
      />

      {/* Price between assets */}
      <Box mt="16px">
        <PriceInput
          baseCurrency={{ ticker: 'TADA', amount: 20 }}
          quoteCurrency={{ ticker: 'USDA', amount: 5 }}
          readonly={isMarketOrder}
          label="Market price"
        />
      </Box>

      {/* Slippage settings */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box display="flex" gap="8px" alignItems="center">
          <Typography variant="body1" color="grayscale.500">
            Slippage tolerance
          </Typography>
          <InfoIcon />
        </Box>
        <Box display="flex" gap="4px" alignItems="center">
          <Typography variant="body1" color="grayscale.max">
            1%
          </Typography>
          <EditIcon />
        </Box>
      </Box>

      {/* Available pools */}
      <Box>
        <SwapPool
          image={<PoolImage />}
          name="Minswap (Auto)"
          assets={[
            { ticker: 'TADA', amount: 20 },
            { ticker: 'USDA', amount: 5 },
          ]}
        />
      </Box>

      {/* Dialogs */}
      {(openedDialog === 'from' || openedDialog === 'to') && (
        <SelectAssetDialog
          assets={[
            { name: 'TADA', ticker: 'TADA', walletAmount: 212, address: 'TADA' },
            {
              name: 'Anzens USD',
              ticker: 'USDA',
              walletAmount: 10,
              amount: 0,
              address: 'addr1asdl4bl0f328dsckmx23443mllsdkfj32e4',
            },
          ]}
          type={openedDialog}
          onAssetSelected={asset => handleSelectedAsset(asset, openedDialog)}
          onClose={() => handleOpenedDialog('')}
        />
      )}
    </Box>
  );
}
