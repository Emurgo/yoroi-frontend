import BigNumber from 'bignumber.js';

type Prop = BigNumber | number | string;

export const asQuantity = (value: Prop) => {
  const bn = new BigNumber(value);
  if (bn.isNaN() || !bn.isFinite()) {
    throw new Error('Invalid quantity');
  }
  return bn.toString(10);
};
