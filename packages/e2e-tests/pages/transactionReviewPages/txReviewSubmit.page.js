import { ElementLocator } from '../locator.js';
import TxReviewCommon from './txReviewCommon.page.js';

class TxReviewSubmit extends TxReviewCommon {
  // locators
  /** @type {ElementLocator} */
  passwordInputLocator = {
    locator: 'txReview:submitTransaction-password-input',
    method: 'id',
  };
  /** @type {ElementLocator} */
  passwordErrorMessageLocator = {
    locator: 'password-errorMessage-text',
    method: 'id',
  };

  // methods
  async enterPassword(password) {
    this.logger.info(`TxReviewSubmit::enterPassword is called. Password: ${password}`);
    await this.input(this.passwordInputLocator, password);
  }
  async getPasswordErrorMessage() {
    this.logger.info(`TxReviewSubmit::getPasswordErrorMessage is called.`);
    const result = await this.waitPresentedAndAct(this.passwordErrorMessageLocator, async () => {
      return await this.getText(this.passwordErrorMessageLocator);
    });
    this.logger.info(`TxReviewSubmit::getPasswordErrorMessage. Result: ${result}`);
    return result;
  }
}

export default TxReviewSubmit;
