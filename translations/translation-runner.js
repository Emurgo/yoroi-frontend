const manageTranslations = require('react-intl-translations-manager').default;

manageTranslations({
  messagesDirectory: 'translations/messages',
  translationsDirectory: 'app/i18n/locales',
  singleMessagesFile: true,
  languages: ['en-US', 'zh-Hans', 'zh-Hant', 'ko-KR', 'ja-JP']
});
