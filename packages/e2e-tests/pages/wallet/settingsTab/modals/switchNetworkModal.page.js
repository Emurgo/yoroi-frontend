import { CardanoNetworks } from '../../../../helpers/constants.js';
import BasePage from '../../../basepage.js';

class SwitchNetworkModal extends BasePage {
  // locators
  // * modal window
  switchNetworkModalLocator = {
    locator: 'switchNetworkDialog-dialogWindow-modalWindow',
    method: 'id',
  };
  // * modal title
  switchNetworkTitleLocator = {
    locator: 'switchNetworkDialog-dialogTitle-text',
    method: 'id',
  };
  // * modal close button
  switchNetworkCloseBtnLocator = {
    locator: 'switchNetworkDialog-closeModal-button',
    method: 'id',
  };
  // dropdown
  // * it should be called by the .dispatchEvent(mouseDownEvent);
  switchNetworkDropdownLocator = {
    locator: 'switchNetworkDialog-selectNetwork-dropdown',
    method: 'id',
  }
  mainnetMenuItemLocator = {
    locator: 'switchNetworkDialog-selectNetwork_0-menuItem',
    method: 'id',
  }
  preprodMenuItemLocator = {
    locator: 'switchNetworkDialog-selectNetwork_250-menuItem',
    method: 'id',
  }
  previewMenuItemLocator = {
    locator: 'switchNetworkDialog-selectNetwork_350-menuItem',
    method: 'id',
  }
  // cancel
  switchNetworkCancelBtnLocator = {
    locator: 'switchNetworkDialog-cancel-button',
    method: 'id',
  };
  // apply
  switchNetworkApplyBtnLocator = {
    locator: 'switchNetworkDialog-apply-button',
    method: 'id',
  };

  // methods
  // * isDisplayed
  async isDisplayed() {
    this.logger.info(`SwitchNetworkModal::isDisplayed is called`);
    try {
      await this.waitForElement(this.switchNetworkModalLocator);
      await this.waitForElement(this.switchNetworkTitleLocator);
      return true;
    } catch (error) {
      return false;
    }
  }
  // * close memo modal
  async closeSwitchNetworkModal() {
    this.logger.info(`SwitchNetworkModal::closeSwitchNetworkModal is called`);
    await this.click(this.switchNetworkCloseBtnLocator);
  }
  // * select network
  async selectNetwork(networkName, applySelection = true) {
    this.logger.info(`SwitchNetworkModal::selectNetwork is called`);
    await this.click(this.switchNetworkDropdownLocator);
    let networkLocator = null;
    switch (networkName) {
      case CardanoNetworks.MN:
        networkLocator = this.mainnetMenuItemLocator;
        break;
      case CardanoNetworks.PP:
        networkLocator = this.preprodMenuItemLocator;
        break;
      case CardanoNetworks.PV:
        networkLocator = this.previewMenuItemLocator;
        break;
      default:
        throw new Error("Unknokwn network to select");
    }
    await this.click(networkLocator);
    if (applySelection) {
      await this.applySelection();
    } else {
      await this.cancelSelection();
    }
  }
  // * apply selection
  async applySelection() {
    this.logger.info(`SwitchNetworkModal::applySelection is called`);
    await this.click(this.switchNetworkApplyBtnLocator);
  }
  // * cancel selection
  async cancelSelection() {
    this.logger.info(`SwitchNetworkModal::cancelSelection is called`);
    await this.click(this.switchNetworkCancelBtnLocator);
  }
}

export default SwitchNetworkModal;
