import BasePage from '../../../basepage.js';

class DisplayURIModal extends BasePage {
  // locators
  uriDisplayModalLocator = {
    locator: 'uriDisplayDialog-dialogWindow-modalWindow',
    method: 'id',
  };
  uriDisplayModalTitleLocator = {
    locator: 'uriDisplayDialog-dialogTitle-text',
    method: 'id',
  };
  closeModalButtonLocator = {
    locator: 'uriDisplayDialog-closeModal-button',
    method: 'id',
  };
  linkTextLocator = {
    locator: 'uriDisplayDialog-address-text',
    method: 'id',
  };
  copyLinkButtonLocator = {
    locator: 'uriDisplayDialog-copyAddress-button',
    method: 'id',
  };
  // methods
  /**
   * Getting a generated link right from the component itself
   * @returns {Promise<string>}
   */
  async getGeneratedLink() {
    this.logger.info(`ReceiveSubTab::DisplayURIModal::getGeneratedLink is called.`);
    return await this.getText(this.linkTextLocator);
  }
  /**
   * Getting a generated link by clicking on the copy button near the text field.
   * The address will be saved into clipboard.
   */
  async copyGeneratedLink() {
    this.logger.info(`ReceiveSubTab::DisplayURIModal::copyGeneratedLink is called.`);
    await this.click(this.copyGeneratedLink);
  }
  /**
   * Closing the modal window
   */
  async closeModalWindow() {
    this.logger.info(`ReceiveSubTab::DisplayURIModal::closeModalWindow is called.`);
    await this.click(this.closeModalButtonLocator);
  }
}

export default DisplayURIModal;
