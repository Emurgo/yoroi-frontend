// @flow

import { Box, Typography } from '@mui/material';
import { useSwap } from '@yoroi/swap';
import { useSwapForm } from '../../context/swap-form';
import { Quantities } from '../../../../utils/quantities';
import { useSwapFeeDisplay } from '../../hooks';
import type { RemoteTokenInfo } from '../../../../api/ada/lib/state-fetch/types';
import { InfoTooltip } from '../../../../components/widgets/InfoTooltip';

type Props = {|
  +defaultTokenInfo: RemoteTokenInfo,
  withInfo?: boolean,
  showMinAda?: boolean,
|};

export default function SwapPoolFullInfo({
  defaultTokenInfo,
  withInfo,
  showMinAda,
}: Props): React$Node {
  const { orderData } = useSwap();
  const { buyTokenInfo, sellTokenInfo } = useSwapForm();
  const { formattedFee } = useSwapFeeDisplay(defaultTokenInfo);

  const buyToken = orderData.tokens?.buyInfo;
  const calculation = orderData.selectedPoolCalculation;

  if (!calculation) return null;

  const { cost } = calculation;

  const ptDecimals = defaultTokenInfo.decimals ?? 0;
  const ptTicker = defaultTokenInfo.ticker ?? '';
  const buyTicker = buyTokenInfo?.ticker ?? '';

  const minReceived = Quantities.format(
    calculation.buyAmountWithSlippage.quantity,
    buyToken.decimals
  );

  const deposit = Quantities.format(cost.deposit.quantity, ptDecimals);
  const liqFeeQuantity = Quantities.format(cost.liquidityFee.quantity, ptDecimals ?? 0);

  return (
    <Box sx={{ display: 'flex', flexFlow: 'column', gap: '8px' }}>
      {showMinAda && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box color="grayscale.600" display="flex" alignItems="center" gap="8px">
            <Typography>Min ADA</Typography>
            {withInfo && (
              <InfoTooltip
                content={
                  'A small ADA deposit that will be returned when your order is processed or canceled'
                }
              />
            )}
          </Box>
          <Box>
            {deposit} {ptTicker}
          </Box>
        </Box>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box color="grayscale.600" display="flex" alignItems="center" gap="8px">
          <Typography>Fees</Typography>
          {withInfo && (
            <InfoTooltip
              content={
                <>
                  <Typography color="inherit">Fees included:</Typography>
                  <Typography color="inherit">• DEX fee</Typography>
                  <Typography color="inherit">• Frontend fee</Typography>
                </>
              }
            />
          )}
        </Box>
        <Box>{formattedFee}</Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box color="grayscale.600" display="flex" alignItems="center" gap="8px">
          <Typography>Minimum assets received</Typography>
          {withInfo && (
            <InfoTooltip
              content={'The minimum amount you are guaranteed to receive in case of price slippage'}
            />
          )}
        </Box>
        <Box>
          {minReceived} {buyTicker}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box color="grayscale.600" display="flex" alignItems="center" gap="8px">
          <Typography>Liquidity provider fee</Typography>
          {withInfo && (
            <InfoTooltip
              content={
                'A fixed 0.3% operational fee paid to liquidity providers as a reward for supplying tokens, enabling traders to buy and sell assets on the decentralized Cardano network'
              }
            />
          )}
        </Box>
        <Box>{liqFeeQuantity} ADA</Box>
      </Box>
    </Box>
  );
}
