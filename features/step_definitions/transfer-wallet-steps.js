import { Given, When, Then } from 'cucumber';
import {
  navigateTo
} from '../support/helpers/route-helpers';
import i18n from '../support/helpers/i18n-helpers';

Given(/^I am on the Daedalus Transfer screen$/, async function () {
  await navigateTo.call(this, '/daedalus-transfer');
});

When(/^I click on the create Icarus wallet button$/, async function () {
  const createWalletText = await i18n.formatMessage(this.driver,
    { id: 'daedalusTransfer.instructions.instructions.button.label' });
  await this.clickByXpath(`//button[contains(text(), '${createWalletText}')]`);
});

When(/^I click on the go to the Receive screen button$/, async function () {
  const goToReceiveText = await i18n.formatMessage(this.driver,
    { id: 'daedalusTransfer.instructions.instructions.attention.answer.yes.button.label' });
  await this.clickByXpath(`//button[contains(text(), '${goToReceiveText}')]`);
});

When(/^I click on the transfer funds from Daedalus button$/, async function () {
  const transferWalletText = await i18n.formatMessage(this.driver,
    { id: 'daedalusTransfer.instructions.attention.answer.no.button.label' });
  await this.clickByXpath(`//button[contains(text(), '${transferWalletText}')]`);
});

Then(/^I should see the Create wallet screen$/, async function () {
  const createWalletTitle = await i18n.formatMessage(this.driver,
    { id: 'wallet.add.page.title' });
  await this.waitUntilText('.TextOnlyTopbar_topbarTitleText', createWalletTitle.toUpperCase());
});

Then(/^I should see the Receive screen$/, async function () {
  const receiveTitle = await i18n.formatMessage(this.driver,
    { id: 'wallet.navigation.receive' });
  await this.waitUntilText('.WalletNavButton_active', receiveTitle.toUpperCase());
});
