import WalletCommonBase from '../../walletCommonBase.page.js';
import {
  defaultWaitTimeout,
  quarterSecond,
  twoSeconds,
} from '../../../helpers/timeConstants.js';
import { pageTitle } from '../../../helpers/pageTitles.js';

/**
 * Page Object for the Cashback page, providing methods to interact with and verify Cashback UI elements.
 */
class CashbackPage extends WalletCommonBase {
  /**
   * Locators for Cashback page elements.
   */
  
 
  claimCashbackButtonLocator = {
    locator: '//button[contains(text(), "CLAIM CASHBACK")]',
    method: 'xpath',
  };

  claimCashbackButtonByTextLocator = {
    locator: '//button[contains(text(), "CLAIM CASHBACK")]',
    method: 'xpath',
  };

  // Alternative locators for the claim button
  claimCashbackButtonCSSLocator = {
    locator: 'button._btn_xnrj2_111._claim_btn_xnrj2_126',
    method: 'css',
  };

  claimCashbackButtonGenericLocator = {
    locator: '//*[contains(text(), "CLAIM CASHBACK")]',
    method: 'xpath',
  };

  cashbackCardContainerLocator = {
    locator: 'div._card_1ix60_1',
    method: 'css',
  };

  // More generic card locator that looks for cards with retailer names
  cashbackCardGenericLocator = {
    locator: 'div[class*="_card_"]',
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
        const currentPageTitle = await this.getPageTitle();
        const expectedTitle = pageTitle.cashback;
        const result = currentPageTitle === expectedTitle;
        this.logger.info(`Page title: "${currentPageTitle}", Expected: "${expectedTitle}", Match: ${result}`);
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
      const locators = [
        this.claimCashbackButtonLocator,
        this.claimCashbackButtonCSSLocator,
        this.claimCashbackButtonGenericLocator
      ];

      for (let i = 0; i < locators.length; i++) {
        try {
          this.logger.info(`Trying locator ${i + 1}: ${JSON.stringify(locators[i])}`);
          await this.waitForElement(locators[i], timeout);
          const isPresent = await this.customWaitIsPresented(locators[i], timeout, quarterSecond);
          if (isPresent) {
            this.logger.info(`CLAIM CASHBACK button found with locator ${i + 1}`);
            return true;
          }
        } catch (error) {
          this.logger.info(`Locator ${i + 1} failed: ${error.message}`);
        }
      }
      
      this.logger.warn('CLAIM CASHBACK button not found with any locator');
      return false;
    });
  }

  /**
   * Waits for the Cashback page to fully load (title, claim button and cards).
   * @param {number} timeout
   */
  async waitForCashbackPageLoad(timeout = defaultWaitTimeout) {
    return await this.withLogging('waitForCashbackPageLoad', async () => {
      this.logger.info('Starting Cashback page load verification...');
      
      try {
        // Check title visibility separately
        this.logger.info('Checking Cashback page title...');
        const titleVisible = await this.isCashbackPageTitleVisible(timeout);
        this.logger.info(`Cashback page title visible: ${titleVisible}`);
        
        // Check claim button separately
        this.logger.info('Checking Claim Cashback button...');
        const buttonLoaded = await this.isClaimCashbackButtonVisible(timeout);
        this.logger.info(`Claim Cashback button visible: ${buttonLoaded}`);
        
        // Final verification
        const allElementsLoaded = titleVisible && buttonLoaded;
        this.logger.info(`All Cashback page elements loaded: ${allElementsLoaded}`);
        
        if (!allElementsLoaded) {
          this.logger.warn(`Some Cashback elements not loaded - Title: ${titleVisible}, Button: ${buttonLoaded}`);
        }
        
        return allElementsLoaded;
      } catch (error) {
        this.logger.error(`Error during Cashback page load verification: ${error.message}`);
        return false;
      }
    });
  }

  /**
   * Verifies all key Cashback page elements are present.
   * @returns {Promise<{titleVisible: boolean, claimButtonVisible: boolean}>}
   */
  async verifyAllCashbackPageElements() {
    return await this.withLogging('verifyAllCashbackPageElements', async () => {
      this.logger.info('Starting detailed Cashback page elements verification...');
      
      const titleVisible = await this.isCashbackPageTitleVisible();
      this.logger.info(`✓ Cashback page title verification: ${titleVisible}`);
      
      const claimButtonVisible = await this.isClaimCashbackButtonVisible();
      this.logger.info(`✓ Claim Cashback button verification: ${claimButtonVisible}`);
      
      const result = { titleVisible, claimButtonVisible };
      this.logger.info('Cashback page elements verification completed:', result);
      
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
      try {
        // Try the specific locator first
        const cardElements = await this.findElements(this.cashbackCardContainerLocator);
        this.logger.info(`Found ${cardElements.length} cards with specific locator`);
        if (cardElements.length > 0) {
          return cardElements.length;
        }
        
        // Fallback to generic locator
        const genericCardElements = await this.findElements(this.cashbackCardGenericLocator);
        this.logger.info(`Found ${genericCardElements.length} cards with generic locator`);
        return genericCardElements.length;
      } catch (error) {
        this.logger.warn(`Error getting cashback card count: ${error.message}`);
        return 0;
      }
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


}

export default CashbackPage;
