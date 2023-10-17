import { useState } from 'react';
import { Box, Button, Input, Typography } from '@mui/material';
import { ReactComponent as SwitchIcon } from '../../../assets/images/revamp/swap-icon.inline.svg';
import { ReactComponent as RefreshIcon } from '../../../assets/images/revamp/refresh-icon.inline.svg';
import { ReactComponent as InfoIcon } from '../../../assets/images/revamp/info-icon.inline.svg';
import { ReactComponent as EditIcon } from '../../../assets/images/revamp/edit-icon.inline.svg';
import { ReactComponent as AdaTokenImage } from './img.inline.svg';
import { ReactComponent as UsdaTokenImage } from './usda.inline.svg';
import { ReactComponent as PoolImage } from './pool.inline.svg';
import { ReactComponent as SundaeImage } from './sundae.inline.svg';
import { ReactComponent as MuesliImage } from './muesli.inline.svg';
import SwapInput from '../../../components/swap/SwapInput';
import PriceInput from '../../../components/swap/PriceInput';
import SwapPool from '../../../components/swap/SwapPool';
import SelectAssetDialog from '../../../components/swap/SelectAssetDialog';
import SlippageDialog from '../../../components/swap/SlippageDialog';
import SelectPoolDialog from '../../../components/swap/SelectPoolDialog';

const poolList = [
  {
    name: 'Minswap',
    image: <PoolImage />,
    price: 3,
    liquidity: '15,812,265,906,545',
    fee: 0.32,
    deposit: 2,
    isAuto: true,
  },
  {
    name: 'Muesliswap',
    image: <MuesliImage />,
    price: 3,
    liquidity: '4,812,265,906,545',
    fee: 0.3,
    deposit: 2,
  },
  {
    name: 'Sundaeswap',
    image: <SundaeImage />,
    price: 3,
    liquidity: '265,906,545',
    fee: 0.4,
    deposit: 2.5,
  },
];

const defaultFromAsset = { amount: '', walletAmount: 212, ticker: 'TADA' };
const defaultToAsset = { amount: '', walletAmount: 0, ticker: '' };

export default function SwapForm() {
  const [isMarketOrder, setIsMarketOrder] = useState(true);
  const [openedDialog, setOpenedDialog] = useState('');
  const [slippage, setSlippage] = useState('1');
  const [pool, setPool] = useState(poolList[0]);
  const [fromAsset, setFromAsset] = useState(defaultFromAsset);
  const [toAsset, setToAsset] = useState(defaultToAsset);

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

  const handleResetForm = () => {
    setFromAsset(defaultFromAsset);
    setToAsset(defaultToAsset);
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
          label="Swap from"
          image={fromAsset.ticker.includes('ADA') ? <AdaTokenImage /> : <UsdaTokenImage />}
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
          <Box
            onClick={() => handleOpenedDialog('slippage')}
            sx={{ cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center' }}
          >
            <Typography variant="body1" color="grayscale.max">
              {slippage}%
            </Typography>
            <EditIcon />
          </Box>
        </Box>

        {/* Available pools */}
        <Box>
          <SwapPool
            image={pool.image}
            name={pool.name}
            isAuto={pool.isAuto}
            onSelectPool={() => handleOpenedDialog('pool')}
            assets={[
              { ticker: 'TADA', amount: 20 },
              { ticker: 'USDA', amount: 5 },
            ]}
          />
        </Box>
      </Box>

      {/* Dialogs */}
      {(openedDialog === 'from' || openedDialog === 'to') && (
        <SelectAssetDialog
          assets={[
            {
              image: <AdaTokenImage />,
              name: 'TADA',
              ticker: 'TADA',
              walletAmount: 212,
              address: 'TADA',
            },
            {
              image: <UsdaTokenImage />,
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

      {openedDialog === 'slippage' && (
        <SlippageDialog
          currentSlippage={slippage}
          onSlippageApplied={setSlippage}
          onClose={() => handleOpenedDialog('')}
        />
      )}

      {openedDialog === 'pool' && (
        <SelectPoolDialog
          currentPool={pool.name}
          poolList={poolList}
          onPoolSelected={setPool}
          onClose={() => handleOpenedDialog('')}
        />
      )}
    </>
  );
}
