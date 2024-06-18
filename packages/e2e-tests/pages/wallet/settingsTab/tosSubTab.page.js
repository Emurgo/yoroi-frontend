import SettingsTab from './settingsTab.page.js';

class TermOfServiceAgreementSubTab extends SettingsTab {
  // locator
  tosTitle = {
    locator: 'terms-of-service-agreement',
    method: 'id',
  };
  tosHeaders = {
    locator: '//span/h2',
    method: 'xpath',
  };
  tosParagraphs = {
    locator: '//span/p',
    method: 'xpath',
  };
  // methods
  async titleIsDisplayed() {
    this.logger.info(`TermOfServiceAgreementSubTab::titleIsDisplayed is called`);
    const titleElem = await this.findElement(this.tosTitle);
    return await titleElem.isDisplayed();
  }
  async getAmountOfH2() {
    this.logger.info(`TermOfServiceAgreementSubTab::getAmountOfH2 is called`);
    const allH2Elems = await this.findElements(this.tosHeaders);
    return allH2Elems.length;
  }
  async allParagraphsNotEmpty() {
    this.logger.info(`TermOfServiceAgreementSubTab::allParagraphsNotEmpty is called`);
    const allParagraphsElems = await this.findElements(this.tosParagraphs);
    for (const pElem of allParagraphsElems) {
      const pText = await pElem.getText();
      if (pText === '') {
        return false;
      }
    }
    return true;
  }
  async getAmountOfParagraphs() {
    this.logger.info(`TermOfServiceAgreementSubTab::getAmountofParagraphs is called`);
    const allParagraphsElems = await this.findElements(this.tosParagraphs);
    return allParagraphsElems.length;
  }
}

export default TermOfServiceAgreementSubTab;
