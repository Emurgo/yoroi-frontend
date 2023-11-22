// @flow
import type { Node } from 'react';
import { Box, Typography } from '@mui/material';
import type { AssetAmount } from './types'
import { BigNumber } from 'bignumber.js';

type Props = {|
  label: string,
  baseCurrency: AssetAmount,
  quoteCurrency: AssetAmount,
  readonly?: boolean,
|};

export default function PriceInput({
  label,
  baseCurrency,
  quoteCurrency,
  readonly = false,
}: Props): Node {
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
        value={(new BigNumber(baseCurrency.amount)).div(quoteCurrency.amount).toString()}
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
