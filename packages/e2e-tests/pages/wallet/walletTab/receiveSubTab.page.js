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
  // methods
  async getReceiverAddress() {
    this.logger.info(`ReceiveSubTab::GenerateURIModal::getReceiverAddress is called.`);
    const address = await this.getAttribute(this.receiverAddressTextLocator, 'value');
    this.logger.info(`ReceiveSubTab::GenerateURIModal::getReceiverAddress::address - "${address}"`);
    return address
  }
  async enterReceiveAmount(adaAmount) {
    this.logger.info(`ReceiveSubTab::GenerateURIModal::enterReceiveAmount is called.`);
    await this.click(this.amountToSendInputLocator);
    await this.input(this.amountToSendInputLocator, adaAmount);
  }
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
  // * get the generated link
  async getGeneratedLink() {
    this.logger.info(`ReceiveSubTab::DisplayURIModal::getGeneratedLink is called.`);
    return await this.getText(this.linkTextLocator);
  }
  // * click copy btn on generated link
  async copyGeneratedLink() {
    this.logger.info(`ReceiveSubTab::DisplayURIModal::copyGeneratedLink is called.`);
    await this.click(this.copyGeneratedLink);
  }
  // * close the modal window
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
  // * click generate button
  async generateNewAddress(amount = 1) {
    this.logger.info(`ReceiveSubTab::generateNewAddress is called. Amount: ${amount}`);
    for (let addrIndex = 0; addrIndex < amount; addrIndex++) {
      await this.click(this.generateNewAddressButtonLocator);
      await this.sleep(200);
    }
  }
  // * get error message text
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
  // * select base external addresses all
  async selectBaseExtAllAddrs() {
    this.logger.info(`ReceiveSubTab::selectBaseExtAllAddrs is called.`);
    await this._selectBaseExt(this.allAddrsMenuItemLocator);
  }
  // * select base external addresses unused
  async selectBaseExtUnusedAddrs() {
    this.logger.info(`ReceiveSubTab::selectBaseExtUnusedAddrs is called.`);
    await this._selectBaseExt(this.unusedAddrsMenuItemLocator);
  }
  // * select base external addresses used
  async selectBaseExtUsedAddrs() {
    this.logger.info(`ReceiveSubTab::selectBaseExtUsedAddrs is called.`);
    await this._selectBaseExt(this.usedAddrsMenuItemLocator);
  }
  // * select base external addresses has balance
  async selectBaseExtHasBalanceAddrs() {
    this.logger.info(`ReceiveSubTab::selectBaseExtHasBalanceAddrs is called.`);
    await this._selectBaseExt(this.hasBalanceAddrsMenuItemLocator);
  }
  // * select base internal addresses all
  async selectBaseInterAllAddrs() {
    this.logger.info(`ReceiveSubTab::selectBaseInterAllAddrs is called.`);
    await this._selectBaseInter(this.allAddrsMenuItemLocator);
  }
  // * select base internal addresses unused
  async selectBaseInterUnusedAddrs() {
    this.logger.info(`ReceiveSubTab::selectBaseInterUnusedAddrs is called.`);
    await this._selectBaseInter(this.unusedAddrsMenuItemLocator);
  }
  // * select base internal addresses used
  async selectBaseInterUsedAddrs() {
    this.logger.info(`ReceiveSubTab::selectBaseInterUsedAddrs is called.`);
    await this._selectBaseInter(this.usedAddrsMenuItemLocator);
  }
  // * select base internal addresses has balance
  async selectBaseInterHasBalanceAddrs() {
    this.logger.info(`ReceiveSubTab::selectBaseInterHasBalanceAddrs is called.`);
    await this._selectBaseInter(this.hasBalanceAddrsMenuItemLocator);
  }
  // * select reward addresses
  async selectRewardAddrs() {
    this.logger.info(`ReceiveSubTab::selectRewardAddrs is called.`);
    await this.click(this.rewardAddrsMenuItemLocator);
    await this.sleep(300);
  }
  // * select addresses book
  async selectAddressesBook() {
    this.logger.info(`ReceiveSubTab::selectAddressesBook is called.`);
    await this.click(this.addressBookMenuItemLocator);
    await this.sleep(300);
  }
  // * get amount of displayed addresses
  async getAmountOfAddresses() {
    this.logger.info(`ReceiveSubTab::getAmountOfAddresses is called.`);
    const allAddrs = await this.findElements(this.generalAddrRowLocator);
    return allAddrs.length;
  }
  // * get address info by index
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
  // * get balance of displayed addresses
  async getBalanceOfDisplayedAddrs() {
    this.logger.info(`ReceiveSubTab::getBalanceOfDisplayedAddrs is called. Row index: ${rowIndex}`);
    const addrsAmount = await this.getAmountOfAddresses();
    let balance = 0;
    for (let rowIndex = 0; rowIndex < addrsAmount; rowIndex++) {
      const addrInfo = await this.getAddressInfo(rowIndex);
      balance = balance + addrInfo.balance;
    }
    return balance;
  }
  // * generate link
  async geneneratePaymentURI(rowIndex, adaAmount) {
    this.logger.info(`ReceiveSubTab::clickGenerateURL is called. Row index: ${rowIndex}`);
    const genURIBtnLocator = this.generateURIButtonInRowLocator(rowIndex);
    await this.click(genURIBtnLocator);
    const genLinkModal = new GenerateURIModal(this.driver, this.logger);
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
  async getCurrentReceiveAddr() {
    this.logger.info(`ReceiveSubTab::getCurrentReceiveAddr is called.`);
    const address = await this.getText(this.currentAddressToUseTextLocator);
    this.logger.info(`ReceiveSubTab::getCurrentReceiveAddr::address - "${address}"`);
    return address;
  }
}

export default ReceiveSubTab;
