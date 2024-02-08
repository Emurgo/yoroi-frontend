// @flow
import { Box } from '@mui/material';
import { ReactComponent as InfoIcon } from '../../../../assets/images/revamp/icons/info.inline.svg';
import { useSwap } from '@yoroi/swap';
import { useSwapForm } from '../../context/swap-form';
import { Quantities } from '../../../../utils/quantities';

type Props = {|
  +totalFees: string,
|}

export default function SwapPoolFullInfo({ totalFees }: Props): React$Node {
  const { orderData } = useSwap();
  const { buyTokenInfo } = useSwapForm();
  const buyToken = orderData.tokens?.buyInfo;
  const selectedPool = orderData.selectedPoolCalculation;

  if (!selectedPool) return null;

  const { cost } = selectedPool;

  const minReceived = `${Quantities.format(
    selectedPool.buyAmountWithSlippage.quantity,
    buyToken.decimals
  )} ${buyTokenInfo?.ticker ?? ''}`;

  // TODO: do not hadcode pt decimals and ticker
  const deposit = `${Quantities.format(cost.deposit.quantity, 6)} ADA`;

  return (
    <Box sx={{ display: 'flex', flexFlow: 'column', gap: '8px', mt: '8px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box color="grayscale.500" display="flex" alignItems="center" gap="8px">
          Min ADA{' '}
          <Box component="span" color="grayscale.900">
            <InfoIcon />
          </Box>
        </Box>
        <Box>{deposit}</Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box color="grayscale.500" display="flex" alignItems="center" gap="8px">
          Fees{' '}
          <Box component="span" color="grayscale.900">
            <InfoIcon />
          </Box>
        </Box>
        <Box>{totalFees} ADA</Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box color="grayscale.500" display="flex" alignItems="center" gap="8px">
          Minimum assets received
          <Box component="span" color="grayscale.900">
            <InfoIcon />
          </Box>
        </Box>
        <Box>{minReceived}</Box>
      </Box>
    </Box>
  );
}
