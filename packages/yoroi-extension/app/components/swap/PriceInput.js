// @flow
import type { Node } from 'react';
import { Box, Typography } from '@mui/material';
import type { AssetAmount } from './types';
// import { BigNumber } from 'bignumber.js';
// import { useSwap } from '@yoroi/swap';
// import { useSwapForm } from '../../containers/swap/context/swap-form';

type Props = {|
  label: string,
  baseCurrency?: AssetAmount,
  quoteCurrency?: AssetAmount,
  readonly?: boolean,
|};

export default function PriceInput({
  label,
  baseCurrency = {},
  quoteCurrency = {},
  readonly = false,
}: Props): Node {
  // const { orderData } = useSwap();
  // const { sellQuantity, buyQuantity } = useSwapForm();
  // console.log('🚀 > sellQuantity, buyQuantity:', sellQuantity, buyQuantity)
  // const selectedPoolCalculation = orderData.selectedPoolCalculation || {};
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
        bgcolor: readonly ? 'grayscale.50' : 'common.white',
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
        bgcolor={readonly ? 'grayscale.50' : 'common.white'}
        readOnly={readonly}
        // value={Number(1 / Number(selectedPoolCalculation.prices.base))}
      />
      <Box sx={{ justifySelf: 'end' }}>
        <Box height="100%" width="min-content" display="flex" alignItems="center">
          <Box>{baseCurrency.ticker || '-'}</Box>
          <Box>/</Box>
          <Box>{quoteCurrency.ticker || '-'}</Box>
        </Box>
      </Box>
    </Box>
  );
}
