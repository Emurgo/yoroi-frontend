const manageTranslations = require('react-intl-translations-manager');

function disableWhitelistFile(langResults) {
  // we hijack this hook to modify an otherwise unrelated property
  // this causes a downstream function that writes whitelists to write to dev/null
  // kind of hacky but this suprpesses generation of pointless whitelist files
  langResults.whitelistFilepath = "/dev/null";
  return undefined;
}

manageTranslations.default({
  messagesDirectory: 'translations/messages',
  translationsDirectory: 'app/i18n/locales',
  singleMessagesFile: true,
  languages: ['en-US', 'zh-Hans', 'zh-Hant', 'ko-KR', 'ja-JP'],
  overrideCoreMethods: {
    provideWhitelistFile: (langResults) => { disableWhitelistFile(langResults); }
  }
});
