import BasePage from '../../../basepage.js';
import { twoSeconds } from '../../../../helpers/timeConstants.js';

/**
 * Page Object for the Cashback Terms Modal that appears when clicking on a cashback card.
 * This modal shows retailer-specific terms and conditions.
 */
class CashbackTermsModal extends BasePage {
  // locators - Updated for actual cashback terms modal
  
  disclaimerDialogLocator = {
    locator: 'disclaimer-dialogWindow-modalWindow',
    method: 'id',
  };
  disclaimerTitleLocator = {
    locator: 'disclaimer-dialogTitle-text',
    method: 'id',
  };
  disclaimerCloseBtnLocator = {
    locator: 'disclaimer-closeModal-button',
    method: 'id',
  };
  disclaimerProceedBtnLocator = {
    locator: 'disclaimer-proceed-button',
    method: 'id',
  };
  disclaimerCheckboxLocator = {
    locator: 'disclaimer-accept-checkbox',
    method: 'id',
  };

  // methods
  async isDisplayed() {
    this.logger.info(`CashbackTermsModal::isDisplayed is called`);
    try {
      await this.waitForElement(this.disclaimerDialogLocator, twoSeconds);
      await this.waitForElement(this.disclaimerTitleLocator, twoSeconds);
      return true;
    } catch (error) {
      this.logger.warn(`CashbackTermsModal not displayed: ${error.message}`);
      return false;
    }
  }

  async closeCashbackTermsModal() {
    this.logger.info(`CashbackTermsModal::closeCashbackTermsModal is called`);
    await this.click(this.disclaimerCloseBtnLocator);
  }

  async agreeToDisclaimer() {
    this.logger.info(`CashbackTermsModal::agreeToDisclaimer is called`);
    await this.click(this.disclaimerCheckboxLocator);
  }

  async proceedWithDisclaimer() {
    this.logger.info(`CashbackTermsModal::proceedWithDisclaimer is called`);
    await this.click(this.disclaimerProceedBtnLocator);
  }

  async acceptDisclaimerAndProceed() {
    this.logger.info(`CashbackTermsModal::acceptDisclaimerAndProceed is called`);
    await this.agreeToDisclaimer();
    await this.proceedWithDisclaimer();
  }

  async isProceedButtonEnabled() {
    this.logger.info(`CashbackTermsModal::isProceedButtonEnabled is called`);
    try {
      const element = await this.findElement(this.disclaimerProceedBtnLocator);
      const isEnabled = await element.isEnabled();
      return isEnabled;
    } catch (error) {
      this.logger.warn(`Could not check if proceed button is enabled: ${error.message}`);
      return false;
    }
  }

  async getDisclaimerText() {
    this.logger.info(`CashbackTermsModal::getDisclaimerText is called`);
    const element = await this.findElement(this.disclaimerTitleLocator);
    return await element.getText();
  }
}

export default CashbackTermsModal;
