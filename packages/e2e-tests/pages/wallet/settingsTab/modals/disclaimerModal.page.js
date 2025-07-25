import BasePage from '../../basepage.js';
import { twoSeconds } from '../../../helpers/timeConstants.js';

/**
 * Page Object for the Cashback Terms Modal that appears when clicking on a cashback card.
 * This modal shows retailer-specific terms and conditions.
 */
class CashbackTermsModal extends BasePage {
  // locators - Updated for actual cashback terms modal
  
  disclaimerDialogLocator = {
    locator: '.ModalContent.MuiBox-root.css-136wgu4',
    method: 'css',
  };
  disclaimerTitleLocator = {
    locator: '#dialog-dialogTitle-text',
    method: 'css',
  };
  disclaimerCloseBtnLocator = {
    locator: 'button.MuiButtonBase-root.MuiIconButton-root.MuiIconButton-sizeMedium.css-ed9i7i',
    method: 'css',
  };
  disclaimerContentLocator = {
    locator: '.MuiBox-root.css-czp7nw',
    method: 'css',
  };
  disclaimerProceedBtnLocator = {
    locator: '#dialog-proceed-button',
    method: 'css',
  };
  disclaimerCheckboxLocator = {
    locator: 'label.MuiFormControlLabel-root.MuiFormControlLabel-labelPlacementEnd.css-y4s9hd',
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
