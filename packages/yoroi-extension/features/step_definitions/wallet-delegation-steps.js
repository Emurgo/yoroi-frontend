// @flow

import { Given, When, Then } from 'cucumber';
import {
  delegationDashboardPage,
  delegationDashboardPageButton,
  delegationFormNextButton,
  delegationSuccessPage,
  delegationTxDialog,
  iframe,
  iframePoolIdInput,
  iframePoolIdSearchButton,
  poolIdInput,
  stakePoolTicker,
} from '../pages/walletDelegationPage';
import { delegationByIdTab } from '../pages/walletPage';

When(/^I go to the delegation by id screen$/, async function () {
  await this.click(delegationByIdTab);
});

When(/^I go to the delegation list screen$/, async function () {
  await this.click({ locator: '.stakeSimulator', method: 'css' });
  await this.waitForElement({ locator: 'classicCardanoStakingPage', method: 'id' });
});

Then(/^I select the pool with the id "([^"]*)"$/, async function(stakePoolId) {
  await this.webDriverLogger.info(`Step: "I select the pool with the id ${stakePoolId}" has started`);
  const iframeElement = await this.findElement(iframe);
  await this.driver.switchTo().frame(iframeElement);
  await this.webDriverLogger.info(`Step:  Switched to stake pool iframe`);
  await this.waitForElement(iframePoolIdInput);
  await this.driver.wait(async () => {
    const allButtons = await this.findElements({ locator: '//button', method: 'xpath' });
    for (let i = 0; i < allButtons.length; i++) {
      const buttonText = await allButtons[i].getText();
      if (buttonText.toLowerCase() === 'delegate'){
        return true;
      }
    }
    return false;
  });
  await this.input(iframePoolIdInput, stakePoolId);
  await this.click(iframePoolIdSearchButton);
  await this.driver.sleep(1000);
  const allButtons = await this.findElements({ locator: '//button', method: 'xpath' });
  for (let i = 0; i < allButtons.length; i++) {
    const buttonText = await allButtons[i].getText();
    if (buttonText.toLowerCase() === 'delegate'){
      await allButtons[i].click();
      break;
    }
  }
  await this.driver.switchTo().defaultContent();
  await this.webDriverLogger.info(`Step:  Switched back to the default content`);
});

When(/^I fill the delegation id form:$/, async function (table) {
  const fields = table.hashes()[0];
  await this.input(poolIdInput, fields.stakePoolId);
});

Then(/^I see the stakepool ticker "([^"]*)"$/, async function (ticker) {
  await this.waitUntilText(stakePoolTicker, ticker);
});

When(/^I click on the next button in the delegation by id$/, async function () {
  await this.click(delegationFormNextButton);
});

When(/^I see the delegation confirmation dialog$/, async function () {
  await this.waitForElement(delegationTxDialog);
});

Given(/^I click on see dashboard$/, async function () {
  await this.waitForElement(delegationSuccessPage);
  await this.click(delegationDashboardPageButton);
});

When(/^I should see the dashboard screen$/, async function () {
  await this.waitForElement(delegationDashboardPage);
});
