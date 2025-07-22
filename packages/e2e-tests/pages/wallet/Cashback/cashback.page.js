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
    locator: 'button[class*="_claim_btn_"]',
    method: 'css',
  };

  // Alternative locator using button text (more reliable but slower)
  claimCashbackButtonByTextLocator = {
    locator: '//button[contains(text(), "CLAIM CASHBACK")]',
    method: 'xpath',
  };

  cashbackCardContainerLocator = {
    locator: 'div[class*="_card_"]',
    method: 'css',
  };

  // Alternative locator for cashback cards (more specific)
  cashbackCardWithDetailsLocator = {
    locator: 'div[class*="_card_"]:has(div[class*="_flag_"], div[class*="_retailer_name_"], div[class*="_cashback_rate_"])',
    method: 'css',
  };

  // Individual card element locators
  cashbackFlagLocator = {
    locator: 'div[class*="_flag_"]',
    method: 'css',
  };

  cashbackRetailerNameLocator = {
    locator: 'div[class*="_retailer_name_"]',
    method: 'css',
  };

  cashbackRateLocator = {
    locator: 'div[class*="_cashback_rate_"]',
    method: 'css',
  };

  cashbackLogoContainerLocator = {
    locator: 'div[class*="_logo_container_"]',
    method: 'css',
  };

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
   * Waits for the Cashback page to fully load (claim button and cards).
   * @param {number} timeout
   */
  async waitForCashbackPageLoad(timeout = defaultWaitTimeout) {
    return await this.withLogging('waitForCashbackPageLoad', async () => {
      await this.customWaiter(
        async () => {
          const buttonLoaded = await this.isClaimCashbackButtonVisible();
          const cardStructureValid = await this.isCashbackCardStructureValid();
          return buttonLoaded && cardStructureValid;
        },
        timeout,
        quarterSecond
      );
    });
  }

  /**
   * Verifies all key Cashback page elements are present.
   * @returns {Promise<{claimButtonVisible: boolean, cardStructureValid: boolean}>}
   */
  async verifyAllCashbackPageElements() {
    return await this.withLogging('verifyAllCashbackPageElements', async () => {
      const claimButtonVisible = await this.isClaimCashbackButtonVisible();
      const cardStructureValid = await this.isCashbackCardStructureValid();
      return { claimButtonVisible, cardStructureValid };
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
      const claimButtonVisible = await this.isClaimCashbackButtonVisible();
      const cardStructureValid = await this.isCashbackCardStructureValid();
      return claimButtonVisible && cardStructureValid;
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
      const retailerNameElement = await card.findElement(this.driver.By.css('div[class*="_retailer_name_"]'));
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
      const rateElement = await card.findElement(this.driver.By.css('div[class*="_cashback_rate_"]'));
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
}

export default CashbackPage;
