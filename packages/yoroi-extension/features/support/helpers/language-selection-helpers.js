// @flow

import i18n from './i18n-helpers';
import { By } from 'selenium-webdriver';
import { languageSelectionForm } from '../../pages/basicSetupPage';

const LANGUAGE_SELECTION_FORM = '.LanguageSelectionForm_component';

const languageSelection = {
  waitForVisible: async (
    client: any,
    { isHidden }: {| isHidden: boolean, |} = {}
  ): Promise<void> => {
    if (isHidden) {
      return client.waitForElementNotPresent(languageSelectionForm);
    }
    return client.waitForElement(languageSelectionForm);
  },
  ensureLanguageIsSelected: async (
    client: any,
    { language }: {| language: string, |} = {}
  ): Promise<void> => {
    await languageSelection.waitForVisible(client.driver);
    await i18n.setActiveLanguage(client.driver, { language });
    await clickContinue(client);
    await languageSelection.waitForVisible(client.driver, { isHidden: true });
  }
};

export const clickContinue = async (world: Object) => {
  const parentComponent = await world.driver.findElement(By.css(LANGUAGE_SELECTION_FORM));
  const continueButton = await parentComponent.findElement(By.xpath('//button'));
  await continueButton.click();
}

export default languageSelection;
