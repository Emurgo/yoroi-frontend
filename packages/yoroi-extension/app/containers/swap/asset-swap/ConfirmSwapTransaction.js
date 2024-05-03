//@flow
import { Box, Typography } from '@mui/material';
import TextField from '../../../components/common/TextField';
import { useSwapForm } from '../context/swap-form';
import { AssetAndAmountRow } from '../../../components/swap/SelectAssetDialog';
import { makeLimitOrder, makePossibleMarketOrder, useSwap, useSwapCreateOrder } from '@yoroi/swap';
import { SwapPoolLabel } from '../../../components/swap/SwapPoolComponents';
import SwapPoolFullInfo from './edit-pool/PoolFullInfo';
import { useSwapFeeDisplay } from '../hooks';
import type { PriceImpact } from '../../../components/swap/types';
import type { RemoteTokenInfo } from '../../../api/ada/lib/state-fetch/types';
import {
  FormattedActualPrice,
  FormattedMarketPrice,
  PriceImpactBanner,
  PriceImpactColored,
  PriceImpactIcon,
  PriceImpactPercent,
} from '../../../components/swap/PriceImpact';
import type { State } from '../context/swap-form/types';
import { useEffect } from 'react';
import { IncorrectWalletPasswordError } from '../../../api/common/errors';
import { InfoTooltip } from '../../../components/widgets/InfoTooltip';

type Props = {|
  slippageValue: string,
  walletAddress: ?string,
  priceImpactState: ?PriceImpact,
  userPasswordState: State<string>,
  txSubmitErrorState: State<?Error>,
  onRemoteOrderDataResolved: any => Promise<void>,
  defaultTokenInfo: RemoteTokenInfo,
  getFormattedPairingValue: (amount: string) => string,
|};

export default function ConfirmSwapTransaction({
  slippageValue,
  walletAddress,
  priceImpactState,
  userPasswordState,
  txSubmitErrorState,
  onRemoteOrderDataResolved,
  defaultTokenInfo,
  getFormattedPairingValue,
}: Props): React$Node {
  const { orderData } = useSwap();
  const {
    selectedPoolCalculation: { pool },
    bestPoolCalculation: { pool: bestPool },
  } = orderData;
  const { sellTokenInfo, buyTokenInfo, sellQuantity, buyQuantity } = useSwapForm();
  const { ptAmount, formattedPtAmount, formattedNonPtAmount } = useSwapFeeDisplay(defaultTokenInfo);

  const isMarketOrder = orderData.type === 'market';
  const isAutoPool = pool?.poolId === bestPool?.poolId;

  const isIncorrectPassword = txSubmitErrorState.value instanceof IncorrectWalletPasswordError;

  const { createOrderData } = useSwapCreateOrder({
    onSuccess: data => {
      onRemoteOrderDataResolved(data).catch(e => {
        console.error('Failed to handle remote order resolution', e);
        alert('Failed to prepare order transaction');
      });
    },
    onError: error => {
      console.error('useSwapCreateOrder fail', error);
      alert('Failed to receive remote data for the order');
    },
  });
  useEffect(() => {
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
        <Typography component="div" variant="h4" fontWeight={500}>
          Confirm swap transaction
        </Typography>
      </Box>
      <Box display="flex" gap="16px" flexDirection="column">
        <Box>
          <Box>
            <Typography component="div" variant="body1" color="ds.gray_c500">
              Swap From
            </Typography>
          </Box>
          <Box>
            <AssetAndAmountRow
              asset={sellTokenInfo}
              displayAmount={sellQuantity.displayValue}
              type="from"
              defaultTokenInfo={defaultTokenInfo}
            />
          </Box>
        </Box>
        <Box>
          <Box>
            <Typography component="div" variant="body1" color="ds.gray_c500">
              Swap To
            </Typography>
          </Box>
          <Box>
            <Box>
              <AssetAndAmountRow
                asset={buyTokenInfo}
                displayAmount={buyQuantity.displayValue}
                type="from"
                defaultTokenInfo={defaultTokenInfo}
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
        <SummaryRow
          col1="Market price"
          withInfo
          infoText="Market price is the best price available on the market among several DEXes that lets you buy or sell an asset instantly"
        >
          <FormattedMarketPrice />
        </SummaryRow>
        <SummaryRow
          col1="Price impact"
          withInfo
          infoText="Limit price in a DEX is a specific pre-set price at which you can trade an asset. Unlike market orders, which execute immediately at the current market price, limit orders are set to execute only when the market reaches the trader's specified price."
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
      <Box p="16px" bgcolor="#244ABF" borderRadius="8px" color="ds.white_static">
        <Box display="flex" justifyContent="space-between">
          <Box>Total</Box>
          <Box>
            <Typography component="div" fontSize="20px" fontWeight="500">
              {formattedNonPtAmount ?? formattedPtAmount}
            </Typography>
          </Box>
        </Box>
        {formattedNonPtAmount && (
          <Box display="flex" justifyContent="right">
            <Box>
              <Typography component="div" fontSize="20px" fontWeight="500">
                {formattedPtAmount}
              </Typography>
            </Box>
          </Box>
        )}
        <Box display="flex" justifyContent="right">
          <Typography component="div" variant="body1">
            {getFormattedPairingValue(ptAmount)}
          </Typography>
        </Box>
      </Box>
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
    </Box>
  );
}

const SummaryRow = ({ col1, children, withInfo = false, infoText = '' }) => (
  <Box display="flex" alignItems="center" justifyContent="space-between">
    <Box display="flex" alignItems="center">
      <Typography component="div" variant="body1" color="ds.gray_c500">
        {col1}
      </Typography>
      {withInfo ? (
        <Box ml="8px">
          <InfoTooltip width={500} content={<Typography color="inherit">{infoText}</Typography>} />
        </Box>
      ) : null}
    </Box>
    <Box>
      <Typography component="div" variant="body1">
        {children}
      </Typography>
    </Box>
  </Box>
);
