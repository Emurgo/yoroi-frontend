import BigNumber from 'bignumber.js';

export const asQuantity = (value: BigNumber | number | string) => {
  const bn = new BigNumber(value);
  if (bn.isNaN() || !bn.isFinite()) {
    throw new Error('Invalid quantity');
  }
  return bn.toString(10);
};
