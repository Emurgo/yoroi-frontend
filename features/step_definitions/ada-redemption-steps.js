import { Given, When, Then } from 'cucumber';
import path from 'path';
import { By } from 'selenium-webdriver';
import i18n from '../support/helpers/i18n-helpers';

const regularAdaCertificateFilePath = path.resolve(__dirname, '../support/ada_certificates/regular.pdf');
const regularEncryptedAdaCertificateFilePath = path.resolve(__dirname, '../support/ada_certificates/regular.pdf.enc');
const forceVendedAdaCertificateFilePath = path.resolve(__dirname, '../support/ada_certificates/force-vended.pdf');
const forceVendedEncryptedAdaCertificateFilePath = path.resolve(__dirname, '../support/ada_certificates/force-vended.pdf.enc');


const REDEMPTION_SUBMIT_BUTTON = '.AdaRedemptionForm_scrollableContent .AdaRedemptionForm_submitButton';

Given(/^I go to the ada redemption screen$/, async function () {
  await this.click('.settings');
  await this.click('.adaRedemption');
});

Given(/^I see the "Daedalus Redemption Disclaimer" overlay$/, async function () {
  await this.waitForElement('.AdaRedemptionDisclaimer_component');
});

When(/^I click on the "I've understood the information above" checkbox$/, async function () {
  await this.click('.AdaRedemptionDisclaimer_component .SimpleCheckbox_check');
});

When(/^I click on the "Continue" button$/, async function () {
  await this.click('.AdaRedemptionDisclaimer_component .SimpleButton_root');
});

Then(/^I should not see the "Daedalus Redemption Disclaimer" overlay anymore$/, async function () {
  await this.waitForElementNotPresent('.AdaRedemptionDisclaimer_component');
});

Then(/^I should still be on the ada redemption screen$/, async function () {
  await this.waitForElement('.AdaRedemptionForm_scrollableContent');
});

Given(/^I have accepted "Daedalus Redemption Disclaimer"$/, async function () {
  await this.waitForElement('.AdaRedemptionDisclaimer_component');
  await this.click('.AdaRedemptionDisclaimer_component .SimpleCheckbox_check');
  await this.click('.AdaRedemptionDisclaimer_component .SimpleButton_root');
  await this.waitForElement('.AdaRedemptionForm_scrollableContent');
});

When(/^I click on ada redemption choices "([^"]*)" tab$/, async function (tabText) {
  await this.click(`//div[@class="AdaRedemptionChoices_component"]/button[contains(text(), "${tabText}")]`, By.xpath);
});

When(/^I enter a valid "Regular" redemption key$/, async function () {
  const redemptionKey = 'llVRYvW7LAyqmDMnUOvrs5ih4OHfLiLZrz5NT+iRuTw=';
  await this.input("input[name='redemptionKey']", redemptionKey);
});

When(/^I enter an invalid "Regular" redemption key$/, async function () {
  const redemptionKey = 'invalidKey';
  await this.input("input[name='redemptionKey']", redemptionKey);
});

When(/^I enter an already used "Regular" redemption key$/, async function () {
  const redemptionKey = 'Dhpd0rMtOTcRoHO62BFAb47il3zjtsICfsjUuFLiTS0=';
  await this.input("input[name='redemptionKey']", redemptionKey);
});

When(/^I select a valid "Regular" PDF certificate$/, async function () {
  await this.chooseFile(regularAdaCertificateFilePath, 'application/pdf');
});

When(/^I select a valid "Regular" encrypted PDF certificate$/, async function () {
  await this.chooseFile(regularEncryptedAdaCertificateFilePath);
});

When(/^I enter a valid "Force vended" redemption key$/, async function () {
  const redemptionKey = 'LtOD4vxIqfEUYheTiHprRmvmAXHvMJbulllqHhjAGHc=';
  await this.input("input[name='redemptionKey']", redemptionKey);
});

When(/^I select a valid "Force vended" PDF certificate$/, async function () {
  await this.chooseFile(forceVendedAdaCertificateFilePath, 'application/pdf');
});

When(/^I select a valid "Force vended" encrypted PDF certificate$/, async function () {
  await this.chooseFile(forceVendedEncryptedAdaCertificateFilePath);
});

When(/^I enter a valid "Force vended" encrypted PDF certificate email, passcode and amount$/, async function () {
  const email = 'nnmbsds@example.org';
  const passcode = 'uilfeet';
  const amount = '12345';
  await this.input("input[name='email']", email);
  await this.input("input[name='adaPasscode']", passcode);
  await this.input("input[name='adaAmount']", amount);
});

When(/^I enter a valid "Force vended" encrypted PDF certificate decryption key "([^"]*)"$/, async function (decryptionKey) {
  await this.input("input[name='decryptionKey']", decryptionKey);
});

When(/^I enter a valid "Paper vended" shielded vending key$/, async function () {
  await this.input("input[name='shieldedRedemptionKey']", '6ANn43jbzR7zZGnV3BYnna1myW5HajPgjiCPg4vpcayf');
});

When(/^I enter a valid "Paper vended" shielded vending key passphrase$/, async function () {
  const passphrase = ['fitness', 'engage', 'danger', 'escape', 'marriage', 'answer', 'coffee', 'develop', 'afraid'];
  await this.enterPassphrase(passphrase);
});

When(/^I enter a valid "Regular" encrypted PDF certificate passphrase$/, async function () {
  const passphrase = ['uncle', 'bargain', 'pistol', 'obtain', 'amount', 'laugh', 'explain', 'type', 'learn'];
  await this.enterPassphrase(passphrase);
});

When(/^ada redemption form submit button is no longer disabled$/, async function () {
  await this.waitEnable(REDEMPTION_SUBMIT_BUTTON);
});

When(/^I submit the ada redemption form$/, async function () {
  await this.click(REDEMPTION_SUBMIT_BUTTON);
});

Then(/^I should see invalid redemption key message$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, { id: 'wallet.redeem.dialog.redemptionCodeError' });
  await this.waitUntilText('.SimpleFormField_error', errorMessage);
});

Then(/^I should see already used redemption key message$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, { id: 'api.errors.redemptionKeyAlreadyUsedError' });
  await this.waitUntilText('.AdaRedemptionForm_error', errorMessage);
});

Then(/^I should see an error message saying that ADA could not be redeemed correctly$/, async function () {
  const errorMessage = await i18n.formatMessage(this.driver, { id: 'api.errors.RedeemAdaError' });
  await this.waitUntilText('.AdaRedemptionForm_error', errorMessage);
});

Then(/^I should see the "Ada Redemption Success Overlay" and close the dialogue$/, async function () {
  await this.waitForElement('.AdaRedemptionSuccessOverlay_component');
  await this.click('.AdaRedemptionSuccessOverlay_confirmButton');
});
