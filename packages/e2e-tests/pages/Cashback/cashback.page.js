import BasePage from '../basepage.js';
import {
  defaultWaitTimeout,
  halfSecond,
  quarterSecond,
  twoSeconds,
} from '../../helpers/timeConstants.js';

/**
 * Page Object for the Cashback page, providing methods to interact with and verify Cashback UI elements.
 */
class CashbackPage extends BasePage {
  /**
   * Locators for Cashback page elements.
   */
  static locators = {
    cashbackNav: {
      locator: '//div[contains(@class, "MuiTypography-caption2") and contains(text(), "Cashback")]',
      method: 'xpath',
    },
    claimCashbackButton: {
      locator: '//button[contains(@class, "_claim_btn_") and contains(text(), "CLAIM CASHBACK")]',
      method: 'xpath',
    },
    cashbackCardContainer: {
      locator: '//div[contains(@class, "_card_") and .//div[contains(@class, "_flag_")] and .//div[contains(@class, "_retailer_name_")] and .//div[contains(@class, "_cashback_rate_")]]',
      method: 'xpath',
    },
    settingsNav: {
      locator: '//div[contains(@class, "MuiTypography-caption2") and contains(text(), "Settings")]',
      method: 'xpath',
    },
    walletSelectionDropdown: {
      locator: '//div[@role="combobox" and contains(@class, "MuiSelect-select") and contains(@id, "cashbackWalletId")]',
      method: 'xpath',
    },
    firstWalletOption: {
      locator: '//*[contains(@id, "selectCashbackWallet") and contains(@id, "menuItem")]',
      method: 'xpath',
    },
  };

  /**
   * Clicks the Cashback navigation tab.
   */
  async clickCashback() {
    return this.withLogging('clickCashback', async () => {
      await this.navigateToTab('Cashback', '//div[contains(@class, "MuiTypography-caption2") and contains(text(), "${tabName}")]');
    });
  }

  /**
   * Checks if the CLAIM CASHBACK button is visible.
   * @param {number} [timeout=2000]
   * @returns {Promise<boolean>}
   */
  async isClaimCashbackButtonVisible(timeout = twoSeconds) {
    return this.withLogging('isClaimCashbackButtonVisible', async () => {
      await this.waitForElement(CashbackPage.locators.claimCashbackButton, timeout);
      return this.customWaitIsPresented(CashbackPage.locators.claimCashbackButton, timeout, quarterSecond);
    });
  }

  /**
   * Checks if the cashback card structure is valid (cards are present).
   * @param {number} [timeout=2000]
   * @returns {Promise<boolean>}
   */
  async isCashbackCardStructureValid(timeout = twoSeconds) {
    return this.withLogging('isCashbackCardStructureValid', async () => {
      await this.waitForElement(CashbackPage.locators.cashbackCardContainer, timeout);
      return this.customWaitIsPresented(CashbackPage.locators.cashbackCardContainer, timeout, quarterSecond);
    });
  }

