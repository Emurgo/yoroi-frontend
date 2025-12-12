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
  async getFaqLink() {
    this.logger.info(`SupportSubTab::getFaqLink is called`);
    const linkElement = await this.findElement(this.faqLinkLocator);
    const result = await linkElement.getAttribute('href');
    this.logger.info(`SupportSubTab::getFaqLink::result ${result}`);
    return result;
  }
  async openFaqLink() {
    this.logger.info(`SupportSubTab::openFaqLink is called`);
    await this.click(this.faqLinkLocator);
  }
  async getRequestSupportLink() {
    this.logger.info(`SupportSubTab::getRequestSupportLink is called`);
    const linkElement = await this.findElement(this.requestSupportLinkLocator);
    const result = await linkElement.getAttribute('href');
    this.logger.info(`SupportSubTab::getRequestSupportLink::result ${result}`);
    return result;
  }
  async openRequestSupportLink() {
    this.logger.info(`SupportSubTab::openRequestSupportLink is called`);
    await this.click(this.requestSupportLinkLocator);
  }
}

export default SupportSubTab;
