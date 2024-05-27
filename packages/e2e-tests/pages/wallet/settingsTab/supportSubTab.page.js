import { oneSecond } from '../../../helpers/timeConstants.js';
import SettingsTab from './settingsTab.page.js';

class SupportSubTab extends SettingsTab {
  // locators
  faqLinkLocator = {
    locator: 'settings:support-faq-link',
    method: 'id',
  };
  requestSupportLinkLocator = {
    locator: 'settings:support-requestSupport-link',
    method: 'id',
  };
  // downloadLogs button
  downloadLogsButtonLocator = {
    locator: 'settings:support-downloadLogs-buttons',
    method: 'id',
  };
  // methods
  async downloadLogs() {
    this.logger.info(`SupportSubTab::downloadLogs is called.`);
    await this.click(this.downloadLogsButtonLocator);
    await this.sleep(oneSecond);
  }
}

export default SupportSubTab;
