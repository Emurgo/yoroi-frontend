// @flow

import i18n from './i18n-helpers';
import {
  languageSelectionForm,
  confirmSelectedLanguageButton
} from '../../pages/basicSetupPage';

export const waitForVisibleLanguageSelection = async (
  customWorld: any,
  { isHidden }: {| isHidden?: boolean, |} = {}
): Promise<void> => {
  if (isHidden) {
    return customWorld.waitForElementNotPresent(languageSelectionForm);
  }
  return customWorld.waitForElement(languageSelectionForm);
};

export const ensureLanguageIsSelected = async (
  customWorld: any,
  { language }: {| language: string, |}
): Promise<void> => {
  await waitForVisibleLanguageSelection(customWorld);
  await i18n.setActiveLanguage(customWorld.driver, { language });
  await customWorld.click(confirmSelectedLanguageButton);
  await waitForVisibleLanguageSelection(customWorld, { isHidden: true });
};
