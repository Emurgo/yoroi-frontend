// @flow

import i18n from './i18n-helpers';

const LANGUAGE_SELECTION_FORM = '.LanguageSelectionForm_component';

const languageSelection = {
  waitForVisible: async (
    client: any,
    { isHidden }: {| isHidden: boolean, |} = {}
  ) => {
    if (isHidden) {
      return client.waitForElementNotPresent(LANGUAGE_SELECTION_FORM);
    }
    return client.waitForElement(LANGUAGE_SELECTION_FORM);
  },
  ensureLanguageIsSelected: async (
    client: any,
    { language }: {| language: string, |} = {}
  ) => {
    await languageSelection.waitForVisible(client.driver);
    await i18n.setActiveLanguage(client.driver, { language });
    client.click('.LanguageSelectionForm_submitButton');
    await languageSelection.waitForVisible(client.driver, { isHidden: true });
  }
};

export default languageSelection;
