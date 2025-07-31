import WalletCommonBase from '../../walletCommonBase.page.js';
import {
  defaultWaitTimeout,
  quarterSecond,
  twoSeconds,
} from '../../../helpers/timeConstants.js';

/**
 * Page Object for the Cashback page, providing methods to interact with and verify Cashback UI elements.
 */
class CashbackPage extends WalletCommonBase {
  /**
   * Locators for Cashback page elements.
   */
  
  claimCashbackButtonLocator = {
    locator: 'button._btn_xnrj2_111._claim_btn_xnrj2_126',
    method: 'css',
  };

  // Alternative locator using button text (more reliable but slower)
  claimCashbackButtonByTextLocator = {
    locator: '//button[contains(text(), "CLAIM CASHBACK")]',
    method: 'xpath',
  };

  cashbackCardContainerLocator = {
    locator: 'div._card_1ix60_1',
    method: 'css',
  };

  // Alternative locator for cashback cards (more specific)
  cashbackCardWithDetailsLocator = {
    locator: 'div._card_1ix60_1:has(div._flag_1ix60_73, div._logo_container_1ix60_28, div._retailer_name_1ix60_53, div._cashback_rate_1ix60_61)',
    method: 'css',
  };

  // Individual card element locators
  cashbackFlagLocator = {
    locator: 'div._flag_1ix60_73',
    method: 'css',
  };

  cashbackRetailerNameLocator = {
    locator: 'div._retailer_name_1ix60_53',
    method: 'css',
  };

  cashbackRateLocator = {
    locator: 'div._cashback_rate_1ix60_61',
    method: 'css',
  };

  cashbackLogoContainerLocator = {
    locator: 'div._logo_container_1ix60_28',
    method: 'css',
  };
  
  /**
   * Checks if the Cashback page title is visible.
   * @param {number} timeout
   * @returns {Promise<boolean>}
   */
  async isCashbackPageTitleVisible(timeout = twoSeconds) {
    return await this.withLogging('isCashbackPageTitleVisible', async () => {
      try {
        const pageTitle = await this.getPageTitle();
        const expectedTitle = 'Cashback';
        const result = pageTitle === expectedTitle;
        this.logger.info(`Page title: "${pageTitle}", Expected: "${expectedTitle}", Match: ${result}`);
        return result;
      } catch (error) {
        this.logger.info(`Failed to get page title: ${error.message}`);
        return false;
      }
    });
  }

  /**
   * Checks if the CLAIM CASHBACK button is visible.
   * @param {number} timeout
   * @returns {Promise<boolean>}
   */
  async isClaimCashbackButtonVisible(timeout = twoSeconds) {
    return await this.withLogging('isClaimCashbackButtonVisible', async () => {
      try {
        // Try CSS selector first (faster)
        await this.waitForElement(this.claimCashbackButtonLocator, timeout);
        return await this.customWaitIsPresented(this.claimCashbackButtonLocator, timeout, quarterSecond);
      } catch (error) {
        // Fallback to text-based selector
        this.logger.info(`CSS selector failed: ${error.message}, trying XPath selector`);
        await this.waitForElement(this.claimCashbackButtonByTextLocator, timeout);
        return await this.customWaitIsPresented(this.claimCashbackButtonByTextLocator, timeout, quarterSecond);
      }
    });
  }

  /**
   * Waits for the Cashback page to fully load (title, claim button and cards).
   * @param {number} timeout
   */
  async waitForCashbackPageLoad(timeout = defaultWaitTimeout) {
    return await this.withLogging('waitForCashbackPageLoad', async () => {
      this.logger.info('Starting Cashback page load verification...');
      
      // Check title visibility separately
      this.logger.info('Checking Cashback page title...');
      const titleVisible = await this.isCashbackPageTitleVisible(timeout);
      this.logger.info(`Cashback page title visible: ${titleVisible}`);
      
      // Check claim button separately
      this.logger.info('Checking Claim Cashback button...');
      const buttonLoaded = await this.isClaimCashbackButtonVisible(timeout);
      this.logger.info(`Claim Cashback button visible: ${buttonLoaded}`);
      
      // Final verification
      const allElementsLoaded = titleVisible && buttonLoaded && cardStructureValid;
      this.logger.info(`All Cashback page elements loaded: ${allElementsLoaded}`);
      
      if (!allElementsLoaded) {
        this.logger.warn(`Some Cashback elements not loaded - Title: ${titleVisible}, Button: ${buttonLoaded}, Cards: ${cardStructureValid}`);
      }
      
      return allElementsLoaded;
    });
  }

  /**
   * Verifies all key Cashback page elements are present.
   * @returns {Promise<{titleVisible: boolean, claimButtonVisible: boolean, cardStructureValid: boolean}>}
   */
  async verifyAllCashbackPageElements() {
    return await this.withLogging('verifyAllCashbackPageElements', async () => {
      this.logger.info('Starting detailed Cashback page elements verification...');
      
      const titleVisible = await this.isCashbackPageTitleVisible();
      this.logger.info(`✓ Cashback page title verification: ${titleVisible}`);
      
      const claimButtonVisible = await this.isClaimCashbackButtonVisible();
      this.logger.info(`✓ Claim Cashback button verification: ${claimButtonVisible}`);
      
      return result;
    });
  }

  /**
   * Gets all cashback cards information.
   * @returns {Promise<Array>}
   */
  async getAllCashbackCards() {
    return await this.withLogging('getAllCashbackCards', async () => {
      const cardElements = await this.findElements(this.cashbackCardContainerLocator);
      return cardElements;
    });
  }

  /**
   * Verifies the cashback page has loaded with all required elements.
   * @returns {Promise<boolean>}
   */
  async verifyCashbackPageLoaded() {
    return await this.withLogging('verifyCashbackPageLoaded', async () => {
      const titleVisible = await this.isCashbackPageTitleVisible();
      const claimButtonVisible = await this.isClaimCashbackButtonVisible();
      return titleVisible && claimButtonVisible;
    });
  }

  /**
   * Gets the number of cashback cards available.
   * @returns {Promise<number>}
   */
  async getCashbackCardCount() {
    return await this.withLogging('getCashbackCardCount', async () => {
      const cardElements = await this.findElements(this.cashbackCardContainerLocator);
      return cardElements.length;
    });
  }

  /**
   * Clicks on a specific cashback card.
   * @param {number} cardIndex - Index of the card (0-based)
   */
  async clickCashbackCard(cardIndex = 0) {
    return await this.withLogging('clickCashbackCard', async () => {
      const cardElements = await this.findElements(this.cashbackCardContainerLocator);
      if (cardIndex >= cardElements.length) {
        throw new Error(`Card index ${cardIndex} is out of range. Only ${cardElements.length} cards found.`);
      }
      await this.clickElementByScript(cardElements[cardIndex]);
    });
  }

  /**
   * Opens the cashback terms modal by clicking on the first available card.
   * @returns {Promise<void>}
   */
  async openCashbackTermsModal() {
    return await this.withLogging('openCashbackTermsModal', async () => {
      await this.clickCashbackCard(0);
      // Wait a moment for the modal to appear
      await this.sleep(1000);
    });
  }


}

export default CashbackPage;
