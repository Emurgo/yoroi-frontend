import PortfolioTokenDetails from '../pages/wallet/portfolio/portfolioDetails.page.js';
import SwapMain from '../pages/wallet/swap/swapMain.page.js';
import ReceiveSubTab from '../pages/wallet/walletTab/receiveSubTab.page.js';
import SendSubTab from '../pages/wallet/walletTab/sendSubTab.page.js';
import { WebDriver } from 'selenium-webdriver';
import { Logger } from 'simple-node-logger';

// the info is taken from packages/yoroi-extension/app/UI/features/portfolio/useCases/TokensTable/StatsTable.tsx:headCells
export const Columns = Object.freeze({
  Name: 'name',
  Price: 'price',
  Day: '24h',
  Week: '1W',
  Month: '1M',
  Total: 'totalAmount',
  Percentage: 'portfolioPercents',
});
export const RedirectionButtons = Object.freeze({
  Receive: 'receive',
  Send: 'send',
  Swap: 'swap',
});
export const SortingDirection = Object.freeze({
  ASC: 'asc',
  DESC: 'desc',
});

/**
 * Calling redirection for the specified button. Returns the state of success of redirection
 * @param {string} buttonName
 * @param {WebDriver} webdriver
 * @param {Logger} logger
 * @returns {Promise<boolean>}
 */
export const callRedirection = async (buttonName, webdriver, logger) => {
  const tokenDetailsPage = new PortfolioTokenDetails(webdriver, logger);
  switch (buttonName) {
    case RedirectionButtons.Send:
      await tokenDetailsPage.clickSend();
      const sendPage = new SendSubTab(webdriver, logger);
      return await sendPage.stepOneIsDisplayed();
    case RedirectionButtons.Receive:
      await tokenDetailsPage.clickReceive();
      const receivePage = new ReceiveSubTab(webdriver, logger);
      return await receivePage.isDisplayed();
    case RedirectionButtons.Swap:
      await tokenDetailsPage.clickSwap();
      const swapPage = new SwapMain(webdriver, logger);
      return await swapPage.isDisplayed();
    default:
      throw new Error(`Unknown button name "${buttonName}"`);
  }
};

export const defineSortingDirection = values => {
  let ascending = 0;
  let descending = 0;

  for (let i = 1; i < values.length; i++) {
    if (values[i] == null || values[i - 1] == null) {
      continue;
    }
    if (values[i] > values[i - 1]) {
      ascending++;
    } else if (values[i] < values[i - 1]) {
      descending++;
    }
  }

  if (ascending > descending) {
    return SortingDirection.ASC;
  } else if (descending > ascending) {
    return SortingDirection.DESC;
  } else {
    throw new Error('Unknown sorting is applied');
  }
};

export const getValuesForSorting = (columnName, values) => {
  if (Columns[columnName] === Columns.Price) {
    return values.map(columnValue => columnValue.value);
  } else if (Columns[columnName] === Columns.Total) {
    return values.map(columnValue =>
      columnValue.token.name === 'ADA' && columnValue.currency.balance == null
        ? columnValue.token.balance
        : columnValue.currency.balance
    );
  } else {
    return values;
  }
};
