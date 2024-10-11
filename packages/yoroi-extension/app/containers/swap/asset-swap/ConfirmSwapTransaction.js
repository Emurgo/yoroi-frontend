//@flow
import { Box, Typography, styled } from '@mui/material';
import { makeLimitOrder, makePossibleMarketOrder, useSwap, useSwapCreateOrder } from '@yoroi/swap';
import { useEffect } from 'react';
import { IncorrectWalletPasswordError } from '../../../api/common/errors';
import TextField from '../../../components/common/TextField';
import {
  FormattedActualPrice,
  FormattedLimitPrice,
  FormattedMarketPrice,
  PriceImpactBanner,
  PriceImpactColored,
  PriceImpactIcon,
  PriceImpactPercent,
} from '../../../components/swap/PriceImpact';
import { AssetAndAmountRow } from '../../../components/swap/SelectAssetDialog';
import { SwapPoolLabel } from '../../../components/swap/SwapPoolComponents';
import { InfoTooltip } from '../../../components/widgets/InfoTooltip';
import { useSwapForm } from '../context/swap-form';
import { useSwapFeeDisplay } from '../hooks';
import SwapPoolFullInfo from './edit-pool/PoolFullInfo';
import type { RemoteTokenInfo } from '../../../api/ada/lib/state-fetch/types';
import type { PriceImpact } from '../../../components/swap/types';
import type { State } from '../context/swap-form/types';
import { ampli } from '../../../../ampli/index';
import { maybe } from '../../../coreUtils';
import { identifierToPolicy } from '../../../api/assetUtils';

const GradientBox = styled(Box)(({ theme }: any) => ({
  backgroundImage: theme.palette.ds.bg_gradient_3,
}));

type Props = {|
  slippageValue: string,
  walletAddress: ?string,
  priceImpactState: ?PriceImpact,
  userPasswordState: ?State<string>,
  txSubmitErrorState: State<?Error>,
  onRemoteOrderDataResolved: any => Promise<void>,
  defaultTokenInfo: RemoteTokenInfo,
  getTokenInfo: string => Promise<RemoteTokenInfo>,
  getFormattedPairingValue: (amount: string) => string,
  onError: () => void,
|};

const priceStrings = {
  market: {
    label: 'Market price',
    info:
      'Market price is the best price available on the market among several DEXes that lets you buy or sell an asset instantly',
  },
  limit: {
    label: 'Limit price',
    info:
      "Limit price in a DEX is a specific pre-set price at which you can trade an asset. Unlike market orders, which execute immediately at the current market price, limit orders are set to execute only when the market reaches the trader's specified price.",
  },
};

