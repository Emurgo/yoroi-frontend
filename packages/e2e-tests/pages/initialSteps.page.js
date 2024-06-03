import BasePage from './basepage.js';
import { isChrome } from '../utils/utils.js';
import {
  defaultWaitTimeout,
  oneSecond,
  quarterSecond,
  twoSeconds,
} from '../helpers/timeConstants.js';

class InitialStepsPage extends BasePage {
  // locators
  languagesDropDownLocator = {
    locator: '//div[starts-with(@id, "languageId--")]',
    method: 'xpath',
  };
  agreeCheckboxLocator = {
    locator: '.PrivateSwitchBase-root',
    method: 'css',
  };
  tosContinueButtonLocator = {
    locator: 'initialPage-continue-button',
    method: 'id',
  };
  analyticsSkipButtonLocator = {
    locator: '//div[@class="OptForAnalyticsForm_skip"]/button',
    method: 'xpath',
  };
  analyticsAcceptButtonLocator = {
    locator: '//div[@class="OptForAnalyticsForm_accpet"]/button',
    method: 'xpath',
  };
  cardanoUrlPromptFormLocator = {
    locator: '.UriPromptForm_component',
    method: 'css',
  };
  cardanoPaymentUrlAllowButtonLocator = {
    locator: '.allowButton',
    method: 'css',
  };
  cardanoPaymentUrlSkipButtonLocator = {
    locator: '.MuiButton-secondary',
    method: 'css',
  };
  getLanguageMenuItem = countryCode => {
    return {
      locator: `selectLanguage-${countryCode}-menuItem`,
      method: 'id',
    };
  };
  // methods
  async _continueButtonIsEnabled() {
    const buttonIsEnabled = await this.customWaiter(
      async () => {
        const buttonlIsEnabled = await this.getAttribute(this.tosContinueButtonLocator, 'disabled');
        return buttonlIsEnabled === null;
      },
      twoSeconds,
      quarterSecond
    );

    return buttonIsEnabled;
  }
  async openLanguageSelection() {
    this.logger.info(`InitialStepsPage::openLanguageSelection is called`);
    await this.waitForElement(this.languagesDropDownLocator);
    await this.click(this.languagesDropDownLocator);
  }
  async pickLanguage(countryCode) {
    this.logger.info(`InitialStepsPage::pickLanguage is called. Country code: "${countryCode}"`);
    const langLocator = this.getLanguageMenuItem(countryCode);
    await this.scrollIntoView(langLocator);
    await this.click(langLocator);
  }
  async selectLanguage(countryCode) {
    this.logger.info(`InitialStepsPage::selectLanguage is called. Country code: "${countryCode}"`);
    await this.openLanguageSelection();
    await this.pickLanguage(countryCode);
  }
  async acceptToSPP() {
    this.logger.info(`InitialStepsPage::acceptToSPP is called`);
    await this.waitForElement(this.languagesDropDownLocator);
    await this.waitForElement(this.agreeCheckboxLocator);
    await this.click(this.agreeCheckboxLocator);
    await this.waitEnable(this.tosContinueButtonLocator);
    await this.click(this.tosContinueButtonLocator);
  }
  async cantProceedWithoutToS() {
    this.logger.info(`InitialStepsPage::cantProceedWithoutToS is called`);
    await this.waitForElement(this.languagesDropDownLocator);
    await this.waitForElement(this.agreeCheckboxLocator);
    await this.click(this.agreeCheckboxLocator);
    await this.waitEnable(this.tosContinueButtonLocator);
    await this.click(this.agreeCheckboxLocator);
    return !(await this._continueButtonIsEnabled());
  }
  async getContinueButtonText() {
    this.logger.info(`InitialStepsPage::getContinueButtonText is called`);
    const btnText = await this.getText(this.tosContinueButtonLocator);
    this.logger.info(`InitialStepsPage::getContinueButtonText::btnText is "${btnText}"`);
    return btnText;
  }
  async acceptAnalytics() {
    this.logger.info(`InitialStepsPage::acceptAnalytics is called`);
    await this.waitForElement(this.analyticsAcceptButtonLocator);
    await this.click(this.analyticsAcceptButtonLocator);
  }
  async skipAnalytics() {
    this.logger.info(`InitialStepsPage::skipAnalytics is called`);
    await this.waitForElement(this.analyticsSkipButtonLocator);
    await this.click(this.analyticsSkipButtonLocator);
  }
  async allowCardanoPaymentsUrls() {
    this.logger.info(`InitialStepsPage::allowCardanoPaymentsUrls is called`);
    await this.waitForElement(this.cardanoUrlPromptFormLocator);
    await this.click(this.cardanoPaymentUrlAllowButtonLocator);
  }
  async skipCardanoPaymentUrls() {
    this.logger.info(`InitialStepsPage::skipCardanoPaymentUrls is called`);
    await this.waitForElement(this.cardanoUrlPromptFormLocator);
    await this.click(this.cardanoPaymentUrlSkipButtonLocator);
  }
  async skipInitialSteps() {
    this.logger.info(`InitialStepsPage::skipInitialSteps is called`);
    await this.driver.manage().setTimeouts({ implicit: oneSecond });
    await this.acceptToSPP();
    await this.skipAnalytics();
    if (isChrome()) {
      await this.skipCardanoPaymentUrls();
    }
    await this.driver.manage().setTimeouts({ implicit: defaultWaitTimeout });
  }
}

export default InitialStepsPage;
