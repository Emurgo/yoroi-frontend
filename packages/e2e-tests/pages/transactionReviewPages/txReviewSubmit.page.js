import { fiveSeconds, quarterSecond } from '../../helpers/timeConstants.js';
import TxReviewCommon from './txReviewCommon.page.js';

class TxReviewSubmit extends TxReviewCommon {
  // locators
  passwordInputLocator = {
    locator: 'txReview:submitTransaction-password-input',
    method: 'id',
  };
  passwordErrorLocator = {
    locator: 'txReview:submitTransaction-passwordError-text',
    method: 'id',
  };

  // methods
  async enterPassword(password) {
    this.logger.info(`TxReviewSubmit::enterPassword is called. Password: ${password}`);
    await this.input(this.passwordInputLocator, password);
  }

  async waitAndGetPasswordError() {
    this.logger.info(`TxReviewSubmit::waitAndGetPasswordError is called.`);
    const isPresented = await this.customWaitIsPresented(
      this.passwordErrorLocator,
      fiveSeconds,
      quarterSecond
    );
    if (isPresented) {
      return await this.getText(this.passwordErrorLocator);
    }
    throw new Error('The password error message is not displayed');
  }
}

export default TxReviewSubmit;
