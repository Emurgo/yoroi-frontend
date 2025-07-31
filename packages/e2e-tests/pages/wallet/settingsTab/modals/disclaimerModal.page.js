import BasePage from '../../basepage.js';
import { twoSeconds } from '../../../helpers/timeConstants.js';

/**
 * Page Object for the Cashback Terms Modal that appears when clicking on a cashback card.
 * This modal shows retailer-specific terms and conditions.
 */
class CashbackTermsModal extends BasePage {
  // locators - Updated for actual cashback terms modal
  
  disclaimerDialogLocator = {
    locator: 'dialog-dialogWindow-modalWindow',
    method: 'id',
  };
  disclaimerTitleLocator = {
    locator: '#dialog-dialogTitle-text',
    method: 'css',
  };
  disclaimerCloseBtnLocator = {
    locator: 'button[aria-label="close"]',
    method: 'css',
  };
  disclaimerContentLocator = {
    locator: '#disclaimer',
    method: 'css',
  };
  disclaimerProceedBtnLocator = {
    locator: '#disclaimer-proceed',
    method: 'css',
  };
  disclaimerCheckboxLocator = {
    locator: '#disclaimer-checkbox',
    method: 'css',
  };

  // methods
  async isDisplayed() {
    return await this.withLogging('isDisplayed', async () => {
      try {
        await this.waitForElement(this.disclaimerDialogLocator, twoSeconds);
        await this.waitForElement(this.disclaimerTitleLocator, twoSeconds);
        return true;
      } catch (error) {
        this.logger.warn(`CashbackTermsModal not displayed: ${error.message}`);
        return false;
      }
    });
  }

  async closeCashbackTermsModal() {
    return await this.withLogging('closeCashbackTermsModal', async () => {
      await this.click(this.disclaimerCloseBtnLocator);
    });
  }

  async agreeToDisclaimer() {
    return await this.withLogging('agreeToDisclaimer', async () => {
      await this.click(this.disclaimerCheckboxLocator);
    });
  }

  async proceedWithDisclaimer() {
    return await this.withLogging('proceedWithDisclaimer', async () => {
      await this.click(this.disclaimerProceedBtnLocator);
    });
  }

  async getDisclaimerContent() {
    return await this.withLogging('getDisclaimerContent', async () => {
      return await this.getText(this.disclaimerContentLocator);
    });
  }

  async acceptDisclaimerAndProceed() {
    return await this.withLogging('acceptDisclaimerAndProceed', async () => {
      await this.agreeToDisclaimer();
      await this.proceedWithDisclaimer();
    });
  }
}

export default CashbackTermsModal;
