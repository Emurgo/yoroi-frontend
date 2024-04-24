// @flow
import { Box } from '@mui/material';
import { ReactComponent as InfoIcon } from '../../../../assets/images/revamp/icons/info.inline.svg';
import { useSwap } from '@yoroi/swap';
import { useSwapForm } from '../../context/swap-form';
import { Quantities } from '../../../../utils/quantities';
import { useSwapFeeDisplay } from '../../hooks';
import type { RemoteTokenInfo } from '../../../../api/ada/lib/state-fetch/types';

type Props = {|
  +defaultTokenInfo: RemoteTokenInfo,
|}

export default function SwapPoolFullInfo({ defaultTokenInfo }: Props): React$Node {
  const { orderData } = useSwap();
  const { buyTokenInfo } = useSwapForm();
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
    buyToken.decimals,
  );

  const deposit = Quantities.format(
    cost.deposit.quantity,
    ptDecimals,
  );

  return (
    <Box sx={{ display: 'flex', flexFlow: 'column', gap: '8px', mt: '8px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box color="grayscale.500" display="flex" alignItems="center" gap="8px">
          Min ADA
          <Box component="span" color="grayscale.900">
            <InfoIcon />
          </Box>
        </Box>
        <Box>{deposit} {ptTicker}</Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box color="grayscale.500" display="flex" alignItems="center" gap="8px">
          Fees
          <Box component="span" color="grayscale.900">
            <InfoIcon />
          </Box>
        </Box>
        <Box>{formattedFee}</Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box color="grayscale.500" display="flex" alignItems="center" gap="8px">
          Minimum assets received
          <Box component="span" color="grayscale.900">
            <InfoIcon />
          </Box>
        </Box>
        <Box>{minReceived} {buyTicker}</Box>
      </Box>
    </Box>
  );
}
