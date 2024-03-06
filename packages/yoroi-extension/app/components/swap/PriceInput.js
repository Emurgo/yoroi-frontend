// @flow
import type { Node } from 'react';
import { Box, Typography } from '@mui/material';
import { Quantities } from '../../utils/quantities';
import { useSwap } from '@yoroi/swap';
import { PRICE_PRECISION } from './common';
import { useSwapForm } from '../../containers/swap/context/swap-form';
import SwapStore from '../../stores/ada/SwapStore';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';

type Props = {|
  label: string,
  swapStore: SwapStore,
|};

const NO_PRICE_VALUE_PLACEHOLDER = '---';

function PriceInput({ label, swapStore }: Props): Node {
  const {
    orderData,
    limitPriceChanged,
  } = useSwap();
  const {
    sellTokenInfo,
    buyTokenInfo,
  } = useSwapForm();

  const isMarketOrder = orderData.type === 'market';
  const pricePlaceholder = isMarketOrder ? NO_PRICE_VALUE_PLACEHOLDER : '0';

  const marketPrice = orderData.selectedPoolCalculation?.prices.market;
  const formattedPrice = marketPrice ? Quantities.format(
    marketPrice,
    orderData.tokens.priceDenomination,
    PRICE_PRECISION
  ) : pricePlaceholder;

  if (swapStore.limitOrderDisplayValue === '' && marketPrice != null) {
    runInAction(() => {
      swapStore.setLimitOrderDisplayValue(formattedPrice);
    })
  }
  const displayValue = isMarketOrder ? formattedPrice : swapStore.limitOrderDisplayValue;
  const isValidTickers = sellTokenInfo?.ticker && buyTokenInfo?.ticker;
  const isReadonly = !isValidTickers || isMarketOrder;

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
        value={isValidTickers ? displayValue : NO_PRICE_VALUE_PLACEHOLDER}
        onChange={({ target: { value } }) => {
          if (/^\d+\.?\d*$/.test(value)) {
            runInAction(() => {
              swapStore.setLimitOrderDisplayValue(value);
            })
            if (!value.endsWith('.')) {
              limitPriceChanged(value);
            }
          }
        }}
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

export default (observer(PriceInput): React$ComponentType<Props>);
