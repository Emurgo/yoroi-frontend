// @flow

import { IntlProvider } from 'react-intl';

const DEFAULT_LANGUAGE = 'en-US';

declare var yoroi;

export default {
  setActiveLanguage: async (
    client: any,
    { language }: {| language: string,  |} = {}
  ): Promise<void> => (
    await client.executeScript(locale => {
      yoroi.actions.profile.updateTentativeLocale.trigger({ locale });
    }, language || DEFAULT_LANGUAGE)
  ),

  getActiveLanguage: async (
    client: any
  ): Promise<void> => (
    await client.executeScript(() => yoroi.stores.profile.currentLocale)
  ),

  formatMessage: async (
    client: any,
    { id, values }: any
  ): Promise<string> => {
    const [locale, messages] = await client.executeScript(() => (
      [yoroi.stores.profile.currentLocale, yoroi.translations]
    ));
    const intlProvider = new IntlProvider({ locale, messages: messages[locale] }, {});
    const translation = intlProvider.getChildContext()
      .intl.formatMessage({ id }, values || {});
    return translation;
  }
};
