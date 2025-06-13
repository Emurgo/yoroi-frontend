import BigNumber from 'bignumber.js';

export type PriceChangeResult = {
  changeValue: number;
  changePercent: number;
  variantPnl: 'neutral' | 'success' | 'danger';
};

export const priceChange = (open: number | string | undefined, close: number | string | undefined): PriceChangeResult => {
  if (open === undefined || close === undefined) {
    return {
      changeValue: 0,
      changePercent: NaN,
      variantPnl: 'neutral',
    };
  }

  const openBN = new BigNumber(open.toString());
  const closeBN = new BigNumber(close.toString());

  const change = closeBN.minus(openBN);
  const changePercent = openBN.isZero() ? NaN : change.dividedBy(openBN).multipliedBy(100).toNumber();

  const variantPnl: PriceChangeResult['variantPnl'] = change.isZero()
    ? 'neutral'
    : change.isGreaterThan(0)
    ? 'success'
    : 'danger';

  return {
    changeValue: change.toNumber(),
    changePercent,
    variantPnl,
  };
};

export const formatPriceChange = (change: number | string, decimals = 2): string => {
  const bn = new BigNumber(change?.toString());
  return bn.isFinite() ? bn.toFormat(decimals) : '0.00';
};
