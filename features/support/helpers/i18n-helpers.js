const DEFAULT_LANGUAGE = 'en-US';

export default {
  setActiveLanguage: async (client, { language } = {}) =>
    await client.executeScript(locale => {
      icarus.actions.profile.updateLocale.trigger({ locale });
    }, language || DEFAULT_LANGUAGE),

  getActiveLanguage: async client =>
    await client.executeScript(() => icarus.stores.profile.currentLocale)
};
