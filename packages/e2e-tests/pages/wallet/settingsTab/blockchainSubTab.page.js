import { fiveSeconds, quarterSecond } from '../../../helpers/timeConstants.js';
import SettingsTab from './settingsTab.page.js';

class BlockchainSubTab extends SettingsTab {
  // locators
  explorersListLayoutLocator = {
    locator: 'menu-explorerId',
    method: 'id',
  };
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
    const result = await this.customWaitIsPresented(this.explorersListLayoutLocator, fiveSeconds, quarterSecond);
    if (!result) {
      throw new Error('Explorer settings is not opened');
    }
  }
  async pickExplorer(explorer) {
    this.logger.info(`BlockchainSubTab::pickExplorer is called. Explorer: "${explorer}"`);
    const explorerLocator = this.getExplorerMenuItem(explorer);
    await this.scrollIntoView(explorerLocator);
    await this.click(explorerLocator);
    const result = await this.customWaitIsNotPresented(this.explorersListLayoutLocator, fiveSeconds, quarterSecond);
    if (!result) {
      throw new Error('Explorer settings is still opened');
    }
  }
  async selectExplorer(explorer) {
    this.logger.info(`BlockchainSubTab::selectExplorer is called. Explorer: "${explorer}"`);
    await this.openExplorerSelection();
    await this.pickExplorer(explorer);
    await this.sleep(500);
  }
}

export default BlockchainSubTab;
