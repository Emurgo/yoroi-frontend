// @flow
import type { RemoteTokenInfo } from '../../../api/ada/lib/state-fetch/types';
import type { PriceImpact } from '../../../components/swap/types';
import { useState } from 'react';
import { Box } from '@mui/material';
import SwapPriceInput from '../../../components/swap/SwapPriceInput';
import SlippageDialog from '../../../components/swap/SlippageDialog';
import { useSwap } from '@yoroi/swap';
import EditSellAmount from './edit-sell-amount/EditSellAmount';
import EditBuyAmount from './edit-buy-amount/EditBuyAmount';
import SelectBuyTokenFromList from './edit-buy-amount/SelectBuyTokenFromList';
import SelectSellTokenFromList from './edit-sell-amount/SelectSellTokenFromList';
import EditSwapPool from './edit-pool/EditPool';
import SelectSwapPoolFromList from './edit-pool/SelectPoolFromList';
import SwapStore from '../../../stores/ada/SwapStore';
import { useAsyncPools } from '../hooks';
import { TopActions } from './actions/TopActions';
import { MiddleActions } from './actions/MiddleActions';
import { EditSlippage } from './actions/EditSlippage';
import { useSwapForm } from '../context/swap-form';

type Props = {|
  slippageValue: string,
  onSetNewSlippage: number => void,
  swapStore: SwapStore,
  defaultTokenInfo: RemoteTokenInfo,
  getTokenInfo: string => Promise<RemoteTokenInfo>,
  priceImpactState: ?PriceImpact,
|};

export const CreateSwapOrder = ({
  slippageValue,
  onSetNewSlippage,
  swapStore,
  defaultTokenInfo,
  getTokenInfo,
  priceImpactState,
}: Props): React$Node => {
  const [openedDialog, setOpenedDialog] = useState('');
  const [prevSelectedPoolId, setPrevSelectedPoolId] = useState<?string>(undefined);

  const {
    orderData: {
      amounts: { sell, buy },
      type: orderType,
      selectedPoolCalculation,
    },
    // unsignedTxChanged,
    sellTokenInfoChanged,
    buyTokenInfoChanged,
  } = useSwap();

  const { onChangeLimitPrice } = useSwapForm();

  const resetLimitPrice = () => {
    onChangeLimitPrice('');
  };

  if (orderType === 'market') {
    const selectedPoolId = selectedPoolCalculation?.pool.poolId;
    if (selectedPoolId !== prevSelectedPoolId) {
      setPrevSelectedPoolId(selectedPoolId);
      resetLimitPrice();
    }
  }

  useAsyncPools(sell.tokenId, buy.tokenId)
    .then(() => null)
    .catch(() => null);

  return (
    <>
      <Box
        width="100%"
        mx="auto"
        maxWidth="506px"
        display="flex"
        flexDirection="column"
        gap="8px"
        pb="20px"
      >
        {/* Order type and refresh */}
        <TopActions orderType={orderType} />

        {/* From Field */}
        <EditSellAmount
          defaultTokenInfo={defaultTokenInfo}
          getTokenInfo={getTokenInfo}
          onAssetSelect={() => setOpenedDialog('from')}
        />

        {/* Clear and switch */}
        <MiddleActions swapStore={swapStore} />

        {/* To Field */}
        <EditBuyAmount
          defaultTokenInfo={defaultTokenInfo}
          getTokenInfo={getTokenInfo}
          onAssetSelect={() => setOpenedDialog('to')}
        />

        {/* Price between assets */}
        <SwapPriceInput priceImpactState={priceImpactState} />

        {/* Slippage settings */}
        <EditSlippage
          setOpenedDialog={() => setOpenedDialog('slippage')}
          slippageValue={slippageValue}
        />

        {/* Available pools */}
        <EditSwapPool
          handleEditPool={() => setOpenedDialog('pool')}
          defaultTokenInfo={defaultTokenInfo}
        />
      </Box>

      {/* Dialogs */}
      {openedDialog === 'from' && (
        <SelectSellTokenFromList
          store={swapStore}
          onClose={() => setOpenedDialog('')}
          onTokenInfoChanged={val => {
            resetLimitPrice();
            sellTokenInfoChanged(val);
          }}
          defaultTokenInfo={defaultTokenInfo}
          getTokenInfo={getTokenInfo}
        />
      )}
      {openedDialog === 'to' && (
        <SelectBuyTokenFromList
          store={swapStore}
          onClose={() => setOpenedDialog('')}
          onTokenInfoChanged={val => {
            resetLimitPrice();
            buyTokenInfoChanged(val);
          }}
          defaultTokenInfo={defaultTokenInfo}
          getTokenInfo={getTokenInfo}
        />
      )}
      {openedDialog === 'slippage' && (
        <SlippageDialog
          slippageValue={slippageValue}
          onSetNewSlippage={onSetNewSlippage}
          onClose={() => setOpenedDialog('')}
        />
      )}
      {openedDialog === 'pool' && (
        <SelectSwapPoolFromList
          defaultTokenInfo={defaultTokenInfo}
          onClose={() => setOpenedDialog('')}
        />
      )}
    </>
  );
};
