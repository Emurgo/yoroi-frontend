import WalletTab from './walletTab.page.js';

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
  generateURLButtonInRowLocator = rowIndex => {
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
    const addrsAmount = await this.getAmountOfAddresses();
    let balance = 0;
    for (let rowIndex = 0; rowIndex < addrsAmount; rowIndex++) {
      const addrInfo = await this.getAddressInfo(rowIndex);
      balance = balance + addrInfo.balance;
    }
    return balance;
  }
}

export default ReceiveSubTab;
