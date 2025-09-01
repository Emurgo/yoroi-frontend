import BasePage from '../../../basepage.js';
import { quarterSecond, twoSeconds } from '../../../../helpers/timeConstants.js';

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
    return await this.customWaitIsNotPresented(this.disclaimerDialogLocator, twoSeconds, quarterSecond);
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
    return await this.customWaitIsNotPresented(this.disclaimerDialogLocator, twoSeconds, quarterSecond);
  }

  async isProceedButtonEnabled() {
    this.logger.info(`CashbackTermsModal::isProceedButtonEnabled is called`);
    try {
      const element = await this.findElement(this.disclaimerProceedBtnLocator);
      return await element.isEnabled();
    } catch (error) {
      this.logger.warn(`Could not check if proceed button is enabled: ${error.message}`);
      return false;
    }
  }

  async getDisclaimerTitleText() {
    this.logger.info(`CashbackTermsModal::getDisclaimerText is called`);
    const element = await this.findElement(this.disclaimerTitleLocator);
    const result = await element.getText();
    this.logger.info(`CashbackTermsModal::getDisclaimerText The disclaimer text is "${result}"`);
    return result;
  }
}

export default CashbackTermsModal;
