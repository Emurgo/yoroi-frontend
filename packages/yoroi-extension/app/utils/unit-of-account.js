// @flow
import { BigNumber } from 'bignumber.js';
import { Logger } from './logging';

export function calculateAndFormatValue(
  // Note: make sure you pass the right denomination
  // ex: pass ADA instead of lovelaces
  coinAmount: BigNumber,
  price: string
): string {
  try {
    return formatValue(coinAmount.multipliedBy(price));
  } catch (error) {
    /*
      Not that we expect any exception. just be defensive to avoid crashing the UI.
    */
    Logger.error(`Error when calling calculateAndFormatValue(` +
      `${JSON.stringify(coinAmount)}, ${price}): ${error.message}`);
    return '-';
  }
}

export function formatValue(value: BigNumber): string {
  if (value.isZero()) {
    return '0';
  }
  if (value.abs().lt(1)) {
    return value.toFormat(6);
  }
  return value.toFixed(2);
}
