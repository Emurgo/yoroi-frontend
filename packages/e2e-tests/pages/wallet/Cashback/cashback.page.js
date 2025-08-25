import WalletCommonBase from '../../walletCommonBase.page.js';
import { twoSeconds } from '../../../helpers/timeConstants.js';
import { pageTitle } from '../../../helpers/pageTitles.js';

/**
 * Page Object for the Cashback page
 */
class CashbackPage extends WalletCommonBase {
  
  // Main locators
  claimCashbackButton = {
    locator: 'button._btn_xnrj2_111._claim_btn_xnrj2_126',
    method: 'css',
  };

  cashbackCardContainer = {
    locator: 'div._card_1ix60_1',
    method: 'css',
  };

  // Iframe locator
  cashbackIframe = {
    locator: 'bringweb3',
    method: 'id',
  };

  // Wrong wallet modal locators
  wrongWalletModalLocator = {
    locator: 'dialog-dialogWindow-modalWindow',
    method: 'id',
  };
  
  wrongWalletModalTitleLocator = {
    locator: 'dialog-dialogTitle-text',
    method: 'id',
  };
  
  setThisWalletButtonLocator = {
    locator: 'dialog-setthiswallet-button',
    method: 'id',
  };
  
  switchWalletButtonLocator = {
    locator: 'dialog-switchwallet-button',
    method: 'id',
  };

  setThisWalletButtonNo = {
    locator: 'dialog-no-button',
    method: 'id',
  };

  setThisWalletButtonYes = {
    locator: 'dialog-yes-button',
    method: 'id',
  };
  
  /**
   * Switches to the cashback iframe.
   */
  async switchToCashbackIframe() {
    this.logger.info(`CashbackPage::switchToCashbackIframe is called`);
    await this.waitForElement(this.cashbackIframe, twoSeconds);
    const iframe = await this.findElement(this.cashbackIframe);
    await this.driver.switchTo().frame(iframe);
  }

  /**
   * Switches back to default content.
   */
  async switchToDefaultContent() {
    this.logger.info(`CashbackPage::switchToDefaultContent is called`);
    await this.driver.switchTo().defaultContent();
  }

  /**
   * Checks if the CLAIM CASHBACK button is visible.
   */
  async isClaimCashbackButtonVisible() {
    this.logger.info(`CashbackPage::isClaimCashbackButtonVisible is called`);
    try {
      await this.switchToCashbackIframe();
      const elements = await this.findElements(this.claimCashbackButton);
      await this.switchToDefaultContent();
      return elements.length > 0;
    } catch (error) {
      this.logger.error(`Error finding CLAIM CASHBACK button: ${error.message}`);
      await this.switchToDefaultContent();
      return false;
    }
  }

  /**
   * Verifies the cashback page has loaded.
   */
  async verifyCashbackPageLoaded() {
    this.logger.info(`CashbackPage::verifyCashbackPageLoaded is called`);
    const currentTitle = await this.getPageTitle();
    const titleVisible = currentTitle === pageTitle.cashback;
    const claimButtonVisible = await this.isClaimCashbackButtonVisible();
    return titleVisible && claimButtonVisible;
  }

  /**
   * Gets the number of cashback cards.
   */
  async getCashbackCardCount() {
    this.logger.info(`CashbackPage::getCashbackCardCount is called`);
    try {
      await this.switchToCashbackIframe();
      const cards = await this.findElements(this.cashbackCardContainer);
      await this.switchToDefaultContent();
      return cards.length;
    } catch (error) {
      await this.switchToDefaultContent();
      return 0;
    }
  }
}

export default CashbackPage;
