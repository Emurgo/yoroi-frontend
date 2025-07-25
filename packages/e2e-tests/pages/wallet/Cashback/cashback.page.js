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
  cashbackPageTitleLocator = {
    locator: '#topBar-pageTitle-text',
    method: 'css',
  };

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

  // Sidebar Cashback navigation locator
  cashbackSidebarLocator = {
    locator: '//div[contains(@class, "MuiTypography-caption2") and contains(text(), "Cashback")]',
    method: 'xpath',
  };

  /**
   * Checks if the Cashback page title is visible.
   * @param {number} timeout
   * @returns {Promise<boolean>}
   */
  async isCashbackPageTitleVisible(timeout = twoSeconds) {
    return await this.withLogging('isCashbackPageTitleVisible', async () => {
      try {
        await this.waitForElement(this.cashbackPageTitleLocator, timeout);
        return await this.customWaitIsPresented(this.cashbackPageTitleLocator, timeout, quarterSecond);
      } catch (error) {
        this.logger.info(`Cashback page title not visible: ${error.message}`);
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
   * Checks if the cashback card structure is valid (cards are present).
   * @param {number} timeout
   * @returns {Promise<boolean>}
   */
  async isCashbackCardStructureValid(timeout = twoSeconds) {
    return await this.withLogging('isCashbackCardStructureValid', async () => {
      try {
        // Check if at least one cashback card is present
        await this.waitForElement(this.cashbackCardContainerLocator, timeout);
        return await this.customWaitIsPresented(this.cashbackCardContainerLocator, timeout, quarterSecond);
      } catch (error) {
        this.logger.info(`Card structure validation failed: ${error.message}`);
        return false;
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
      
      // Check card structure separately
      this.logger.info('Checking Cashback card structure...');
      const cardStructureValid = await this.isCashbackCardStructureValid(timeout);
      this.logger.info(`Cashback card structure valid: ${cardStructureValid}`);
      
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
      
      const cardStructureValid = await this.isCashbackCardStructureValid();
      this.logger.info(`✓ Cashback card structure verification: ${cardStructureValid}`);
      
      const result = { titleVisible, claimButtonVisible, cardStructureValid };
      this.logger.info('Cashback page elements verification completed:', result);
      
      return result;
    });
  }

  /**
   * Clicks the CLAIM CASHBACK button.
   */
  async clickClaimCashback() {
    return await this.withLogging('clickClaimCashback', async () => {
      try {
        // Try CSS selector first (faster)
        await this.waitForElement(this.claimCashbackButtonLocator);
        await this.click(this.claimCashbackButtonLocator);
      } catch (error) {
        // Fallback to text-based selector
        this.logger.info(`CSS selector failed: ${error.message}, trying XPath selector`);
        await this.waitForElement(this.claimCashbackButtonByTextLocator);
        await this.click(this.claimCashbackButtonByTextLocator);
      }
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
      const cardStructureValid = await this.isCashbackCardStructureValid();
      return titleVisible && claimButtonVisible && cardStructureValid;
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
   * Gets the retailer name from a specific cashback card.
   * @param {number} cardIndex - Index of the card (0-based)
   * @returns {Promise<string>}
   */
  async getRetailerNameFromCard(cardIndex = 0) {
    return await this.withLogging('getRetailerNameFromCard', async () => {
      const cardElements = await this.findElements(this.cashbackCardContainerLocator);
      if (cardIndex >= cardElements.length) {
        throw new Error(`Card index ${cardIndex} is out of range. Only ${cardElements.length} cards found.`);
      }
      const card = cardElements[cardIndex];
      const retailerNameElement = await card.findElement(this.driver.By.css('div._retailer_name_1ix60_53'));
      return await retailerNameElement.getText();
    });
  }

  /**
   * Gets the cashback rate from a specific cashback card.
   * @param {number} cardIndex - Index of the card (0-based)
   * @returns {Promise<string>}
   */
  async getCashbackRateFromCard(cardIndex = 0) {
    return await this.withLogging('getCashbackRateFromCard', async () => {
      const cardElements = await this.findElements(this.cashbackCardContainerLocator);
      if (cardIndex >= cardElements.length) {
        throw new Error(`Card index ${cardIndex} is out of range. Only ${cardElements.length} cards found.`);
      }
      const card = cardElements[cardIndex];
      const rateElement = await card.findElement(this.driver.By.css('div._cashback_rate_1ix60_61'));
      return await rateElement.getText();
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

  /**
   * Clicks on the Cashback sidebar option to navigate to the Cashback page.
   * @returns {Promise<void>}
   */
  async clickCashbackSidebar() {
    return await this.withLogging('clickCashbackSidebar', async () => {
      try {
        await this.waitForElement(this.cashbackSidebarLocator, defaultWaitTimeout);
        await this.click(this.cashbackSidebarLocator);
        this.logger.info('Successfully clicked Cashback sidebar');
      } catch (error) {
        this.logger.error(`Failed to click Cashback sidebar: ${error.message}`);
        
        // Try scrolling to find the Cashback option
        try {
          this.logger.info('Attempting to scroll down to find Cashback option...');
          await this.driver.executeScript('window.scrollBy(0, 300);');
          await this.sleep(twoSeconds);
          
          await this.waitForElement(this.cashbackSidebarLocator, defaultWaitTimeout);
          await this.click(this.cashbackSidebarLocator);
          this.logger.info('Successfully clicked Cashback sidebar after scrolling');
        } catch (scrollError) {
          this.logger.error(`Failed to find Cashback option even after scrolling: ${scrollError.message}`);
          throw new Error('Cashback sidebar option not found');
        }
      }
    });
  }
}

export default CashbackPage;