export default function ConfirmSwapTransaction({
  slippageValue,
  walletAddress,
  priceImpactState,
  userPasswordState,
  txSubmitErrorState,
  onRemoteOrderDataResolved,
  defaultTokenInfo,
  getTokenInfo,
  getFormattedPairingValue,
  onError,
}: Props): React$Node {
  const { orderData } = useSwap();
  const {
    selectedPoolCalculation: { pool },
    bestPoolCalculation: { pool: bestPool },
  } = orderData;
  const { sellTokenInfo, buyTokenInfo, sellQuantity, buyQuantity } = useSwapForm();
  const { ptAmount, formattedPtAmount, formattedNonPtAmount, formattedFeeQuantity } = useSwapFeeDisplay(defaultTokenInfo);

  const isMarketOrder = orderData.type === 'market';
  const isAutoPool = pool?.poolId === bestPool?.poolId;

  const isIncorrectPassword = txSubmitErrorState.value instanceof IncorrectWalletPasswordError;

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
      from_amount: sellQuantity.displayValue,
      from_asset: [{
        asset_ticker: sellTokenInfo?.ticker,
        asset_name: sellTokenInfo?.name,
        policy_id: maybe(sellTokenInfo?.id, identifierToPolicy),
      }],
      to_amount: buyQuantity.displayValue,
      to_asset: [{
        asset_ticker: buyTokenInfo?.ticker,
        asset_name: buyTokenInfo?.name,
        policy_id: maybe(buyTokenInfo?.id, identifierToPolicy),
      }],
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
          Confirm swap transaction
        </Typography>
      </Box>
      <Box display="flex" gap="16px" flexDirection="column">
        <Box>
          <Box>
            <Typography component="div" variant="body1" color="ds.text_gray_low">
              Swap from
            </Typography>
          </Box>
          <Box>
            <AssetAndAmountRow
              asset={sellTokenInfo}
              displayAmount={sellQuantity.displayValue}
              type="from"
              defaultTokenInfo={defaultTokenInfo}
              getTokenInfo={getTokenInfo}
            />
          </Box>
        </Box>
        <Box>
          <Box>
            <Typography component="div" variant="body1" color="ds.text_gray_low">
              Swap to
            </Typography>
          </Box>
          <Box>
            <Box>
              <AssetAndAmountRow
                asset={buyTokenInfo}
                displayAmount={buyQuantity.displayValue}
                type="from"
                defaultTokenInfo={defaultTokenInfo}
                getTokenInfo={getTokenInfo}
                priceImpactState={priceImpactState}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <PriceImpactBanner priceImpactState={priceImpactState} />

      <Box display="flex" flexDirection="column" gap="8px">
        <SummaryRow col1="DEX">
          <SwapPoolLabel provider={pool?.provider} isAutoPool={isAutoPool} />
        </SummaryRow>
        <SummaryRow col1="Slippage tolerance">{slippageValue}%</SummaryRow>
        <SwapPoolFullInfo defaultTokenInfo={defaultTokenInfo} showMinAda />
        <SummaryRow col1={priceStrings[orderData.type].label} withInfo infoText={priceStrings[orderData.type].info}>
          {orderData.type === 'market' ? <FormattedMarketPrice /> : <FormattedLimitPrice />}
        </SummaryRow>
        <SummaryRow
          col1="Price impact"
          withInfo
          infoText="Price impact is a difference between the actual market price and your price due to trade size."
        >
          <PriceImpactColored priceImpactState={priceImpactState} sx={{ display: 'flex' }}>
            {priceImpactState && <PriceImpactIcon isSevere={priceImpactState.isSevere} />}
            <PriceImpactPercent />
          </PriceImpactColored>
        </SummaryRow>
        {priceImpactState && (
          <SummaryRow col1="">
            <PriceImpactColored priceImpactState={priceImpactState}>
              (<FormattedActualPrice />)
            </PriceImpactColored>
          </SummaryRow>
        )}
      </Box>
      <GradientBox p="16px" borderRadius="8px" color="common.white">
        <Box display="flex" justifyContent="space-between">
          <Typography color="ds.white_static">Total</Typography>
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
      {userPasswordState != null && (
        <Box>
          <TextField
            className="walletPassword"
            value={userPasswordState.value}
            label="Password"
            type="password"
            onChange={e => {
              txSubmitErrorState.update(null);
              userPasswordState.update(e.target.value);
            }}
            error={isIncorrectPassword && 'Incorrect password!'}
          />
        </Box>
      )}
    </Box>
  );
}

const SummaryRow = ({ col1, children, withInfo = false, infoText = '' }) => (
  <Box display="flex" alignItems="center" justifyContent="space-between">
    <Box display="flex" alignItems="center">
      <Typography variant="body1" color="ds.text_gray_low">
        {col1}
      </Typography>
      {withInfo ? (
        <Box ml="8px" sx={{ height: '24px' }}>
          <InfoTooltip width={500} content={<Typography color="inherit">{infoText}</Typography>} />
        </Box>
      ) : null}
    </Box>
    <Box>
      <Typography component="div" variant="body1" color="ds.text_gray_medium">
        {children}
      </Typography>
    </Box>
  </Box>
);
