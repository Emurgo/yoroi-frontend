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
import type { PriceImpact } from './types';
import {
  FormattedActualPrice,
  PriceImpactColored,
  PriceImpactPercent,
  PriceImpactTitle,
} from './PriceImpact';

type Props = {|
  swapStore: SwapStore,
  priceImpactState: ?PriceImpact,
|};

const NO_PRICE_VALUE_PLACEHOLDER = ' ';

function SwapPriceInput({ swapStore, priceImpactState }: Props): Node {
  const { orderData, limitPriceChanged } = useSwap();
  const { sellTokenInfo, buyTokenInfo } = useSwapForm();

  const isMarketOrder = orderData.type === 'market';
  const pricePlaceholder = isMarketOrder ? NO_PRICE_VALUE_PLACEHOLDER : '0';
  const marketPrice = orderData.selectedPoolCalculation?.prices.market;

  const format = s => Quantities.format(s, orderData.tokens.priceDenomination, PRICE_PRECISION) + (s.endsWith('.') ? '.' : '');
  const formattedPrice = marketPrice ? format(marketPrice) : pricePlaceholder;

  if (swapStore.limitOrderDisplayValue === '' && marketPrice != null) {
    runInAction(() => {
      swapStore.setLimitOrderDisplayValue(formattedPrice);
    });
  }
  const displayValue = isMarketOrder ? formattedPrice : swapStore.limitOrderDisplayValue;
  const isValidTickers = sellTokenInfo?.ticker && buyTokenInfo?.ticker;
  const isReadonly = !isValidTickers || isMarketOrder;

  return (
    <Box mt="16px">
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
            borderRadius: '10px',
          }}
        >
          {isMarketOrder ? 'Market ' : 'Limit '} price
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
          onChange={({ target: { value: val } }) => {
            let value = val.replace(/[^\d.]+/g, '');
            if (!value) value = '0';
            if (/^\d+\.?\d*$/.test(value)) {
              runInAction(() => {
                swapStore.setLimitOrderDisplayValue(format(value));
              });
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
      {priceImpactState && isValidTickers && (
        <Typography component="div" variant="caption" pt="4px">
          <PriceImpactColored priceImpactState={priceImpactState} sx={{ display: 'flex' }}>
            <PriceImpactTitle small isSevere={priceImpactState.isSevere} />
            &nbsp;=&nbsp;
            <PriceImpactPercent />
            &nbsp;(
            <FormattedActualPrice />)
          </PriceImpactColored>
        </Typography>
      )}
    </Box>
  );
}

export default (observer(SwapPriceInput): React$ComponentType<Props>);
