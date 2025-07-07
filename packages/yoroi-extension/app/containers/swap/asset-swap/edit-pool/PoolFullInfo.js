// @flow

import { Box, Typography } from '@mui/material';
import { useSwap } from 'legacySwap';
import { useSwapForm } from '../../context/swap-form';
import { Quantities } from '../../../../utils/quantities';
import { useSwapFeeDisplay } from '../../hooks';
import type { RemoteTokenInfo } from '../../../../api/ada/lib/state-fetch/types';
import { InfoTooltip } from '../../../../components/widgets/InfoTooltip';
import { useStrings } from '../../common/useStrings';

type Props = {|
  +defaultTokenInfo: RemoteTokenInfo,
  withInfo?: boolean,
  showMinAda?: boolean,
|};

export default function SwapPoolFullInfo({ defaultTokenInfo, withInfo, showMinAda }: Props): React$Node {
  const { orderData } = useSwap();
  const strings = useStrings();
  const { buyTokenInfo, sellTokenInfo } = useSwapForm();
  const { formattedFee } = useSwapFeeDisplay(defaultTokenInfo);

  const buyToken = orderData.tokens?.buyInfo;
  const calculation = orderData.selectedPoolCalculation;

  if (!calculation) return null;

  const { cost } = calculation;

  const ptDecimals = defaultTokenInfo.decimals ?? 0;
  const ptTicker = defaultTokenInfo.ticker ?? '';
  const buyTicker = buyTokenInfo?.ticker ?? '';

  const minReceived = Quantities.format(calculation.buyAmountWithSlippage.quantity, buyToken.decimals);

  const deposit = Quantities.format(cost.deposit.quantity, ptDecimals);
  const liqFeeQuantity = Quantities.format(cost.liquidityFee.quantity, ptDecimals ?? 0);

  return (
    <Box sx={{ display: 'flex', flexFlow: 'column', gap: '8px' }}>
      {showMinAda && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box color="grayscale.600" display="flex" alignItems="center" gap="8px">
            <Typography color="ds.text_gray_low">{strings.minAda}</Typography>
            {withInfo && <InfoTooltip content={strings.adaDepositTooltip} />}
          </Box>
          <Box color="ds.text_gray_medium">
            {deposit} {ptTicker}
          </Box>
        </Box>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box color="grayscale.600" display="flex" alignItems="center" gap="8px">
          <Typography color="ds.text_gray_low">{strings.fees}</Typography>
          {withInfo && (
            <InfoTooltip
              content={
                <>
                  <Typography variant="body2" color="ds.gray_min">
                    {strings.feesIncluded}
                  </Typography>
                  <Typography variant="body2" color="ds.gray_min">
                    {strings.dexFee}
                  </Typography>
                  <Typography variant="body2" color="ds.gray_min">
                    {strings.frontendFee}
                  </Typography>
                </>
              }
            />
          )}
        </Box>
        <Typography color="ds.text_gray_medium">{formattedFee}</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box color="grayscale.600" display="flex" alignItems="center" gap="8px">
          <Typography color="ds.text_gray_low">{strings.minimumAssets}</Typography>
          {withInfo && <InfoTooltip content={strings.minimumAssetsTooltip} />}
        </Box>
        <Typography color="ds.text_gray_medium">
          {minReceived} {buyTicker}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box color="grayscale.600" display="flex" alignItems="center" gap="8px">
          <Typography color="ds.text_gray_low">{strings.lpFee}</Typography>
          {withInfo && <InfoTooltip content={strings.lpFeeTooltip} />}
        </Box>
        <Typography color="ds.text_gray_medium">
          {liqFeeQuantity} {sellTokenInfo.ticker}
        </Typography>
      </Box>
    </Box>
  );
}
