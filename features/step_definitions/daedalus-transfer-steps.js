import { Before, Given, When, Then } from 'cucumber';
import { getMockServer } from '../support/mockServer';
import { createWebSocketServer } from '../support/mockWebSocketServer';
import {
  navigateTo
} from '../support/helpers/route-helpers';
import i18n from '../support/helpers/i18n-helpers';

Before({ tags: '@withWebSocketConnection' }, () => {
  createWebSocketServer(getMockServer());
});

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

When(/^I proceed with the recovery$/, async function () {
  const next = await i18n.formatMessage(this.driver,
    { id: 'daedalusTransfer.form.next' });
  await this.clickByXpath(`//button[contains(text(), '${next}')]`);
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

Then(/^I should see an Error screen$/, async function () {
  const errorPageTitle = await i18n.formatMessage(this.driver,
    { id: 'daedalusTransfer.errorPage.title.label' });
  await this.waitUntilText('.DaedalusTransferErrorPage_title', errorPageTitle);
});

Then(/^I should wait until funds are recovered$/, async function () {
  const summaryPageTitle = await i18n.formatMessage(this.driver,
    { id: 'daedalusTransfer.summary.addressFrom.label' });
  await this.waitUntilText('.DaedalusTransferSummaryPage_title', summaryPageTitle);
});
