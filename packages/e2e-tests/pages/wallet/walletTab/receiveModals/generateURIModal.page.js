import BasePage from '../../../basepage.js';
import { twoSeconds, quarterSecond } from '../../../../helpers/timeConstants.js';

class GenerateURIModal extends BasePage {
  // locators
  generateURIModalLocator = {
    locator: 'uriGenerateDialog-dialogWindow-modalWindow',
    method: 'id',
  };
  generateURIModalTitleLocator = {
    locator: 'uriGenerateDialog-dialogTitle-text',
    method: 'id',
  };
  generateButtonLocator = {
    locator: 'uriGenerateDialog-generate-button',
    method: 'id',
  };
  closeModalButtonLocator = {
    locator: 'uriGenerateDialog-closeModal-button',
    method: 'id',
  };
  receiverAddressTextLocator = {
    locator: '//input[starts-with(@id, "receiver--")]', // unfortunately, I didn't find a way to make a proper ID
    method: 'xpath',
  };
  amountToSendInputLocator = {
    locator: '//input[starts-with(@id, "amount--")]', // unfortunately, I didn't find a way to make a proper ID
    method: 'xpath',
  };
  inputErrorMessageFieldLocator = {
    locator: '//p[starts-with(@id, "amount--") and contains(@id, "-helper-text")]',
    method: 'xpath',
  };
  // methods
  /**
   * Getting a receiver address from the disabled receiver input
   * @returns {Promise<string>} A bech32 string format address
   */
  async getReceiverAddress() {
    this.logger.info(`ReceiveSubTab::GenerateURIModal::getReceiverAddress is called.`);
    const address = await this.getAttribute(this.receiverAddressTextLocator, 'value');
    this.logger.info(`ReceiveSubTab::GenerateURIModal::getReceiverAddress::address - "${address}"`);
    return address;
  }
  /**
   * Entering amount to send
   * @param {string} adaAmount Amount to send
   */
  async enterReceiveAmount(adaAmount) {
    this.logger.info(`ReceiveSubTab::GenerateURIModal::enterReceiveAmount is called.`);
    await this.click(this.amountToSendInputLocator);
    await this.input(this.amountToSendInputLocator, adaAmount);
  }
  /**
   * Pressing the button "Generate".
   * The method contains a waiter with 2 seconds timeout
   */
  async generateLink() {
    this.logger.info(`ReceiveSubTab::GenerateURIModal::generateLink is called.`);
    const buttonIsEnabled = await this.customWaiter(
      async () => {
        const buttonlIsEnabled = await this.getAttribute(this.generateButtonLocator, 'disabled');
        return buttonlIsEnabled === null;
      },
      twoSeconds,
      quarterSecond
    );
    if (buttonIsEnabled) {
      await this.click(this.generateButtonLocator);
    } else {
      throw new Error('The Continue button is disabled');
    }
  }
  /**
   * Getting the error message of amount input field
   * @returns {Promise<string>}
   */
  async getAmountErrorMessage() {
    this.logger.info(`ReceiveSubTab::GenerateURIModal::getAmountErrorMessage is called.`);

    const messageAppeared = await this.customWaiter(
      async () => {
        const displayedText = await this.getText(this.inputErrorMessageFieldLocator);
        return displayedText !== '';
      },
      twoSeconds,
      quarterSecond
    );
    if (messageAppeared) {
      const errMsg = await this.getText(this.inputErrorMessageFieldLocator);
      this.logger.info(
        `ReceiveSubTab::GenerateURIModal::getAmountErrorMessage:errMsg - "${errMsg}"`
      );
      return errMsg;
    } else {
      return '';
    }
  }
}

export default GenerateURIModal;
