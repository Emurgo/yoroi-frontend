import { Then } from 'cucumber';
import { By } from 'selenium-webdriver';

Then(/^I should see the test running$/, async function () {
  await this.driver.get('chrome-extension://bflmcienanhdibafopagdcaaenkmoago/main_window.html');
  await this.waitForElement('.createWalletButton');
  const createWalletButton = await this.getElement('.createWalletButton');
  await createWalletButton.click();
});
