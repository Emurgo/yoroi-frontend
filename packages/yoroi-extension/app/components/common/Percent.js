// @flow
import type { Node } from 'react';

type Props = {|
  value: number | string,
  precision?: number,
|};

export default function Percent({ value, precision = 2 }: Props): Node {
  const precisionMultiplier = Math.pow(10, precision);
  const rounded = Math.ceil(Number(value) * precisionMultiplier) / precisionMultiplier;
  return <span>{rounded.toFixed(precision)}%</span>;
}
