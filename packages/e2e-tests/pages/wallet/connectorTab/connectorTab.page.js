import { getByLocator } from '../../../utils/utils.js';
import WalletCommonBase from '../../walletCommonBase.page.js';
import { defaultWaitTimeout, oneSecond } from '../../../helpers/timeConstants.js';

class ConnectorTab extends WalletCommonBase {
  // locators
  connectedWalletRowLocator = {
    locator: '//div[starts-with(@id, "walletRow_")]',
    method: 'xpath',
  };
  connectedWalletRowFirstLocator = {
    locator: 'walletRow_0',
    method: 'id',
  };
  connectedWalletNameLabelLocator = {
    locator: 'connectedWalletNameLabel',
    method: 'id',
  };
  connectedWalletBalanceLocator = {
    locator: 'connectedWalletBalanceLabel',
    method: 'id',
  };
  connectedWalletDappUrlLabelLocator = {
    locator: 'dAppUrlLabel',
    method: 'id',
  };
  removeConnectionButtonLocator = {
    locator: 'removeWalletButton',
    method: 'id',
  };
  // functions
  async getAllConnectedWallets() {
    this.logger.info(`ConnectorTab::getAllConnectedWallets is called.`);
    await this.setImplicitTimeout(oneSecond, this.getAllConnectedWallets.name);
    const allWallets = await this.findElements(this.connectedWalletRowLocator);
    await this.setImplicitTimeout(defaultWaitTimeout, this.getAllConnectedWallets.name);
    return allWallets;
  }
  async getConnectedWalletInfo(walletName) {
    this.logger.info(`ConnectorTab::getWalletInfo is called for the wallet "${walletName}"`);
    const allWallets = await this.findElements(this.connectedWalletRowLocator);
    for (const walletElem of allWallets) {
      // name
      const walletNameElem = await walletElem.findElement(
        getByLocator(this.connectedWalletNameLabelLocator)
      );
      const walletNameText = await walletNameElem.getText();
      if (walletNameText !== walletName) {
        break;
      }
      // balance
      const walletBalanceElem = await walletElem.findElement(
        getByLocator(this.connectedWalletBalanceLocator)
      );
      const walletBalance = Number((await walletBalanceElem.getText()).split(' ')[0]);
      // dapp url
      const dappUrlElem = await walletElem.findElement(
        getByLocator(this.connectedWalletDappUrlLabelLocator)
      );
      const dappUrl = await dappUrlElem.getText();

      return {
        walletBalance,
        dappUrl,
      };
    }
    const errMsg = `The wallet with the name "${walletName}" is not found in the connected wallets`;
    this.logger.error(`ConnectorTab::getWalletInfo ${errMsg}`);
    throw new Error(errMsg);
  }
  async disconnectWallet(walletName, dappUrl) {
    this.logger.info(`ConnectorTab::disconnectWallet is called for the wallet "${walletName}"`);
    const allWallets = await this.findElements(this.connectedWalletRowLocator);
    for (const walletElem of allWallets) {
      const walletNameElem = await walletElem.findElement(
        getByLocator(this.connectedWalletNameLabelLocator)
      );
      const walletNameText = await walletNameElem.getText();
      const dappUrlElem = await walletElem.findElement(
        getByLocator(this.connectedWalletDappUrlLabelLocator)
      );
      const dappUrlText = await dappUrlElem.getText();
      if (walletNameText === walletName && dappUrlText === dappUrl) {
        await this.hoverOnElement(walletElem);
        await this.click(this.removeConnectionButtonLocator);
        await this.sleep(200);
        return true;
      }
    }
    const errMsg = `The wallet with the name "${walletName}" is not found in the connected wallets`;
    this.logger.error(`ConnectorTab::disconnectWallet ${errMsg}`);
    throw new Error(errMsg);
  }
}

export default ConnectorTab;
