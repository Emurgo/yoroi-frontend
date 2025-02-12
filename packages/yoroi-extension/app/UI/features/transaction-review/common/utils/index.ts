import { convertDrepHashToCIP129Format } from '@yoroi/staking';
import BigNumber from 'bignumber.js';

export function formatValue(value: BigNumber): string {
  if (value.isZero()) {
    return '0';
  }
  if (value.abs().lt(1)) {
    return value.toFormat(6);
  }
  return value.toFixed(2);
}

export const formatDrepHash = (hash: string, kind: 'script' | 'key'): string => {
  try {
    return convertDrepHashToCIP129Format(hash, kind);
  } catch {
    return hash;
  }
};
