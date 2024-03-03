// @flow
import type { Node } from 'react';
import { Box, Typography } from '@mui/material';
import { Quantities } from '../../utils/quantities';
// import { BigNumber } from 'bignumber.js';
import { useSwap } from '@yoroi/swap';
import { PRICE_PRECISION } from './common';
import { useSwapForm } from '../../containers/swap/context/swap-form';

type Props = {|
  label: string,
|};

export default function PriceInput({ label }: Props): Node {
  const { orderData } = useSwap();
  const { sellTokenInfo, buyTokenInfo } = useSwapForm();

  const isMarketOrder = orderData.type === 'market';

  const prices = orderData.selectedPoolCalculation?.prices;
  const pricePlaceholder = isMarketOrder ? '---' : '0';
  const formattedPrice = prices?.market ? Quantities.format(
    prices?.market,
    orderData.tokens.priceDenomination,
    PRICE_PRECISION
  ) : pricePlaceholder;

  // console.log('>>>> formattedPrice: ', formattedPrice);

  const isValidTickers = sellTokenInfo?.ticker && buyTokenInfo?.ticker;
  const isReadonly = !isValidTickers || orderData.type === 'market';

  return (
    <Box
      component="fieldset"
      sx={{
        border: '1px solid',
        borderColor: 'grayscale.400',
        borderRadius: '8px',
        p: '16px',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        justifyContent: 'start',
        position: 'relative',
        bgcolor: isReadonly ? 'grayscale.50' : 'common.white',
        columnGap: '6px',
        rowGap: '8px',
      }}
    >
      <Box
        component="legend"
        sx={{
          top: '-9px',
          left: '16px',
          position: 'absolute',
          px: '4px',
          bgcolor: 'common.white',
        }}
      >
        {label}
      </Box>

      <Typography
        sx={{
          appearance: 'none',
          border: '0',
          outline: 'none',
          '::placeholder': { color: 'grayscale.600' },
        }}
        component="input"
        type="text"
        variant="body1"
        color="#000"
        placeholder="0"
        bgcolor={isReadonly ? 'grayscale.50' : 'common.white'}
        readOnly={isReadonly}
        value={isValidTickers ? formattedPrice : '---'}
      />
      <Box sx={{ justifySelf: 'end' }}>
        <Box height="100%" width="max-content" display="flex" alignItems="center">
          <Box>{sellTokenInfo?.ticker || '-'}</Box>
          <Box>/</Box>
          <Box>{buyTokenInfo?.ticker || '-'}</Box>
        </Box>
      </Box>
    </Box>
  );
}
