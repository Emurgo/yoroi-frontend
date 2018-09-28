import { IntlProvider } from 'react-intl';

const DEFAULT_LANGUAGE = 'en-US';

export default {
  setActiveLanguage: async (client, { language } = {}) =>
    await client.executeScript(locale => {
      yoroi.actions.profile.updateLocale.trigger({ locale });
    }, language || DEFAULT_LANGUAGE),

  getActiveLanguage: async client =>
    await client.executeScript(() => yoroi.stores.profile.currentLocale),

  formatMessage: async (client, { id, values }) => {
    const [locale, messages] = await client.executeScript(() =>
      [yoroi.stores.profile.currentLocale, yoroi.translations]
    );
    const intlProvider = new IntlProvider({ locale, messages: messages[locale] }, {});
    const translation = intlProvider.getChildContext()
        .intl.formatMessage({ id }, values || {});
    return translation;
  }
};
