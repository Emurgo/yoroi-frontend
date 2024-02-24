// @flow
import BigNumber from 'bignumber.js';

type Prop = BigNumber | number | string;

export const asQuantity = (value: Prop): string => {
  const bn = new BigNumber(value);
  if (bn.isNaN() || !bn.isFinite()) {
    throw new Error('Invalid quantity');
  }
  return bn.toString(10);
};