  /**
   * Waits for the Cashback page to fully load (claim button and cards).
   * @param {number} [timeout=defaultWaitTimeout]
   */
  async waitForCashbackPageLoad(timeout = defaultWaitTimeout) {
    return this.withLogging('waitForCashbackPageLoad', async () => {
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
    return this.withLogging('verifyAllCashbackPageElements', async () => {
      const claimButtonVisible = await this.isClaimCashbackButtonVisible();
      const cardStructureValid = await this.isCashbackCardStructureValid();
      return { claimButtonVisible, cardStructureValid };
    });
  }

  /**
   * Scrolls the sidebar to make the Settings tab visible.
   * @returns {Promise<boolean>} - True if found and scrolled, false otherwise.
   */
  async scrollToSettings() {
    return this.withLogging('scrollToSettings', async () => {
      try {
        await this.waitForElement(CashbackPage.locators.settingsNav, twoSeconds);
        await this.scrollIntoView(CashbackPage.locators.settingsNav);
        return true;
      } catch (error) {
        // Try scrolling if not found
        await this.driver.executeScript(`
          const leftPanel = document.querySelector('div[role="navigation"], nav, aside, .sidebar, .menu-panel, .left-panel');
          if (leftPanel) {
            leftPanel.scrollTop += 200;
          } else {
            window.scrollBy(0, 200);
          }
        `);
        await this.sleep(halfSecond);
        try {
          await this.waitForElement(CashbackPage.locators.settingsNav, twoSeconds);
          await this.scrollIntoView(CashbackPage.locators.settingsNav);
          return true;
        } catch {
          return false;
        }
      }
    });
  }

  /**
   * Clicks the Settings navigation tab.
   */
  async clickSettings() {
    return this.withLogging('clickSettings', async () => {
      const settingsVisible = await this.scrollToSettings();
      if (!settingsVisible) {
        throw new Error('Settings navigation element not found');
      }
      await this.click(CashbackPage.locators.settingsNav);
      await this.sleep(twoSeconds);
    });
  }

  /**
   * Checks if the wallet selection dropdown is visible.
   * @param {number} [timeout=2000]
   * @returns {Promise<boolean>}
   */
  async isWalletSelectionDropdownVisible(timeout = twoSeconds) {
    return this.withLogging('isWalletSelectionDropdownVisible', async () => {
      await this.waitForElement(CashbackPage.locators.walletSelectionDropdown, timeout);
      return this.customWaitIsPresented(CashbackPage.locators.walletSelectionDropdown, timeout, quarterSecond);
    });
  }

  /**
   * Clicks the wallet selection dropdown.
   */
  async clickWalletSelectionDropdown() {
    return this.withLogging('clickWalletSelectionDropdown', async () => {
      await this.waitForElement(CashbackPage.locators.walletSelectionDropdown);
      await this.click(CashbackPage.locators.walletSelectionDropdown);
      await this.sleep(halfSecond);
    });
  }

  /**
   * Selects the first wallet from the dropdown.
   */
  async selectFirstWalletFromDropdown() {
    return this.withLogging('selectFirstWalletFromDropdown', async () => {
      await this.clickWalletSelectionDropdown();
      await this.waitForElement(CashbackPage.locators.firstWalletOption, twoSeconds);
      await this.click(CashbackPage.locators.firstWalletOption);
      await this.sleep(halfSecond);
    });
  }

  /**
   * Gets the text of the currently selected wallet.
   * @returns {Promise<string|null>}
   */
  async getSelectedWalletText() {
    return this.withLogging('getSelectedWalletText', async () => {
      await this.waitForElement(CashbackPage.locators.walletSelectionDropdown, twoSeconds);
      return this.getText(CashbackPage.locators.walletSelectionDropdown);
    });
  }

  /**
   * Performs wallet selection and returns before/after info.
   * @returns {Promise<{initialWallet: string|null, selectedWallet: string|null, selectionCompleted: boolean}>}
   */
  async performWalletSelection() {
    return this.withLogging('performWalletSelection', async () => {
      await this.clickSettings();
      const dropdownAvailable = await this.isWalletSelectionDropdownVisible();
      if (!dropdownAvailable) {
        throw new Error('Wallet selection dropdown is not available');
      }
      const initialWallet = await this.getSelectedWalletText();
      await this.selectFirstWalletFromDropdown();
      const selectedWallet = await this.getSelectedWalletText();
      return {
        initialWallet,
        selectedWallet,
        selectionCompleted: true,
      };
    });
  }

  /**
   * Verifies Settings and wallet dropdown are visible.
   * @returns {Promise<{settingsNavigationVisible: boolean, walletDropdownVisible: boolean, allElementsPresent: boolean}>}
   */
  async verifyWalletSelectionElements() {
    return this.withLogging('verifyWalletSelectionElements', async () => {
      await this.clickSettings();
      const settingsNavigationVisible = await this.customWaitIsPresented(CashbackPage.locators.settingsNav, twoSeconds, quarterSecond);
      const walletDropdownVisible = await this.isWalletSelectionDropdownVisible();
      return {
        settingsNavigationVisible,
        walletDropdownVisible,
        allElementsPresent: settingsNavigationVisible && walletDropdownVisible,
      };
    });
  }
}

export default CashbackPage;
