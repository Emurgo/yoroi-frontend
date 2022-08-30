// @flow

import { When, Then } from 'cucumber';
import { truncateLongName } from '../../app/utils/formatters';
import { myWalletsPage } from '../pages/mainWindowPage';
import { walletNameInput } from '../pages/restoreWalletPage';
import { walletNameText, walletNavBackButton } from '../pages/walletPage';
import { walletButtonClassic } from '../pages/sidebarPage';

When(/^I enter the name "([^"]*)"$/, async function (walletName) {
  await this.input(walletNameInput, walletName);
});

When(/^I clear the name "([^"]*)"$/, async function (walletName) {
  await this.clearInputUpdatingForm(walletNameInput, walletName.length);
});

When(/^I navigate to wallet sidebar category$/, async function () {
  await this.click(walletButtonClassic);
  await this.waitForElement(walletNameText);
});

Then(/^I should see the opened wallet with name "([^"]*)"$/, async function (walletName) {
  await this.waitUntilText(walletNameText, truncateLongName(walletName));
});

Then(/^I unselect the wallet$/, async function () {
  await this.click(walletNavBackButton);
});

When(/^I am on the my wallets screen$/, async function () {
  await this.waitForElement(myWalletsPage);
});
