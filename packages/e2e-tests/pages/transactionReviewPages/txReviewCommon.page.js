import BasePage from '../basepage.js';
import { defaultWaitTimeout, quarterSecond } from '../../helpers/timeConstants.js';

class TxReviewCommon extends BasePage {
  // locators
  //* layout component
  layoutLocator = {
    locator: 'transactionReview-panel-component',
    method: 'id',
  };
  //* title component
  titleLocator = {
    locator: 'txReview-title-text',
    method: 'id',
  };
  closeBtnLocator = {
    locator: 'txReview-close-button',
    method: 'id',
  };

  backBtnLocator = {
    locator: 'txReview-back-button',
    method: 'id',
  };

  // methods
  //* isDisplayed
  async txReviewIsDisplayed() {
    this.logger.info(`TxReviewCommon::txReviewIsDisplayed is called`);
    const componentLayoutPromise = this.customWaitIsPresented(
      this.layoutLocator,
      defaultWaitTimeout,
      quarterSecond
    );
    const titlePromise = this.customWaitIsPresented(
      this.titleLocator,
      defaultWaitTimeout,
      quarterSecond
    );
    const [submenuState, summaryState] = await Promise.all([componentLayoutPromise, titlePromise]);

    return submenuState && summaryState;
  }
  async close() {
    this.logger.info(`TxReviewCommon::close is called`);
    await this.click(this.closeBtnLocator);
  }

  async back() {
    this.logger.info(`TxReviewCommon::back is called`);
    await this.click(this.backBtnLocator);
  }
}

export default TxReviewCommon;
