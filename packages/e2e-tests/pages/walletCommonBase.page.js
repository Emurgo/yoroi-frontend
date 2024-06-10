import { halfSecond, oneMinute, oneSecond, defaultWaitTimeout } from '../helpers/timeConstants.js';
import BasePage from './basepage.js';

class WalletCommonBase extends BasePage {
  // locators
  //
  // side panel
  walletTabButtonLocator = {
    locator: 'settings.menu.wallet.link.label',
    method: 'id',
  };
  stakingTabButtonLocator = {
    locator: 'sidebar.staking',
    method: 'id',
  };
  assetsTabButtonLocator = {
    locator: 'sidebar.assets',
    method: 'id',
  };
  nftsTabButtonLocator = {
    locator: 'sidebar.nfts',
    method: 'id',
  };
  votingTabButtonLocator = {
    locator: 'sidebar.voting',
    method: 'id',
  };
  connectorTabButtonLocator = {
    locator: 'connector.appNameShort',
    method: 'id',
  };
  settingTabButtonLocator = {
    locator: 'sidebar.settings',
    method: 'id',
  };
  // selected wallet panel
  selectedWalletButtonLocator = {
    locator: '.NavWalletDetailsRevamp_contentWrapper',
    method: 'css',
  };
  walletNameAndPlateNumberTextLocator = {
    locator: '.NavWalletDetailsRevamp_walletInfo',
    method: 'css',
  };
  walletBalanceTextLocator = {
    locator: 'topBar:selectedWallet-availableBalance-text',
    method: 'id',
  };
  walletFiatBalanceTextLocator = {
    locator: 'topBar:selectedWallet-availableFiatBalance-text',
    method: 'id',
  };
  // change wallet modal window
  changeWalletDialogLocator = {
    locator: 'changeWalletDialog-dialogWindow-modalWindow',
    method: 'id',
  };
  changeWalletDialogAddNewWalletButtonLocator = {
    locator: 'changeWalletDialog-addWallet-button',
    method: 'id',
  };
  changeWalletDialogApplyWalletButtonLocator = {
    locator: 'changeWalletDialog-applyWallet-button',
    method: 'id',
  };
  getWalletButtonLocator = index => {
    return {
      locator: `changeWalletDialog:walletsList-selectWallet_${index}-button`,
      method: 'id',
    };
  };
  getWalletNameLocator = index => {
    return {
      locator: `changeWalletDialog:walletsList:walletCard_${index}-walletName-text`,
      method: 'id',
    };
  };
  getWalletBalanceLocator = index => {
    return {
      locator: `changeWalletDialog:walletsList:walletCard_${index}-availableBalance-text`,
      method: 'id',
    };
  };
  getWalletTokensAmountLocator = index => {
    return {
      locator: `changeWalletDialog:walletsList:walletCard_${index}-walletTokensAmount-text`,
      method: 'id',
    };
  };
  getWalletNFTsAmountLocator = index => {
    return {
      locator: `changeWalletDialog:walletsList:walletCard_${index}-walletNFTsAmount-text`,
      method: 'id',
    };
  };
  // prepare wallet hover layout
  prepareWalletBannerLocator = {
    locator: '.DotFlashing_component',
    method: 'css',
  };
  walletIsLoadingSpinnerLocator = {
    locator: '.AmountDisplay_isLoading',
    method: 'css',
  };
  // modal window of selecting a wallet
  // "Discover a new Yoroi" modal window
  dialogUpdatesTitleLocator = {
    locator: 'dialog-dialogTitle-text',
    method: 'id',
  };
  dialogUpdatesGoToWalletButtonLocator = {
    locator: 'dialog-gotothewallet-button',
    method: 'id',
  };
  //
  // functions
  async getSelectedWalletInfo() {
    this.logger.info(`WalletCommonBase::getSelectedWalletInfo is called`);

    await this.waitForElement(this.walletNameAndPlateNumberTextLocator);
    const rawNameAndPlateText = await this.getText(this.walletNameAndPlateNumberTextLocator);
    const [walletName, walletPlate] = rawNameAndPlateText.split('\n');

    await this.waitForElement(this.walletBalanceTextLocator);
    const rawBalanceText = await this.getText(this.walletBalanceTextLocator);
    const adaBalance = Number(rawBalanceText.split(' ')[0]);

    const rawFiatBalanceText = await this.getText(this.walletFiatBalanceTextLocator);
    const [fiatBalanceStr, fiatCurrency] = rawFiatBalanceText.split(' ');
    const fiatBalance = fiatBalanceStr === '-' ? 0 : Number(fiatBalanceStr);

    const walletInfo = {
      name: walletName,
      plate: walletPlate,
      balance: adaBalance,
      fiatBalance,
      fiatCurrency,
    };
    this.logger.info(
      `WalletCommonBase::getSelectedWalletInfo::walletInfo is ${JSON.stringify(walletInfo)}`
    );
    return walletInfo;
  }
  async closeUpdatesModalWindow() {
    this.logger.info(`WalletCommonBase::closeUpdatesModalWindow is called`);
    await this.waitForElement(this.dialogUpdatesTitleLocator);
    await this.waitForElement(this.dialogUpdatesGoToWalletButtonLocator);
    await this.click(this.dialogUpdatesGoToWalletButtonLocator);
    await this.sleep(500);
  }
  async waitPrepareWalletBannerIsClosed() {
    this.logger.info(`WalletCommonBase::waitPrepareWalletBannerIsClosed is called`);
    const state = await this.customWaiter(
      async () => {
        const elAmount = await this.findElements(this.prepareWalletBannerLocator);
        const loadersAmount = await this.findElements(this.walletIsLoadingSpinnerLocator);
        return elAmount.length === 0 && loadersAmount.length === 0;
      },
      oneMinute,
      halfSecond
    );
    if (!state) {
      this.logger.error(
        `WalletCommonBase::waitPrepareWalletBannerIsClosed The prepare wallet banner is still displayed after ${
          oneMinute / 1000
        } seconds`
      );
      throw new Error(`The wallet is still loading after ${oneMinute / 1000} seconds`);
    }
  }
  async goToWalletTab() {
    this.logger.info(`WalletCommonBase::goToWalletTab is called`);
    await this.click(this.walletTabButtonLocator);
  }
  async goToStakingTab() {
    this.logger.info(`WalletCommonBase::goToStakingTab is called`);
    await this.click(this.stakingTabButtonLocator);
  }
  async goToAssetsTab() {
    this.logger.info(`WalletCommonBase::goToAssetsTab is called`);
    await this.click(this.assetsTabButtonLocator);
  }
  async goToNftsTab() {
    this.logger.info(`WalletCommonBase::goToNftsTab is called`);
    await this.click(this.nftsTabButtonLocator);
  }
  async goToVotingTab() {
    this.logger.info(`WalletCommonBase::goToVotingTab is called`);
    await this.click(this.votingTabButtonLocator);
  }
  async goToConnectorTab() {
    this.logger.info(`WalletCommonBase::goToConnectorTab is called`);
    await this.click(this.connectorTabButtonLocator);
  }
  async goToSettingsTab() {
    this.logger.info(`WalletCommonBase::goToSettingsTab is called`);
    await this.driver.manage().setTimeouts({ implicit: oneSecond });
    await this.click(this.settingTabButtonLocator);
    await this.driver.manage().setTimeouts({ implicit: defaultWaitTimeout });
  }
  async openChangeWalletModal() {
    this.logger.info(`WalletCommonBase::openChangeWalletModal is called`);
    await this.click(this.selectedWalletButtonLocator);
    await this.waitForElement(this.changeWalletDialogLocator);
  }
  async addNewWallet() {
    this.logger.info(`WalletCommonBase::addNewWallet is called`);
    await this.openChangeWalletModal();
    await this.click(this.changeWalletDialogAddNewWalletButtonLocator);
  }
  async _findAndSelectWallet(walletName, totalWallets) {
    this.logger.info(`WalletCommonBase::_findAndSelectWallet is called`);
    for (let index = 0; index < totalWallets; index++) {
      const walletNameLocator = this.getWalletNameLocator(index);
      const foundWalletName = await this.getText(walletNameLocator);
      if (foundWalletName === walletName) {
        const walletButtonLocator = this.getWalletButtonLocator(index);
        await this.click(walletButtonLocator);
        this.logger.info(
          `WalletCommonBase::_findAndSelectWallet with the name "${walletName}" is found and selected`
        );
        return;
      }
    }
    this.logger.warn(
      `WalletCommonBase::_findAndSelectWallet with the name "${walletName}" is NOT found`
    );
  }
  async switchToFirstWallet() {
    this.logger.info(`WalletCommonBase::switchToFirstWallet is called`);
    await this.openChangeWalletModal();
    const firstWalletLocator = this.getWalletButtonLocator(0);
    await this.click(firstWalletLocator);
    await this.click(this.changeWalletDialogApplyWalletButtonLocator);
  }
  async switchToWallet(walletObject, totalWallets) {
    this.logger.info(`WalletCommonBase::switchToWallet is called`);
    await this.openChangeWalletModal();
    await this._findAndSelectWallet(walletObject.name, totalWallets);
    await this.click(this.changeWalletDialogApplyWalletButtonLocator);
  }
  async getWalletInfoFromChangeWalletDialog(walletIndex) {
    this.logger.info(
      `WalletCommonBase::getWalletInfoFromChangeWalletDialog is called. Wallet index: ${walletIndex}`
    );
    const name = await this.getText(this.getWalletNameLocator(walletIndex));
    const balanceString = (await this.getText(this.getWalletBalanceLocator(walletIndex))).split(
      ' '
    )[0];
    const tokensString = await this.getText(this.getWalletTokensAmountLocator(walletIndex));
    const nftsString = await this.getText(this.getWalletNFTsAmountLocator(walletIndex));
    const balance = parseFloat(balanceString);
    const tokens = parseInt(tokensString, 10);
    const nfts = parseInt(nftsString, 10);

    return {
      name,
      balance,
      tokens,
      nfts,
    };
  }
}

export default WalletCommonBase;
