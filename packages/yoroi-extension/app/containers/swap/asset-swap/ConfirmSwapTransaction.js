//@flow
import { Box, Typography, styled } from '@mui/material';
import { makeLimitOrder, makePossibleMarketOrder, useSwap, useSwapCreateOrder } from 'legacySwap';
import { useEffect } from 'react';
import { useSwapForm } from '../context/swap-form';
import { useSwapFeeDisplay } from '../hooks';
import type { RemoteTokenInfo } from '../../../api/ada/lib/state-fetch/types';
import type { PriceImpact } from '../../../components/swap/types';
import { ampli } from '../../../../ampli/index';
import { tokenInfoToAnalyticsFromAndToAssets } from '../swapAnalytics';
import { useStrings } from '../common/useStrings';
import { SwapTxInfo } from './SwapTxInfo';

const GradientBox = styled(Box)(({ theme }: any) => ({
  backgroundImage: theme.palette.ds.bg_gradient_3,
}));

type Props = {|
  slippageValue: string,
  walletAddress: ?string,
  priceImpactState: ?PriceImpact,
  onRemoteOrderDataResolved: any => Promise<void>,
  defaultTokenInfo: RemoteTokenInfo,
  getTokenInfo: string => Promise<RemoteTokenInfo>,
  getFormattedPairingValue: (amount: string) => string,
  onError: () => void,
|};

export default function ConfirmSwapTransaction({
  slippageValue,
  walletAddress,
  priceImpactState,
  onRemoteOrderDataResolved,
  defaultTokenInfo,
  getTokenInfo,
  getFormattedPairingValue,
  onError,
}: Props): React$Node {
  const { orderData } = useSwap();
  const {
    selectedPoolCalculation: { pool },
  } = orderData;
  const { sellTokenInfo, buyTokenInfo, sellQuantity, buyQuantity } = useSwapForm();
  const { ptAmount, formattedPtAmount, formattedNonPtAmount, formattedFeeQuantity } = useSwapFeeDisplay(defaultTokenInfo);

  const isMarketOrder = orderData.type === 'market';

  const strings = useStrings();

  const { createOrderData } = useSwapCreateOrder({
    onSuccess: data => {
      onRemoteOrderDataResolved(data).catch(e => {
        console.error('Failed to handle remote order resolution', e);
        onError();
      });
    },
    onError: error => {
      console.error('useSwapCreateOrder fail', error);
      onError();
    },
  });
  useEffect(() => {
    // MOUNT

    ampli.swapOrderSelected({
      ...tokenInfoToAnalyticsFromAndToAssets(sellTokenInfo, buyTokenInfo),
      from_amount: sellQuantity.displayValue,
      to_amount: buyQuantity.displayValue,
      order_type: orderData.type,
      pool_source: pool?.provider,
      slippage_tolerance: orderData.slippage,
      swap_fees: Number(formattedFeeQuantity),
    });

    if (walletAddress == null) {
      alert('Wallet address is not available');
      return;
    }
    createOrderData(
      (isMarketOrder ? makePossibleMarketOrder : makeLimitOrder)(
        orderData.amounts.sell,
        orderData.amounts.buy,
        orderData.selectedPoolCalculation?.pool,
        orderData.slippage,
        walletAddress
      )
    );
  }, []);

  return (
    <Box width="100%" mx="auto" maxWidth="506px" display="flex" flexDirection="column" gap="24px">
      <Box textAlign="center">
        <Typography component="div" variant="h4" fontWeight={500} color="ds.text_gray_medium">
          {strings.confirmSwapTx}
        </Typography>
      </Box>
      <SwapTxInfo
        defaultTokenInfo={defaultTokenInfo}
        getTokenInfo={getTokenInfo}
        priceImpactState={priceImpactState}
        slippageValue={slippageValue}
      />
      <GradientBox p="16px" borderRadius="8px" color="common.white">
        <Box display="flex" justifyContent="space-between">
          <Typography color="ds.white_static">{strings.total}</Typography>
          <Box>
            <Typography component="div" fontSize="20px" fontWeight="500" color="ds.white_static">
              {formattedNonPtAmount ?? formattedPtAmount}
            </Typography>
          </Box>
        </Box>
        {formattedNonPtAmount && (
          <Box display="flex" justifyContent="right">
            <Box>
              <Typography component="div" fontSize="20px" fontWeight="500" color="ds.white_static">
                {formattedPtAmount}
              </Typography>
            </Box>
          </Box>
        )}
        <Box display="flex" justifyContent="right">
          <Typography component="div" variant="body1" color="ds.white_static" sx={{ opacity: '0.5' }}>
            {getFormattedPairingValue(ptAmount)}
          </Typography>
        </Box>
      </GradientBox>
    </Box>
  );
}
