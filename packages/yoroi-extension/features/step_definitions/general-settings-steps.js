// @flow

import { When, Then } from 'cucumber';
import { camelCase } from 'lodash';
import i18n from '../support/helpers/i18n-helpers';
import { expect } from 'chai';
import {
  generalSettingsComponent,
  coinPriceCurrency,
  amountDisplayFiat,
  amountDisplayADA,
} from '../pages/generalSettingsPage';
import {
  complexitySelected,
  getComplexityLevelButton,
  goToSettings,
  languageSelector,
  secondThemeSelected,
} from '../pages/settingsPage';
import type { LocatorObject } from '../support/webdriver';
import { adaToFiatPrices } from '../support/helpers/common-constants';
import { loadingSpinnerWindow } from '../pages/commonComponentsPage';

const axios = require('axios');

When(/^I navigate to the general settings screen$/, async function () {
  await goToSettings(this);
});

When(/^I click on secondary menu "([^"]*)" item$/, async function (buttonName) {
  const formattedButtonName = camelCase(buttonName);
  const buttonSelector = `.SubMenuItem_component.${formattedButtonName}`;
  await this.click({ locator: buttonSelector, method: 'css' });
  await this.waitForElement({
    locator: `.SubMenuItem_component.SubMenuItem_active.${formattedButtonName}`,
    method: 'css',
  });
});

When(/^I select second theme$/, async function () {
  await this.click(secondThemeSelected);
});

When(/^I open General Settings language selection dropdown$/, async function () {
  await this.click(languageSelector);
});

Then(/^I should see secondary menu (.*) item disabled$/, async function (buttonName) {
  const formattedButtonName = camelCase(buttonName);
  const buttonSelector = `.SettingsMenuItem_component.SettingsMenuItem_disabled.${formattedButtonName}`;
  const label = await i18n.formatMessage(this.driver, {
    id: `settings.menu.${formattedButtonName}.link.label`,
  });
  await this.waitUntilText(buttonSelector, label.toUpperCase());
});

Then(/^The Japanese language should be selected$/, async function () {
  await this.driver.wait(async () => {
    const activeLanguage = await i18n.getActiveLanguage(this.driver);
    return activeLanguage === 'ja-JP';
  });
});

Then(/^I should see second theme as selected$/, async function () {
  await this.waitForElement(secondThemeSelected);
});

Then(/^The selected level is "([^"]*)"$/, async function (level) {
  await this.waitUntilText(complexitySelected, level.toUpperCase());
});

Then(/^I select the most complex level$/, async function () {
  const cardChoseButton = await getComplexityLevelButton(this, false);
  await cardChoseButton.click(); // choose most complex level for tests
});

Then(/^I select the simplest level$/, async function () {
  const cardChoseButton = await getComplexityLevelButton(this, true);
  await cardChoseButton.click(); // chose the simplest
});

Then(/^I should see the "General Settings" page$/, async function () {
  await this.waitForElement(generalSettingsComponent);
});

When(
  /^I select (ADA|USD|JPY|EUR|CNY|KRW|BTC|ETH|BRL) as fiat pairing currency$/,
  async function (currency) {
    await this.waitForElement(coinPriceCurrency);
    await this.click(coinPriceCurrency);

    const currencySelector: LocatorObject = {
      locator: `//*[starts-with(text(), "${currency}")]`,
      method: 'xpath',
    };
    await this.waitForElement(currencySelector);
    await this.scrollIntoView(currencySelector);
    await this.click(currencySelector);
    await this.waitForElementNotPresent(loadingSpinnerWindow)
  }
);

Then(
  /^I see the correct conversion value for (USD|JPY|EUR|CNY|KRW|BTC|ETH|BRL) on header$/,
  async function (currency) {
    const amountDisplayFiatValue = await this.getText(amountDisplayFiat);

    const response = await axios(adaToFiatPrices);
    const value = await response.data.ticker.prices[currency];

    const adaAmount = await this.getText(amountDisplayADA);
    const adaValue = parseFloat(
      parseFloat(adaAmount.replace('\n', '').replace(' ADA', '')).toFixed(2)
    );

    const expectedValue = adaValue * value;
    expect(amountDisplayFiatValue).to.equal(`${expectedValue} ${currency}`);
  }
);

Then(/^I see only ADA value on header$/, async function () {
  expect(await this.isDisplayed(amountDisplayADA), 'ADA value is not displayed').to.be.true;
  expect(await this.checkIfExists(amountDisplayFiat), 'The fiat value is displayed').to.be.false;
});
