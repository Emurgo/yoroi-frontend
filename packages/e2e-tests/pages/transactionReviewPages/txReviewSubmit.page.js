import TxReviewCommon from './txReviewCommon.page.js';

class TxReviewSubmit extends TxReviewCommon {
  // locators
  passwordInputLocator = {
    locator: 'txReview:submitTransaction-password-input',
    method: 'id',
  };

  // methods
  async enterPassword(password) {
    this.logger.info(`TxReviewSubmit::enterPassword is called. Password: ${password}`);
    await this.input(this.passwordInputLocator, password);
  }
}

export default TxReviewSubmit;
