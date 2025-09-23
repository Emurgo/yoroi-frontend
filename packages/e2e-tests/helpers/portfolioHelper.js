import { Colors } from './constants';
import { strNumberToNumber } from '../utils/utils';
import BasePage from '../pages/basepage';
import { ElementLocator } from '../pages/locator';

// the info is taken from packages/yoroi-extension/app/UI/features/portfolio/useCases/TokensTable/StatsTable.tsx:headCells
export const Columns = Object.freeze({
  Name: 'name',
  Price: 'price',
  Day: '24h',
  Week: '1W',
  Month: '1M',
  Percentage: 'portfolioPercents',
  Total: 'totalAmount',
});

/**
 * Defining the number sign by color
 * @param {BasePage} pageObject
 * @param {ElementLocator} priceChangeLocator
 * @returns
 */
const defineSign = async (pageObject, priceChangeLocator) => {
  const color = await pageObject.getCssValue(priceChangeLocator, 'color');
  return color === Colors.portfolioNegative ? '-' : '';
};

/**
 *
 * @param {BasePage} pageObject
 * @param {ElementLocator} priceLocator
 * @returns
 */
export const getChangeValue = async (pageObject, priceLocator) => {
  let priceChangeText = await pageObject.getText(priceLocator);
  if (priceChangeText.endsWith('%')) {
    priceChangeText = priceChangeText.slice(0, priceChangeText.length - 1);
  }
  if (priceChangeText === '-') {
    return null;
  }
  const priceChangeSign = await defineSign(priceLocator);
  return strNumberToNumber(`${priceChangeSign}${priceChangeText}`);
};
