// @flow
import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as SwitchIcon } from '../../../assets/images/revamp/icons/switch.inline.svg';
import { ReactComponent as InfoIcon } from '../../../assets/images/revamp/icons/info.inline.svg';
import { ReactComponent as EditIcon } from '../../../assets/images/revamp/icons/edit.inline.svg';
import { ReactComponent as RefreshIcon } from '../../../assets/images/revamp/icons/refresh.inline.svg';
import PriceInput from '../../../components/swap/PriceInput';
import SlippageDialog from '../../../components/swap/SlippageDialog';
import Tabs from '../../../components/common/tabs/Tabs';
import {
  // makeLimitOrder,
  // makePossibleMarketOrder,
  useSwap,
  // useSwapCreateOrder,
  useSwapPoolsByPair,
} from '@yoroi/swap';
import { useSwapForm } from '../context/swap-form';
import EditSellAmount from './edit-sell-amount/EditSellAmount';
import EditBuyAmount from './edit-buy-amount/EditBuyAmount';
import SelectBuyTokenFromList from './edit-buy-amount/SelectBuyTokenFromList';
import SelectSellTokenFromList from './edit-sell-amount/SelectSellTokenFromList';
import EditSwapPool from './edit-pool/EditPool';
import SelectSwapPoolFromList from './edit-pool/SelectPoolFromList';

type Props = {|
  onLimitSwap: void => void,
  slippageValue: string,
  onSetNewSlippage: number => void,
|};

export default function SwapForm({ onLimitSwap, slippageValue, onSetNewSlippage }: Props): React$Node {
  const [openedDialog, setOpenedDialog] = useState('');
  const {
    // sellQuantity: { isTouched: isSellTouched },
    // buyQuantity: { isTouched: isBuyTouched },
    // sellAmountErrorChanged,
    // poolDefaulted,
    // canSwap,
    resetSwapForm,
    switchTokens,
  } = useSwapForm();

  const {
    orderData,
    // unsignedTxChanged,
    poolPairsChanged,
    orderTypeChanged,
  } = useSwap();

  useSwapPoolsByPair(
    {
      tokenA: orderData.amounts.sell.tokenId,
      tokenB: orderData.amounts.buy.tokenId,
    },
    {
      enabled: true,
      onSuccess: pools => {
        poolPairsChanged(pools);
      },
    }
  );

  const handleSwitchSelectedAssets = () => {
    switchTokens();
  };

  const handleResetForm = () => {
    resetSwapForm();
  };

  const orderTypeTabs = [
    { type: 'market', label: 'Market' },
    { type: 'limit', label: 'Limit' },
  ];

  return (
    <>
      <Box width="100%" mx="auto" maxWidth="506px" display="flex" flexDirection="column" gap="16px">
        <Box display="flex" alignItems="center" justifyContent="space-between" mb="16px">
          <Tabs
            tabs={orderTypeTabs.map(({ type, label }) => ({
              label,
              isActive: orderData.type === type,
              onClick: () => orderTypeChanged(type)
            }))}
          />
          <Box sx={{ cursor: 'pointer' }}>
            <RefreshIcon />
          </Box>
        </Box>

        {/* From Field */}
        <EditSellAmount onAssetSelect={() => setOpenedDialog('from')} />

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
        <EditBuyAmount onAssetSelect={() => setOpenedDialog('to')} />

        {/* Price between assets */}
        <Box mt="16px">
          <PriceInput label="Market price" />
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
            <Typography component="div" variant="body1" color="grayscale.500">
              Slippage tolerance
            </Typography>
            <InfoIcon />
          </Box>
          <Box
            onClick={() => setOpenedDialog('slippage')}
            sx={{ cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center' }}
          >
            <Typography component="div" variant="body1" color="grayscale.max">
              {slippageValue}%
            </Typography>
            <EditIcon />
          </Box>
        </Box>

        {/* Available pools */}
        <EditSwapPool handleEditPool={() => setOpenedDialog('pool')} />
      </Box>

      {/* Dialogs */}
      {openedDialog === 'from' && <SelectSellTokenFromList onClose={() => setOpenedDialog('')} />}
      {openedDialog === 'to' && <SelectBuyTokenFromList onClose={() => setOpenedDialog('')} />}
      {openedDialog === 'slippage' && (
        <SlippageDialog
          slippageValue={slippageValue}
          onSetNewSlippage={onSetNewSlippage}
          onClose={() => setOpenedDialog('')}
        />
      )}
      {openedDialog === 'pool' && <SelectSwapPoolFromList onClose={() => setOpenedDialog('')} />}
    </>
  );
}
