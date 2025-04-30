import BasePage from '../../../basepage.js';

class NetworksInfoModal extends BasePage {
  // locators
  // * modal window presentation
  networkInfoModalPresentationLocator = {
    locator: 'testNetworkInfoModal-dialogWindow-presentation',
    method: 'id',
  };
  // * modal title
  networkInfoTitleLocator = {
    locator: 'testNetworkInfoModal-modalTitle-text',
    method: 'id',
  };
  // * modal close button
  networkInfoCloseBtnLocator = {
    locator: 'testNetworkInfoModal-closeModal-button',
    method: 'id',
  };
  // * understand btn
  undestandBtnLocator = {
    locator: 'testNetworkInfoModal-understand-button',
    method: 'id',
  };
  // methods
  // * isDisplayed
  async isDisplayed() {
    this.logger.info(`NetworksInfoModal::isDisplayed is called`);
    try {
      await this.waitForElement(this.networkInfoModalPresentationLocator);
      await this.waitForElement(this.networkInfoTitleLocator);
      return true;
    } catch (error) {
      return false;
    }
  }
  // * close memo modal
  async closeNetworksInfoModal() {
    this.logger.info(`NetworksInfoModal::closeNetworksInfoModal is called`);
    await this.click(this.networkInfoCloseBtnLocator);
  }
  // * I Understand button
  async understand() {
    this.logger.info(`NetworksInfoModal::understand is called`);
    await this.click(this.networkInfoCloseBtnLocator);
  }
}

export default NetworksInfoModal;
