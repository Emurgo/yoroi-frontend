import { When, Given, Then } from 'cucumber';
import { By } from 'selenium-webdriver'; 
import { expect } from 'chai';

async function checkErrorByTranslationId(client, errorSelector, error) {
  await client.waitUntilText(errorSelector, await client.intl(error.message));
}

Then(/^I should see the balance number "([^"]*)"$/, async function (number) {
  await this.waitUntilText('.TopBar_walletAmount', number);
});

Then(/^I should see send transaction screen$/, async function () {
  await this.waitForElement("input[name='receiver']");
  await this.waitForElement("input[name='amount']");
});

Then(/^I go to the transaction history screen$/, async function () {
  await this.click(`//span[contains(text(), "Transactions")]`, By.xpath);
});

Then(/^I should see the transactions screen$/, async function () {
  await this.waitForElement("//div[@class='WalletSummary_numberOfTransactions']", By.xpath);
});
//
Then(/^I click on "copy to clipboard" button$/, async function () {
  await this.click("//div[@class = 'WalletReceive_hash']//following-sibling::span", By.xpath);
});

Then(/^I should see "You have successfully copied wallet address" pop up:$/, async function (data) {
  const error = data.hashes()[0];
  const errorMessage = await this.intl(error.message);
  await this.waitForElement(`//div[@class='VerticalFlexContainer_component']//span[contains(text(), '${errorMessage}')]`, By.xpath);
});

Then(/^I see transactions buttons are disabled$/, async function () {
  const disabledButtons = await this.driver.findElements(By.xpath("//div[@class='DaedalusTransferInstructionsPage_columnWrapper']//button[contains(@class, 'disabled')]"));
  expect(disabledButtons.length).to.be.equal(2);

  const pageUrl = await this.driver.getCurrentUrl();
  disabledButtons[0].click();
  expect(pageUrl).to.be.equal(await this.driver.getCurrentUrl());
  disabledButtons[1].click();
  expect(pageUrl).to.be.equal(await this.driver.getCurrentUrl());
});