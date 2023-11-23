// @flow
import type { Node } from 'react';
import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as SwitchIcon } from '../../../assets/images/revamp/icons/switch.inline.svg';
import { ReactComponent as InfoIcon } from '../../../assets/images/revamp/icons/info.inline.svg';
import { ReactComponent as EditIcon } from '../../../assets/images/revamp/icons/edit.inline.svg';
import { ReactComponent as RefreshIcon } from '../../../assets/images/revamp/icons/refresh.inline.svg';
import { ReactComponent as DefaultToken } from '../../../assets/images/revamp/token-default.inline.svg';
import { defaultFromAsset, defaultToAsset, fromAssets, poolList, toAssets } from './mockData';
import SwapInput from '../../../components/swap/SwapInput';
import PriceInput from '../../../components/swap/PriceInput';
import SelectAssetDialog from '../../../components/swap/SelectAssetDialog';
import SlippageDialog from '../../../components/swap/SlippageDialog';
import SelectPoolDialog from '../../../components/swap/SelectPoolDialog';
import SwapPool from '../../../components/swap/SwapPool';
import Tabs from '../../../components/common/tabs/Tabs';

type Props = {|
  onLimitSwap: void => void,
|};

export default function SwapForm({ onLimitSwap }: Props): React$Node {
  const [isMarketOrder, setIsMarketOrder] = useState(true);
  const [openedDialog, setOpenedDialog] = useState('');
  const [pool, setPool] = useState(poolList[0]);
  const [slippage, setSlippage] = useState('1');
  const [fromAsset, setFromAsset] = useState(defaultFromAsset);
  const [toAsset, setToAsset] = useState(defaultToAsset);

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
          <Tabs
            tabs={[
              { label: 'Market', isActive: isMarketOrder, onClick: () => setIsMarketOrder(true) },
              {
                label: 'Limit',
                isActive: !isMarketOrder,
                onClick: () => {
                  setIsMarketOrder(false);
                  onLimitSwap();
                },
              },
            ]}
          />
          <Box sx={{ cursor: 'pointer' }}>
            <RefreshIcon />
          </Box>
        </Box>

        {/* From Field */}
        <SwapInput
          label="Swap from"
          image={fromAsset.image}
          asset={fromAsset}
          onAssetSelect={() => setOpenedDialog('from')}
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
          onAssetSelect={() => setOpenedDialog('to')}
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
            onClick={() => setOpenedDialog('slippage')}
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
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: '16px',
            }}
          >
            <Box display="flex" gap="8px" alignItems="center">
              <Typography variant="body1" color="grayscale.500">
                DEX
              </Typography>
              <InfoIcon />
            </Box>
            <Box
              onClick={() => !isMarketOrder && setOpenedDialog('pool')}
              sx={{ cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center' }}
            >
              <Box sx={{ width: '24px', height: '24px' }}>{pool.image || <DefaultToken />}</Box>
              <Typography variant="body1" color="grayscale.max">
                {pool.name ? `${pool.name} ${pool.isAuto ? '(Auto)' : ''}` : 'No pool found'}
              </Typography>

              {!isMarketOrder && <EditIcon />}
            </Box>
          </Box>

          <SwapPool
            fees="0"
            minAda="0"
            minAssets="0"
            baseCurrency={fromAsset}
            quoteCurrency={toAsset}
          />
        </Box>
      </Box>

      {/* Dialogs */}
      {(openedDialog === 'from' || openedDialog === 'to') && (
        <SelectAssetDialog
          assets={openedDialog === 'from' ? fromAssets : toAssets}
          type={openedDialog}
          onAssetSelected={asset => handleSelectedAsset(asset, openedDialog)}
          onClose={() => setOpenedDialog('')}
        />
      )}

      {openedDialog === 'slippage' && (
        <SlippageDialog
          currentSlippage={slippage}
          onSlippageApplied={setSlippage}
          onClose={() => setOpenedDialog('')}
        />
      )}

      {openedDialog === 'pool' && (
        <SelectPoolDialog
          currentPool={pool.name}
          poolList={poolList}
          onPoolSelected={setPool}
          onClose={() => setOpenedDialog('')}
        />
      )}
    </>
  );
}
