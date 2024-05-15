import WalletCommonBase from '../../walletCommonBase.page.js';

class SettingsTab extends WalletCommonBase {
  // locators
  // General subtab
  generalSubmenuItemLocator = {
    locator: 'settings-generalSubTab-button',
    method: 'id',
  };
  // Blockchain subtab
  blockchainSubmenuItemLocator = {
    locator: 'settings-blockchainSubTab-button',
    method: 'id',
  };
  // Wallet subtab
  walletSubmenuItemLocator = {
    locator: 'settings-walletSubTab-button',
    method: 'id',
  };
  // TOS subtab
  tosSubmenuItemLocator = {
    locator: 'settings-termsofuseSubTab-button',
    method: 'id',
  };
  // Support/Logs subtab
  supportSubmenuItemLocator = {
    locator: 'settings-supportSubTab-button',
    method: 'id',
  };
  // Level of Complexity subtab
  complexitySubmenuItemLocator = {
    locator: 'settings-levelofcomplexitySubTab-button',
    method: 'id',
  };
  // Analytics subtab
  analyticsSubmenuItemLocator = {
    locator: 'settings-analyticsSubTab-button',
    method: 'id',
  };

  // functions
  async goToGeneralSubMenu() {
    this.logger.info(`SettingsTab::goToGeneralSubMenu is called`);
    await this.click(this.generalSubmenuItemLocator);
  }
  async goToBlockchainSubMenu() {
    this.logger.info(`SettingsTab::goToBlockchainSubMenu is called`);
    await this.click(this.blockchainSubmenuItemLocator);
  }
  async goToWalletSubMenu() {
    this.logger.info(`SettingsTab::goToWalletSubMenu is called`);
    await this.click(this.walletSubmenuItemLocator);
  }
  async goToTOSSubMenu() {
    this.logger.info(`SettingsTab::goToTOSSubMenu is called`);
    await this.click(this.tosSubmenuItemLocator);
  }
  async goToSupportSubMenu() {
    this.logger.info(`SettingsTab::goToSupportSubMenu is called`);
    await this.click(this.supportSubmenuItemLocator);
  }
  async goToComplexitySubMenu() {
    this.logger.info(`SettingsTab::goToComplexitySubMenu is called`);
    await this.click(this.complexitySubmenuItemLocator);
  }
  async goToAnalyticsSubMenu() {
    this.logger.info(`SettingsTab::goToAnalyticsSubMenu is called`);
    await this.click(this.analyticsSubmenuItemLocator);
  }
  /**
   * Returns text from the General tab from Settings
   * @returns {Promise<string>}
   */
  async getGeneralSubTabText() {
    this.logger.info(`SettingsTab::getGeneralSubTabText is called`);
    const result = await this.getText(this.generalSubmenuItemLocator);
    this.logger.info(`SettingsTab::getGeneralSubTabText::result ${result}`);
    return result;
  }
}

export default SettingsTab;
