const manageTranslations = require('react-intl-translations-manager').default;

function disableWhitelistFile(langResults) {
  // we hijack this hook to modify an otherwise unrelated property
  // this causes a downstream function that writes whitelists to write to dev/null
  // kind of hacky but this suprpesses generation of pointless whitelist files

  // TBD: does this work on Windows? Maybe there is a more platform-independent way to do this
  langResults.whitelistFilepath = "/dev/null";
  return undefined;
}

manageTranslations({
  messagesDirectory: 'translations/messages',
  translationsDirectory: 'app/i18n/locales',
  singleMessagesFile: true,
  languages: ['en-US', 'zh-Hans', 'zh-Hant', 'ko-KR', 'ja-JP'],
  overrideCoreMethods: {
    provideWhitelistFile: (langResults) => { disableWhitelistFile(langResults); }
  }
});
