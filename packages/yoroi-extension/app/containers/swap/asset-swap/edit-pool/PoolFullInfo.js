// @flow

import React from 'react';
import { Box, Typography } from '@mui/material';
import { ReactComponent as InformationIcon } from '../../../../assets/images/revamp/icons/info.inline.svg';
import { useSwap } from '@yoroi/swap';
import { useSwapForm } from '../../context/swap-form';
import { Quantities } from '../../../../utils/quantities';
import { useSwapFeeDisplay } from '../../hooks';
import type { RemoteTokenInfo } from '../../../../api/ada/lib/state-fetch/types';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
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
    buyToken.decimals
  );

  const deposit = Quantities.format(cost.deposit.quantity, ptDecimals);
  const liqFeeQuantity = Quantities.format(cost.liquidityFee.quantity, ptDecimals ?? 0);

  return (
    <Box sx={{ display: 'flex', flexFlow: 'column', gap: '16px', mt: '8px', mb: '8px' }}>
      {showMinAda && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box color="grayscale.500" display="flex" alignItems="center" gap="8px">
            Min ADA
            {withInfo && (
              <InfoTooltip
                width={245}
                content={
                  <Typography color="inherit">
                    A small ADA deposit that will be returned when your order is processed or
                    canceled
                  </Typography>
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
        <Box color="grayscale.500" display="flex" alignItems="center" gap="8px">
          Fees
          {withInfo && (
            <InfoTooltip
              width={245}
              content={
                <React.Fragment>
                  <Typography color="inherit">Fees included:</Typography>
                  <Typography color="inherit">• DEX fee</Typography>
                  <Typography color="inherit">• Frontend fee</Typography>
                </React.Fragment>
              }
            />
          )}
        </Box>
        <Box>{formattedFee}</Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box color="grayscale.500" display="flex" alignItems="center" gap="8px">
          Minimum assets received
          {withInfo && (
            <InfoTooltip
              width={245}
              content={
                <Typography color="inherit">
                  The minimum amount you are guaranteed to receive in case of price slippage
                </Typography>
              }
            />
          )}
        </Box>
        <Box>
          {minReceived} {buyTicker}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box color="grayscale.500" display="flex" alignItems="center" gap="8px">
          Liquidity provider fee
          {withInfo && (
            <InfoTooltip
              width={360}
              content={
                <Typography color="inherit">
                  A fixed 0.3% operational fee paid to liquidity providers as a reward for supplying
                  tokens, enabling traders to buy and sell assets on the decentralized Cardano
                  network
                </Typography>
              }
            />
          )}
        </Box>
        <Box>
          {liqFeeQuantity} {buyTicker}
        </Box>
      </Box>
    </Box>
  );
}
