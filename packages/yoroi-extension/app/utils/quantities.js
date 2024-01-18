import { Balance, Numbers } from '@yoroi/types';
import BigNumber from 'bignumber.js';
import { asQuantity } from './asQuantity';

export const Quantities = {
  sum: (quantities: Array<Balance.Quantity>) => {
    return quantities
      .reduce((result, current) => result.plus(current), new BigNumber(0))
      .toString(10);
  },
  max: (...quantities: Array<Balance.Quantity>) => {
    return BigNumber.max(...quantities).toString(10);
  },
  diff: (quantity1: Balance.Quantity, quantity2: Balance.Quantity) => {
    return new BigNumber(quantity1).minus(new BigNumber(quantity2)).toString(10);
  },
  negated: (quantity: Balance.Quantity) => {
    return new BigNumber(quantity).negated().toString(10);
  },
  product: (quantities: Array<Balance.Quantity>) => {
    return quantities.reduce((result, quantity) => {
      const x = new BigNumber(result).times(new BigNumber(quantity));

      return x.toString(10);
    }, '1');
  },
  quotient: (quantity1: Balance.Quantity, quantity2: Balance.Quantity) => {
    return new BigNumber(quantity1).dividedBy(new BigNumber(quantity2)).toString(10);
  },
  isGreaterThan: (quantity1: Balance.Quantity, quantity2: Balance.Quantity) => {
    return new BigNumber(quantity1).isGreaterThan(new BigNumber(quantity2));
  },
  isGreaterThanOrEqualTo: (quantity1: Balance.Quantity, quantity2: Balance.Quantity) => {
    return new BigNumber(quantity1).isGreaterThanOrEqualTo(new BigNumber(quantity2));
  },
  decimalPlaces: (quantity: Balance.Quantity, precision: number) => {
    return new BigNumber(quantity).decimalPlaces(precision).toString(10);
  },
  denominated: (quantity: Balance.Quantity, denomination: number) => {
    return Quantities.quotient(quantity, new BigNumber(10).pow(denomination).toString(10));
  },
  integer: (quantity: Balance.Quantity, denomination: number) => {
    return new BigNumber(quantity).decimalPlaces(denomination).shiftedBy(denomination).toString(10);
  },
  zero: '0',
  isZero: (quantity: Balance.Quantity) => new BigNumber(quantity).isZero(),
  isAtomic: (quantity: Balance.Quantity, denomination: number) => {
    const absoluteQuantity = new BigNumber(quantity).decimalPlaces(denomination).abs();
    const minimalFractionalPart = new BigNumber(10).pow(new BigNumber(denomination).negated());

    return absoluteQuantity.isEqualTo(minimalFractionalPart);
  },
  parseFromText: (
    text: string,
    denomination: number,
    format: Numbers.Locale,
    precision = denomination
  ): [string, Balance.Quantity] => {
    const { decimalSeparator } = format;
    const invalid = new RegExp(`[^0-9${decimalSeparator}]`, 'g');
    const sanitized = text === '' ? '' : text.replaceAll(invalid, '');

    if (sanitized === '') return ['', Quantities.zero];
    if (sanitized.startsWith(decimalSeparator)) return [`0${decimalSeparator}`, Quantities.zero];

    const parts = sanitized.split(decimalSeparator);

    let fullDecValue = sanitized;
    let value = sanitized;

    let fullDecFormat = new BigNumber(fullDecValue.replace(decimalSeparator, '.')).toFormat();
    let input = fullDecFormat;

    if (parts.length <= 1) {
      const quantity = asQuantity(
        new BigNumber(value.replace(decimalSeparator, '.'))
          .decimalPlaces(precision)
          .shiftedBy(denomination)
      );

      return [input, quantity];
    }

    const [int, dec] = parts;
    // trailing `1` is to allow the user to type `1.0` without losing the decimal part
    fullDecValue = `${int}${decimalSeparator}${dec?.slice(0, precision)}1`;
    value = `${int}${decimalSeparator}${dec?.slice(0, precision)}`;
    fullDecFormat = new BigNumber(fullDecValue.replace(decimalSeparator, '.')).toFormat();
    // remove trailing `1`
    input = fullDecFormat.slice(0, -1);

    const quantity = asQuantity(
      new BigNumber(value.replace(decimalSeparator, '.'))
        .decimalPlaces(precision)
        .shiftedBy(denomination)
    );

    return [input, quantity];
  },
  format: (quantity: Balance.Quantity, denomination: number, precision?: number) => {
    if (precision === undefined)
      return new BigNumber(Quantities.denominated(quantity, denomination)).toFormat();
    return new BigNumber(Quantities.denominated(quantity, denomination))
      .decimalPlaces(precision)
      .toFormat();
  },
};
