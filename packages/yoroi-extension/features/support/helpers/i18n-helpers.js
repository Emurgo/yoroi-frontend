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
    const [locale, messages] = await client.executeAsyncScript((callback) => {
      // eslint-disable-next-line no-shadow
      const locale = yoroi.stores.profile.currentLocale;
      yoroi.translations[locale]
        .then(translations => callback([locale, { [locale]: translations }]))
        // eslint-disable-next-line no-console
        .catch(e => { console.error('Intl fail: ', e); });
    });
    const intlProvider = new IntlProvider({ locale, messages: messages[locale] }, {});
    return intlProvider.getChildContext()
      .intl.formatMessage({ id }, values || {});
  }
};
