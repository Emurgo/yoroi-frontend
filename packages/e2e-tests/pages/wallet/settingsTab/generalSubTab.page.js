import SettingsTab from './settingsTab.page.js';

class GeneralSubTab extends SettingsTab {
  // locators
  // * language dropdown
  languagesDropDownLocator = {
    locator: '//div[starts-with(@id, "languageId--")]',
    method: 'xpath',
  };
  getLanguageMenuItem = countryCode => {
    return {
      locator: `selectLanguage-${countryCode}-menuItem`,
      method: 'id',
    };
  };
  // * fiat pairing dropdown
  fiatDropDownLocator = {
    locator: '//div[starts-with(@id, "coinPriceCurrencyId--")]',
    method: 'xpath',
  };
  getFiatMenuItem = fiatCode => {
    return {
      locator: `selectFiat-${fiatCode}-menuItem`,
      method: 'id',
    };
  };
  // * network text
  networkInfoTextLocator = {
    locator: 'settings:general-networkInfo-text',
    method: 'id',
  };
  // * current version text
  versionInfoTextLocator = {
    locator: 'settings:general-versionInfo-text',
    method: 'id',
  };
  // * commit text
  commitInfoTextLocator = {
    locator: 'settings:general-commitInfo-text',
    method: 'id',
  };
  // * links
  twitterLinkLocator = {
    locator: 'settings:general-twitterLink-linkButton',
    method: 'id',
  };
  yoroiWebsiteLinkLocator = {
    locator: 'settings:general-yoroiWebsiteLink-linkButton',
    method: 'id',
  };
  facebookLinkLocator = {
    locator: 'settings:general-facebookLink-linkButton',
    method: 'id',
  };
  youtubeLinkLocator = {
    locator: 'settings:general-youtubeLink-linkButton',
    method: 'id',
  };
  telegramLinkLocator = {
    locator: 'settings:general-telegramLink-linkButton',
    method: 'id',
  };
  mediumLinkLocator = {
    locator: 'settings:general-mediumLink-linkButton',
    method: 'id',
  };
  githubLinkLocator = {
    locator: 'settings:general-githubLink-linkButton',
    method: 'id',
  };
  // methods
  async openLanguageSelection() {
    this.logger.info(`GeneralSubTab::openLanguageSelection is called`);
    await this.waitForElement(this.languagesDropDownLocator);
    await this.click(this.languagesDropDownLocator);
  }
  async pickLanguage(countryCode) {
    this.logger.info(`GeneralSubTab::pickLanguage is called. Country code: "${countryCode}"`);
    const langLocator = this.getLanguageMenuItem(countryCode);
    await this.scrollIntoView(langLocator);
    await this.click(langLocator);
  }
  async selectLanguage(countryCode) {
    this.logger.info(`GeneralSubTab::selectLanguage is called. Country code: "${countryCode}"`);
    await this.openLanguageSelection();
    await this.pickLanguage(countryCode);
    await this.sleep(200);
  }
  async openFiatSelection() {
    this.logger.info(`GeneralSubTab::openFiatSelection is called`);
    await this.waitForElement(this.fiatDropDownLocator);
    await this.click(this.fiatDropDownLocator);
  }
  async pickFiat(fiatCode) {
    this.logger.info(`GeneralSubTab::pickFiat is called. Country code: "${fiatCode}"`);
    const fiatLocator = this.getFiatMenuItem(fiatCode);
    await this.scrollIntoView(fiatLocator);
    await this.click(fiatLocator);
  }
  async selectFiat(fiatCode) {
    this.logger.info(`GeneralSubTab::selectFiat is called. Country code: "${fiatCode}"`);
    await this.openFiatSelection();
    await this.pickFiat(fiatCode);
    await this.sleep(200);
  }
  async getNetworkText() {
    this.logger.info(`GeneralSubTab::getNetworkText is called`);
    const result = await this.getText(this.networkInfoTextLocator);
    this.logger.info(`GeneralSubTab::getNetworkText::result ${result}`);
    return result;
  }
  async getCurrentVersionText() {
    this.logger.info(`GeneralSubTab::getCurrentVersionText is called`);
    const result = await this.getText(this.versionInfoTextLocator);
    this.logger.info(`GeneralSubTab::getCurrentVersionText::result ${result}`);
    return result;
  }
  async getCommitText() {
    this.logger.info(`GeneralSubTab::getCommitText is called`);
    const result = await this.getText(this.commitInfoTextLocator);
    this.logger.info(`GeneralSubTab::getCommitText::result ${result}`);
    return result;
  }
  async getTwitterLink() {
    this.logger.info(`GeneralSubTab::getTwitterLink is called`);
    const result = await this.getLinkFromComponent(this.twitterLinkLocator);
    this.logger.info(`GeneralSubTab::getTwitterLink::result ${result}`);
    return result;
  }
  async getYoroiWebsiteLink() {
    this.logger.info(`GeneralSubTab::getYoroiWebsiteLink is called`);
    const result = await this.getLinkFromComponent(this.yoroiWebsiteLinkLocator);
    this.logger.info(`GeneralSubTab::getYoroiWebsiteLink::result ${result}`);
    return result;
  }
  async getFacebookLink() {
    this.logger.info(`GeneralSubTab::getFacebookLink is called`);
    const result = await this.getLinkFromComponent(this.facebookLinkLocator);
    this.logger.info(`GeneralSubTab::getFacebookLink::result ${result}`);
    return result;
  }
  async getYoutubeLink() {
    this.logger.info(`GeneralSubTab::getYoutubeLink is called`);
    const result = await this.getLinkFromComponent(this.youtubeLinkLocator);
    this.logger.info(`GeneralSubTab::getYoutubeLink::result ${result}`);
    return result;
  }
  async getTGLink() {
    this.logger.info(`GeneralSubTab::getTGLink is called`);
    const result = await this.getLinkFromComponent(this.telegramLinkLocator);
    this.logger.info(`GeneralSubTab::getTGLink::result ${result}`);
    return result;
  }
  async getMediumLink() {
    this.logger.info(`GeneralSubTab::getMediumLink is called`);
    const result = await this.getLinkFromComponent(this.mediumLinkLocator);
    this.logger.info(`GeneralSubTab::getMediumLink::result ${result}`);
    return result;
  }
  async getGithubLink() {
    this.logger.info(`GeneralSubTab::getGithubLink is called`);
    const result = await this.getLinkFromComponent(this.githubLinkLocator);
    this.logger.info(`GeneralSubTab::getGithubLink::result ${result}`);
    return result;
  }
}

export default GeneralSubTab;
