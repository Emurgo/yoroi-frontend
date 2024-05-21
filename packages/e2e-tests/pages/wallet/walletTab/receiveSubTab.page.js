import WalletTab from './walletTab.page.js';
import BasePage from '../../basepage.js';
import { twoSeconds, quarterSecond } from '../../../helpers/timeConstants.js';

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

class ReceiveSubTab extends WalletTab {
  // locators
  // * base addresses menu item
  baseAddrsMenuItemLocator = {
    locator: 'wallet:wallet:receive:navigationPanel-baseMenuItem-button',
    method: 'id',
  };
  // * base external addrs menu item
  baseExternalAddrsMenuItemLocator = {
    locator: 'wallet:receive:navigationPanel-externalMenuItem-button',
    method: 'id',
  };
  // * base internal addrs menu item
  baseInternalAddrsMenuItemLocator = {
    locator: 'wallet:receive:navigationPanel-internalMenuItem-button',
    method: 'id',
  };
  // * reward addresses menu item
  rewardAddrsMenuItemLocator = {
    locator: 'wallet:receive:navigationPanel-rewardMenuItem-button',
    method: 'id',
  };
  // * address book menu item
  addressBookMenuItemLocator = {
    locator: 'wallet:receive:navigationPanel-addressbookMenuItem-button',
    method: 'id',
  };
  // * all addrs menu item
  allAddrsMenuItemLocator = {
    locator: 'wallet:receive:navigationPanel-allMenuItem-button',
    method: 'id',
  };
  // * unused addrs menu item
  unusedAddrsMenuItemLocator = {
    locator: 'wallet:receive:navigationPanel-unusedMenuItem-button',
    method: 'id',
  };
  // * used addrs menu item
  usedAddrsMenuItemLocator = {
    locator: 'wallet:receive:navigationPanel-usedMenuItem-button',
    method: 'id',
  };
  // * has balance menu item
  hasBalanceAddrsMenuItemLocator = {
    locator: 'wallet:receive:navigationPanel-hasbalanceMenuItem-button',
    method: 'id',
  };
  // * receive wallet addr
  currentAddressToUseTextLocator = {
    locator: 'wallet:receive:infoPanel:header-address-text',
    method: 'id',
  };
  // * receive wallet addr copy btn
  copyCurrentAddressToUseButtonLocator = {
    locator: 'wallet:receive:infoPanel:header-copyAddress-button',
    method: 'id',
  };
  // * receive wallet addr qr-code img
  addrQrCodeImageLocator = {
    locator: 'wallet:receive:infoPanel:header-addressQrCode-image',
    method: 'id',
  };
  // * receive wallet addr generate new addr btn
  generateNewAddressButtonLocator = {
    locator: 'wallet:receive:infoPanel:header-generateNewAddress-button',
    method: 'id',
  };
  // * generating new address error
  generateNewAddrErrorLocator = {
    locator: 'wallet:receive:infoPanel:header-addressError-text',
    method: 'id',
  };
  // * general paths for address's row
  generalAddrRowLocator = {
    locator: '//div[starts-with(@id, "wallet:receive:infoPanel:footer-addressRow_")]',
    method: 'xpath',
  };
  // * address row
  addressRowLocator = rowIndex => {
    return {
      locator: `wallet:receive:infoPanel:footer-addressRow_${rowIndex}-box`,
      method: 'id',
    };
  };
  // * address row addr
  addressTextInRowLocator = rowIndex => {
    return {
      locator: `wallet:receive:infoPanel:footer:addressRow_${rowIndex}-address-text`,
      method: 'id',
    };
  };
  // * address row copy addr btn
  addressCopyButtonInRowLocator = rowIndex => {
    return {
      locator: `wallet:receive:infoPanel:footer:addressRow_${rowIndex}-copyAddress-button`,
      method: 'id',
    };
  };
  // * address row balance
  addressBalanceTextInRowLocator = rowIndex => {
    return {
      locator: `wallet:receive:infoPanel:footer:addressRow_${rowIndex}-adaAmount-text`,
      method: 'id',
    };
  };
  // * address row generate URL btn
  generateURIButtonInRowLocator = rowIndex => {
    return {
      locator: `wallet:receive:infoPanel:footer:addressRow_${rowIndex}-generateUrl-button`,
      method: 'id',
    };
  };
  // * address row verify addr btn
  verifyAddressButtonInRowLocator = rowIndex => {
    return {
      locator: `wallet:receive:infoPanel:footer:addressRow_${rowIndex}-verifyAddress-button`,
      method: 'id',
    };
  };
  // methods
  /**
   * Generating a new address by clicking on the "Generate new address" button
   * @param {number} amount Amount of addresses to generate
   */
  async generateNewAddress(amount = 1) {
    this.logger.info(`ReceiveSubTab::generateNewAddress is called. Amount: ${amount}`);
    for (let addrIndex = 0; addrIndex < amount; addrIndex++) {
      await this.click(this.generateNewAddressButtonLocator);
      await this.sleep(200);
    }
  }
  /**
   * Getting an error message from the Receive tab
   * @returns {Promise<string>}
   */
  async getErrorMessageText() {
    this.logger.info(`ReceiveSubTab::getErrorMessageText is called.`);
    return await this.getText(this.generateNewAddrErrorLocator);
  }
  async _selectBaseExt(subMenuItemLocator) {
    await this.click(this.baseExternalAddrsMenuItemLocator);
    await this.click(subMenuItemLocator);
    await this.sleep(300);
  }
  async _selectBaseInter(subMenuItemLocator) {
    await this.click(this.baseInternalAddrsMenuItemLocator);
    await this.click(subMenuItemLocator);
    await this.sleep(300);
  }
  /**
   * Clicking on the "External" menu item and then clicking on the "All" menu item
   */
  async selectBaseExtAllAddrs() {
    this.logger.info(`ReceiveSubTab::selectBaseExtAllAddrs is called.`);
    await this._selectBaseExt(this.allAddrsMenuItemLocator);
  }
  /**
   * Clicking on the "External" menu item and then clicking on the "Unused" menu item
   */
  async selectBaseExtUnusedAddrs() {
    this.logger.info(`ReceiveSubTab::selectBaseExtUnusedAddrs is called.`);
    await this._selectBaseExt(this.unusedAddrsMenuItemLocator);
  }
  /**
   * Clicking on the "External" menu item and then clicking on the "Used" menu item
   */
  async selectBaseExtUsedAddrs() {
    this.logger.info(`ReceiveSubTab::selectBaseExtUsedAddrs is called.`);
    await this._selectBaseExt(this.usedAddrsMenuItemLocator);
  }
  /**
   * Clicking on the "External" menu item and then clicking on the "Has balance" menu item
   */
  async selectBaseExtHasBalanceAddrs() {
    this.logger.info(`ReceiveSubTab::selectBaseExtHasBalanceAddrs is called.`);
    await this._selectBaseExt(this.hasBalanceAddrsMenuItemLocator);
  }
  /**
   * Clicking on the "Internal" menu item and then clicking on the "All" menu item
   */
  async selectBaseInterAllAddrs() {
    this.logger.info(`ReceiveSubTab::selectBaseInterAllAddrs is called.`);
    await this._selectBaseInter(this.allAddrsMenuItemLocator);
  }
  /**
   * Clicking on the "Internal" menu item and then clicking on the "Unused" menu item
   */
  async selectBaseInterUnusedAddrs() {
    this.logger.info(`ReceiveSubTab::selectBaseInterUnusedAddrs is called.`);
    await this._selectBaseInter(this.unusedAddrsMenuItemLocator);
  }
  /**
   * Clicking on the "Internal" menu item and then clicking on the "Used" menu item
   */
  async selectBaseInterUsedAddrs() {
    this.logger.info(`ReceiveSubTab::selectBaseInterUsedAddrs is called.`);
    await this._selectBaseInter(this.usedAddrsMenuItemLocator);
  }
  /**
   * Clicking on the "Internal" menu item and then clicking on the "Has balance" menu item
   */
  async selectBaseInterHasBalanceAddrs() {
    this.logger.info(`ReceiveSubTab::selectBaseInterHasBalanceAddrs is called.`);
    await this._selectBaseInter(this.hasBalanceAddrsMenuItemLocator);
  }
  /**
   * Clicking on the "Reward" menu item
   */
  async selectRewardAddrs() {
    this.logger.info(`ReceiveSubTab::selectRewardAddrs is called.`);
    await this.click(this.rewardAddrsMenuItemLocator);
    await this.sleep(300);
  }
  /**
   * Clicking on the "Address book" menu item
   */
  async selectAddressesBook() {
    this.logger.info(`ReceiveSubTab::selectAddressesBook is called.`);
    await this.click(this.addressBookMenuItemLocator);
    await this.sleep(300);
  }
  /**
   * Getting an amount for displayed addresses
   * @returns {Promise<number>}
   */
  async getAmountOfAddresses() {
    this.logger.info(`ReceiveSubTab::getAmountOfAddresses is called.`);
    const allAddrs = await this.findElements(this.generalAddrRowLocator);
    return allAddrs.length;
  }
  /**
   * 
   * @param {number} rowIndex An index of a row in the addresses table starting from 0
   * @returns {Promise<{address: string, balance: number}>}
   */
  async getAddressInfo(rowIndex) {
    this.logger.info(`ReceiveSubTab::getAddressInfo is called. Row index: ${rowIndex}`);
    const shortAddr = await this.getText(this.addressTextInRowLocator(rowIndex));
    const addrBalanceText = await this.getText(this.addressBalanceTextInRowLocator(rowIndex));
    if (addrBalanceText === '-') {
      return {
        address: shortAddr,
        balance: 0,
      };
    }
    const regexp = /\d+(\.\d+)?/g;
    const matchResult = [...addrBalanceText.matchAll(regexp)];
    const addrBalance = parseFloat(matchResult[0]);
    return {
      address: shortAddr,
      balance: addrBalance,
    };
  }
  /**
   * Getting a sum of addresses balances
   * @returns {Promise<number>}
   */
  async getBalanceOfDisplayedAddrs() {
    this.logger.info(`ReceiveSubTab::getBalanceOfDisplayedAddrs is called.`);
    const addrsAmount = await this.getAmountOfAddresses();
    let balance = 0;
    for (let rowIndex = 0; rowIndex < addrsAmount; rowIndex++) {
      const addrInfo = await this.getAddressInfo(rowIndex);
      balance = balance + addrInfo.balance;
    }
    return balance;
  }
  /**
   * Pressing the Generate URI button for an address
   * @param {number} rowIndex An index of a row where the button Generate URI should be pressed
   * @returns {Promise<GenerateURIModal>}
   */
  async clickGenerateURI(rowIndex) {
    this.logger.info(`ReceiveSubTab::geneneratePaymentURI is called. Row index: ${rowIndex}`);
    const genURIBtnLocator = this.generateURIButtonInRowLocator(rowIndex);
    await this.click(genURIBtnLocator);
    return new GenerateURIModal(this.driver, this.logger);
  }
  /**
   * Getting an object of the modal window GenerateURIModal
   * @returns {GenerateURIModal}
   */
  getGenerateURIModal() {
    this.logger.info(`ReceiveSubTab::getGenerateURIModal is called.`);
    return new GenerateURIModal(this.driver, this.logger);
  }
  /**
   * Getting an object of the modal window DisplayURIModal
   * @returns {DisplayURIModal}
   */
  getDisplayURIModal() {
    this.logger.info(`ReceiveSubTab::getDisplayURIModal is called.`);
    return new DisplayURIModal(this.driver, this.logger);
  }
  /**
   * 
   * @param {number} rowIndex An index of a row in the addresses table starting from 0
   * @param {string} adaAmount ADA amount to receive
   * @returns {Promise<{address: string, amount: string, genLink: string}>}
   */
  async geneneratePaymentURI(rowIndex, adaAmount) {
    this.logger.info(
      `ReceiveSubTab::geneneratePaymentURI is called. Row index: ${rowIndex}, amount: ${adaAmount}`
    );
    const genLinkModal = await this.clickGenerateURI(rowIndex);
    const selectedAddress = await genLinkModal.getReceiverAddress();
    await genLinkModal.enterReceiveAmount(adaAmount);
    await genLinkModal.generateLink();
    const generatedURIModal = new DisplayURIModal(this.driver, this.logger);
    const generatedLink = await generatedURIModal.getGeneratedLink();
    await generatedURIModal.closeModalWindow();
    return {
      address: selectedAddress,
      amount: adaAmount,
      genLink: generatedLink,
    };
  }
  /**
   * Getting the latest address which is displayed at the header panel of the Receive page
   * @returns {Promise<string>}
   */
  async getCurrentReceiveAddr() {
    this.logger.info(`ReceiveSubTab::getCurrentReceiveAddr is called.`);
    const address = await this.getText(this.currentAddressToUseTextLocator);
    this.logger.info(`ReceiveSubTab::getCurrentReceiveAddr::address - "${address}"`);
    return address;
  }
}

export default ReceiveSubTab;
