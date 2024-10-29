import BigNumber from 'bignumber.js';

type Return = {
  changeValue: number;
  changePercent: number;
  variantPnl: 'danger' | 'success' | 'neutral';
};

export const priceChange = (previous: number, current: number): Return => {
  if (previous === 0)
    return {
      changeValue: 0,
      changePercent: 0,
      variantPnl: 'neutral',
    };
  const changeValue = current - previous;
  const changePercent = (100 * changeValue) / previous;
  const variantPnl = changeValue < 0 ? 'danger' : changeValue > 0 ? 'success' : 'neutral';

  return { changeValue, changePercent, variantPnl };
};

export const formatPriceChange = (change: number, decimals?: number) => new BigNumber(change).toFormat(decimals ?? 2);
