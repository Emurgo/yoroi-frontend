import BasePage from '../../../basepage.js';
import { twoSeconds } from '../../../../helpers/timeConstants.js';

/**
 * Page Object for the Cashback Terms Modal that appears when clicking on a cashback card.
 * This modal shows retailer-specific terms and conditions.
 */
class CashbackTermsModal extends BasePage {
  // locators - Updated for actual cashback terms modal
  cashbackTermsModalLocator = {
    locator: 'div[class*="_modal_"]',
    method: 'css',
  };
 
  closeButtonLocator = {
    locator: 'button[class*="_close_btn_"]',
    method: 'css',
  };
  termsContentLocator = {
    locator: 'div[class*="_markdown_"]',
    method: 'css',
  };
  
  disclaimerContentLocator = {
    locator: 'div[class*="_markdown_"]',
    method: 'css',
  };
  disclaimerProceedBtnLocator = {
    locator: 'a[class*="_start_btn_"]',
    method: 'css',
  };
  disclaimerConsentTextLocator = {
    locator: 'div[class*="_consent_txt_"]',
    method: 'css',
  };
  

  // methods
  async isDisplayed() {
    return await this.withLogging('isDisplayed', async () => {
      try {
        await this.waitForElement(this.cashbackTermsModalLocator, twoSeconds);
        // Note: This modal doesn't have a separate title, just retailer name
        // So we check for the main modal container and terms content instead
        await this.waitForElement(this.termsContentLocator, twoSeconds);
        return true;
      } catch (error) {
        this.logger.warn(`CashbackTermsModal not displayed: ${error.message}`);
        return false;
      }
    });
  }

  async closeCashbackTermsModal() {
    return await this.withLogging('closeCashbackTermsModal', async () => {
      await this.click(this.closeButtonLocator);
    });
  }

  // Backward compatibility method
  async closeDisclaimerModal() {
    return await this.closeCashbackTermsModal();
  }

  async agreeToDisclaimer() {
    // This modal doesn't have a checkbox - consent is implied by clicking START SHOPPING
    return await this.withLogging('agreeToDisclaimer', async () => {
      this.logger.info('No explicit agreement action - consent implied by proceeding');
    });
  }

  async proceedWithDisclaimer() {
    return await this.withLogging('proceedWithDisclaimer', async () => {
      await this.click(this.disclaimerProceedBtnLocator);
    });
  }

  async isCheckboxChecked() {
    // This modal doesn't have a checkbox
    return await this.withLogging('isCheckboxChecked', async () => {
      this.logger.info('No checkbox in this modal - always returns true');
      return true;
    });
  }

  async isProceedButtonEnabled() {
    return await this.withLogging('isProceedButtonEnabled', async () => {
      const disabledAttribute = await this.getAttribute(this.disclaimerProceedBtnLocator, 'disabled');
      return disabledAttribute === null || disabledAttribute === 'false';
    });
  }

  async getDisclaimerContent() {
    return await this.withLogging('getDisclaimerContent', async () => {
      return await this.getText(this.disclaimerContentLocator);
    });
  }

  async acceptDisclaimerAndProceed() {
    return await this.withLogging('acceptDisclaimerAndProceed', async () => {
      // No checkbox to check - just proceed directly
      await this.proceedWithDisclaimer();
    });
  }


  async getConsentText() {
    return await this.withLogging('getConsentText', async () => {
      return await this.getText(this.disclaimerConsentTextLocator);
    });
  }

  async getProceedButtonHref() {
    return await this.withLogging('getProceedButtonHref', async () => {
      return await this.getAttribute(this.disclaimerProceedBtnLocator, 'href');
    });
  }
}

export default CashbackTermsModal;
