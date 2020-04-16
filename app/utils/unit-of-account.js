// @flow
import { BigNumber } from 'bignumber.js';
import { Logger } from './logging';

export function calculateAndFormatValue(
  coinAmount: BigNumber, // in ADA, not lovelaces
  price: number
): string {
  try {
    /*
      Have to convert the number to string first because when BigNumber.DEBUG is
      true, which is set by ../../chrome/extension/index.js, BigNumber throws if
      the number has more than 15 significant digits.
     */
    const priceString = String(price);
    return formatValue(coinAmount.multipliedBy(priceString));
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
  if (value.lt(1)) {
    return value.toFormat(6);
  }
  return value.toFixed(2);
}
