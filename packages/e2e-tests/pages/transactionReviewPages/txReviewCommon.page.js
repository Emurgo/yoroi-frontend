import BasePage from '../basepage.js';
import { defaultWaitTimeout, fiveSeconds, quarterSecond } from '../../helpers/timeConstants.js';

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

  confirmBtnLocator = {
    locator: 'txReview-confrim-button',
    method: 'id',
  };

  cancelBtnLocator = {
    locator: 'txReview-cancel-button',
    method: 'id',
  };

  submitBtnLocator = {
    locator: 'txReview-submit-button',
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
    const [layoutState, titleState] = await Promise.all([componentLayoutPromise, titlePromise]);

    return layoutState && titleState;
  }
  async close() {
    this.logger.info(`TxReviewCommon::close is called`);
    await this.click(this.closeBtnLocator);
  }

  async back() {
    this.logger.info(`TxReviewCommon::back is called`);
    await this.click(this.backBtnLocator);
  }

  async confirm() {
    this.logger.info(`TxReviewCommon::confirm is called`);
    await this.click(this.confirmBtnLocator);
  }

  async cancel() {
    this.logger.info(`TxReviewCommon::cancel is called`);
    await this.click(this.cancelBtnLocator);
  }

  async submit() {
    this.logger.info(`TxReviewCommon::submit is called`);
    await this.waitForElement(this.submitBtnLocator);
    const buttonIsEnabled = await this.customWaiter(
      async () => {
        const buttonlIsEnabled = await this.getAttribute(this.submitBtnLocator, 'disabled');
        return buttonlIsEnabled === null;
      },
      fiveSeconds,
      quarterSecond
    );
    if (buttonIsEnabled) {
      await this.click(this.submitBtnLocator);
    } else {
      this.logger.error(`TxReviewCommon::submit The button Submit is not enabled`);
      throw new Error('The button Submit is not enabled');
    }
  }
}

export default TxReviewCommon;
