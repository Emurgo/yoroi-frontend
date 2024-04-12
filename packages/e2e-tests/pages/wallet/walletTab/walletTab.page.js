import WalletCommonBase from '../../walletCommonBase.page.js'

class WalletTab extends WalletCommonBase {
  //locators
  // Transaction subtab
  transactionsSubmenuItemLocator = {
    locator: 'wallet-transactionsSubTab-button',
    method: 'id',
  }
  // Send subtab
  sendSubmenuItemLocator = {
    locator: 'wallet-sendSubTab-button',
    method: 'id',
  }
  // Receive subtab
  receiveSubmenuItemLocator = {
    locator: 'wallet-receiveSubTab-button',
    method: 'id',
  }
  //functions
  async goToTransactionsSubMenu() {
    this.logger.info(`WalletTab::goToTransactionsSubMenu is called`)
    await this.click(this.transactionsSubmenuItemLocator)
  }
  async goToSendSubMenu() {
    this.logger.info(`WalletTab::goToSendSubMenu is called`)
    await this.click(this.sendSubmenuItemLocator)
  }
  async goToReceiveSubMenu() {
    this.logger.info(`WalletTab::goToReceiveSubMenu is called`)
    await this.click(this.receiveSubmenuItemLocator)
  }
}

export default WalletTab
