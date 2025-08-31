import { CASHBACK_ANOTHER_WALLET, CASHBACK_SWITCH_WALLET } from '../../../../helpers/messages.js';
import { quarterSecond, twoSeconds } from '../../../../helpers/timeConstants.js';
import BasePage from '../../../basepage.js';

class WrongWalletModal extends BasePage {
  // locators
  wrongWalletModalLocator = {
    locator: 'dialog-dialogWindow-modalWindow',
    method: 'id',
  };

  wrongWalletModalTitleLocator = {
    locator: 'dialog-dialogTitle-text',
    method: 'id',
  };

  setThisWalletButtonLocator = {
    locator: 'dialog-setthiswallet-button',
    method: 'id',
  };

  switchWalletButtonLocator = {
    locator: 'dialog-switchwallet-button',
    method: 'id',
  };

  setThisWalletButtonNo = {
    locator: 'dialog-no-button',
    method: 'id',
  };

  setThisWalletButtonYes = {
    locator: 'dialog-yes-button',
    method: 'id',
  };

  // methods

  /**
   * Checks if the wrong wallet modal is displayed.
   */
  async isDisplayed() {
    this.logger.info(`WrongWalletModal::isDisplayed is called`);
    try {
      const modal = await this.findElements(this.wrongWalletModalLocator);
      return modal.length > 0;
    } catch (error) {
      return false;
    }
  }

  async modalIsClosed() {
    this.logger.info(`WrongWalletModal::modalIsClosed is called`);
    return await this.customWaitIsNotPresented(this.wrongWalletModalLocator, twoSeconds, quarterSecond);
  }

  /**
   * Gets the wrong wallet modal title.
   */
  async getWrongWalletModalTitle() {
    this.logger.info(`WrongWalletModal::getWrongWalletModalTitle is called`);
    await this.waitForElement(this.wrongWalletModalTitleLocator);
    return await this.getText(this.wrongWalletModalTitleLocator);
  }

  /**
   * Gets the wrong wallet modal text content.
   */
  async getWrongWalletModalText() {
    this.logger.info(`WrongWalletModal::getWrongWalletModalText is called`);
    await this.waitForElement(this.wrongWalletModalLocator);
    return await this.getText(this.wrongWalletModalLocator);
  }

  /**
   * Clicks the "SET THIS WALLET" button in the wrong wallet modal.
   */
  async clickSetThisWallet() {
    this.logger.info(`WrongWalletModal::clickSetThisWallet is called`);
    await this.waitForElement(this.setThisWalletButtonLocator);
    await this.click(this.setThisWalletButtonLocator);
    await this.click(this.setThisWalletButtonYes);
  }

  /**
   * Clicks the "SWITCH WALLET" button in the wrong wallet modal.
   */
  async clickSwitchWallet() {
    this.logger.info(`WrongWalletModal::clickSwitchWallet is called`);
    await this.waitForElement(this.switchWalletButtonLocator);
    await this.click(this.switchWalletButtonLocator);
  }

  /**
   * Verifies the wrong wallet modal contains expected content.
   */
  async verifyWrongWalletModalContent() {
    this.logger.info(`WrongWalletModal::verifyWrongWalletModalContent is called`);
    const title = await this.getWrongWalletModalTitle();
    const text = await this.getWrongWalletModalText();
    console.log(text);

    // Verify the modal contains expected content
    const hasCorrectTitle = title.toLowerCase().includes('wrong wallet');
    const hasCorrectText = text.includes(CASHBACK_ANOTHER_WALLET) || text.includes(CASHBACK_SWITCH_WALLET);

    return hasCorrectTitle && hasCorrectText;
  }
}

export default WrongWalletModal;
