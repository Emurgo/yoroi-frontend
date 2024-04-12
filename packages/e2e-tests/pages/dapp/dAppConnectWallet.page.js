import DAppBase from './dAppBase.page.js';
import { getByLocator } from '../../utils/utils.js';

class DAppConnectWallet extends DAppBase {
  // locators
  walletsListLocator = {
    locator: '.ConnectPage_list',
    method: 'css',
  };
  walletItemButtonLocator = {
    locator: '.ConnectPage_listItem',
    method: 'css',
  };
  walletItemPlateLabelLocator = {
    locator: '.ConnectedWallet_checksum',
    method: 'css',
  };
  walletItemNameLabelLocator = {
    locator: '.ConnectedWallet_nameWrapper',
    method: 'css',
  };
  walletItemBalanceLabelLocator = {
    locator: 'dAppConnector:connect:walletList:walletCard_0-availableBalance-text',
    method: 'id',
  };
  noWalletsLabelLocator = {
    locator: '.ConnectPage_noWalletsText',
    method: 'css',
  };
  createWalletButtonLocator = {
    locator: '.ConnectPage_createWallet',
    method: 'css',
  };
  // functions
  async _findWallet(wallets, walletPlate) {
    this.logger.info(`DAppConnectWallet::_findWallet is called`);
    const resultWallets = wallets.filter(async walletEl => {
      const nameAndPlate = await walletEl.findElement(
        getByLocator(this.walletItemPlateLabelLocator)
      );
      return (await nameAndPlate.getText()).includes(walletPlate);
    });
    if (resultWallets.length === 0) {
      throw new Error(`No suitebale wallets are found. Expected wallet plate is ${walletPlate}`);
    } else if (resultWallets.length > 1) {
      throw new Error(`Too many wallet are found for the wallet plate ${walletPlate}`);
    }
    return resultWallets[0];
  }
  async getWallets() {
    const allWallets = await this.findElements(this.walletItemButtonLocator);
    return allWallets;
  }
  async getWalletInfo(walletChecksum) {
    this.logger.info(`DAppConnectWallet::getWalletInfo is called`);
    const wallets = await this.getWallets();
    const walletElem = await this._findWallet(wallets, walletChecksum);
    const walletNameFieldElem = await walletElem.findElement(
      getByLocator(this.walletItemNameLabelLocator)
    );
    const fullText = await walletNameFieldElem.getText();
    const [walletName, walletPlate] = fullText.split('\n');
    const walletBalanceElem = await walletElem.findElement(
      getByLocator(this.walletItemBalanceLabelLocator)
    );
    const fullBalanceText = await walletBalanceElem.getText();
    const walletBalance = Number(fullBalanceText.split(' ')[0]);

    return {
      walletBalance,
      walletName,
      walletPlate,
    };
  }
  async selectWallet(walletChecksum) {
    this.logger.info(`DAppConnectWallet::selectWallet is called`);
    const wallets = await this.getWallets();
    const walletElem = await this._findWallet(wallets, walletChecksum);
    await walletElem.click();
  }
  async noWalletsWarningIsDisplayed() {
    this.logger.info(`DAppConnectWallet::noWalletsWarningIsDisplayed is called`);
    await this.waitForElement(this.noWalletsLabelLocator);
    const element = await this.findElement(this.noWalletsLabelLocator);
    return await element.isDisplayed();
  }
  async clickCreateWallet() {
    this.logger.info(`DAppConnectWallet::noWalletsWarningIsDisplayed is called`);
    await this.waitForElement(this.createWalletButtonLocator);
    await this.click(this.createWalletButtonLocator);
  }
}

export default DAppConnectWallet;
