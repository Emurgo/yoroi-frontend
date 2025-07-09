import { Box, Typography } from '@mui/material';
import { useSwap } from 'legacySwap';
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
import { useStrings } from '../common/useStrings';
import useSwapForm from '../context/swap-form/useSwapForm';
import SwapPoolFullInfo from './edit-pool/PoolFullInfo';

export const SwapTxInfo = ({ defaultTokenInfo, getTokenInfo, priceImpactState, slippageValue }) => {
  const strings = useStrings();
  const { orderData } = useSwap();
  const {
    selectedPoolCalculation: { pool },
    bestPoolCalculation: { pool: bestPool },
  } = orderData;
  const { sellTokenInfo, buyTokenInfo, sellQuantity, buyQuantity } = useSwapForm();
  const isAutoPool = pool?.poolId === bestPool?.poolId;
  const priceStrings = {
    market: {
      label: strings.marketPrice,
      info: strings.marketPriceTooltip,
    },
    limit: {
      label: strings.limitPrice,
      info: strings.limitPriceTooltip,
    },
  };

  return (
    <Box p="24px">
      <Box display="flex" gap="16px" flexDirection="column" mb="24px">
        <Box>
          <Box>
            <Typography component="div" variant="body1" color="ds.text_gray_low">
              {strings.swapFromLabel}
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
              {strings.swapToLabel}
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
        <SummaryRow col1={strings.dexLabel}>
          <SwapPoolLabel provider={pool?.provider} isAutoPool={isAutoPool} />
        </SummaryRow>
        <SummaryRow col1={strings.slippageTolerance}>{slippageValue}%</SummaryRow>
        <SwapPoolFullInfo defaultTokenInfo={defaultTokenInfo} showMinAda />
        <SummaryRow col1={priceStrings[orderData.type].label} withInfo infoText={priceStrings[orderData.type].info}>
          {orderData.type === 'market' ? <FormattedMarketPrice /> : <FormattedLimitPrice />}
        </SummaryRow>
        <SummaryRow col1={strings.priceImpact} withInfo infoText={strings.priceImpactTooltip}>
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
    </Box>
  );
};

export const SummaryRow = ({ col1, children, withInfo = false, infoText = '' }) => (
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
