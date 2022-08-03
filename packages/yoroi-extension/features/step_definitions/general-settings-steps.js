// @flow

import { When, Then } from 'cucumber';
import { camelCase } from 'lodash';
import { waitUntilUrlEquals, navigateTo } from '../support/helpers/route-helpers';
import i18n from '../support/helpers/i18n-helpers';
import { By, WebElement } from 'selenium-webdriver';
import { expect } from 'chai';
import {
  generalSettingsComponent,
  coinPriceCurrency,
  amountDisplayFiat,
  amountDisplayADA,
} from '../pages/generalSettingsPage';
import type { LocatorObject } from '../support/webdriver';
import { adaToFiatPrices } from '../support/helpers/common-constants';

const axios = require('axios');

export async function selectSubmenuSettings(customWorld: Object, buttonName: string) {
  const formattedButtonName = camelCase(buttonName);
  const buttonSelector = `.SubMenuItem_component.${formattedButtonName}`;
  await customWorld.click({ locator: buttonSelector, method: 'css' });
  await customWorld.waitForElement({
    locator: `.SubMenuItem_component.SubMenuItem_active.${formattedButtonName}`,
    method: 'css',
  });
}

export async function goToSettings(customWorld: Object) {
  await navigateTo.call(customWorld, '/settings');
  await navigateTo.call(customWorld, '/settings/general');

  await waitUntilUrlEquals.call(customWorld, '/settings/general');
  await customWorld.waitForElement({ locator: '.SettingsLayout_component', method: 'css' });
}

export async function getComplexityLevelButton(
  customWorld: Object,
  isLow: boolean = true
): Promise<WebElement> {
  await customWorld.waitForElement({ locator: '.ComplexityLevelForm_cardsWrapper', method: 'css' });
  const levels = await customWorld.driver.findElements(By.css('.ComplexityLevelForm_card'));
  let card;
  if (isLow) {
    card = levels[0];
  } else {
    card = levels[levels.length - 1];
  }
  return await card.findElement(By.xpath('.//button'));
}

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
  await this.click({
    locator: '.ThemeSettingsBlock_themesWrapper > button:nth-child(2)',
    method: 'css',
  });
});

When(/^I open General Settings language selection dropdown$/, async function () {
  await this.click({ locator: '//div[starts-with(@id, "languageId")]', method: 'xpath' });
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
  await this.waitForElement({
    locator: '.ThemeSettingsBlock_themesWrapper button:nth-child(2).ThemeSettingsBlock_active',
    method: 'css',
  });
});

Then(/^The selected level is "([^"]*)"$/, async function (level) {
  await this.waitUntilText({ locator: '.currentLevel', method: 'css' }, level.toUpperCase());
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
    await this.click(currencySelector);
  }
);

Then(
  /^I see the correct conversion value for (USD|JPY|EUR|CNY|KRW|BTC|ETH|BRL) on header$/,
  async function (currency) {
    const amountFiat = await this.driver.findElement(By.css('.AmountDisplay_fiat'));
    const amountDisplayFiatValue = await amountFiat.getText();

    const response = await axios(adaToFiatPrices);

    const value = await response.data.ticker.prices[currency];

    const amountDisplayAmount = await this.driver.findElement(By.css('.AmountDisplay_amount'));
    const adaAmount = await amountDisplayAmount.getText();
    const adaValue = await parseFloat(parseFloat(adaAmount.replace('\n', '').replace(' ADA', '')).toFixed(2));
    const expectedValue = await adaValue * value;

    expect(amountDisplayFiatValue).to.equal(`${expectedValue} ${currency}`);
  }
);

Then(/^I see only ADA value on header$/, async function () {
  expect(await this.isDisplayed(amountDisplayADA), 'ADA value is not displayed').to.be.true;
  expect(await this.checkIfExists(amountDisplayFiat), 'The fiat value is displayed').to.be.false;
});
