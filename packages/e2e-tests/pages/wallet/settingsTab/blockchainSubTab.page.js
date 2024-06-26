import SettingsTab from './settingsTab.page.js';

class BlockchainSubTab extends SettingsTab {
  // locators
  explorersDropDownLocator = {
    locator: '//div[starts-with(@id, "explorerId--")]',
    method: 'xpath',
  };
  getExplorerMenuItem = explorer => {
    return {
      locator: `selectExplorer-${explorer}-menuItem`,
      method: 'id',
    };
  };
  // methods
  async openExplorerSelection() {
    this.logger.info(`BlockchainSubTab::openExplorerSelection is called`);
    await this.waitForElement(this.explorersDropDownLocator);
    await this.click(this.explorersDropDownLocator);
  }
  async pickExplorer(explorer) {
    this.logger.info(`BlockchainSubTab::pickExplorer is called. Explorer: "${explorer}"`);
    const explorerLocator = this.getExplorerMenuItem(explorer);
    await this.scrollIntoView(explorerLocator);
    await this.click(explorerLocator);
  }
  async selectExplorer(explorer) {
    this.logger.info(`BlockchainSubTab::selectExplorer is called. Explorer: "${explorer}"`);
    await this.openExplorerSelection();
    await this.pickExplorer(explorer);
    await this.sleep(200);
  }
}

export default BlockchainSubTab;
