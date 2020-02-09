// @flow

// $FlowFixMe no types for this library
const manageTranslations = require('react-intl-translations-manager').default;

const fs = require('fs');

const messagesDirectory = 'translations/messages';
if (!fs.existsSync(messagesDirectory)) {
  console.log('Run `npm run build` once to build your translation cache');
  throw new Error();
}

function disableWhitelistFile(langResults) {
  // we hijack this hook to modify an otherwise unrelated property
  // this causes a downstream function that writes whitelists to write to dev/null
  // kind of hacky but this suppresses generation of pointless whitelist files

  // TBD: does this work on Windows? Maybe there is a more platform-independent way to do this
  langResults.whitelistFilepath = '/dev/null';
  return undefined;
}

manageTranslations({
  messagesDirectory,
  translationsDirectory: 'app/i18n/locales',
  singleMessagesFile: true,
  languages: ['en-US'],
  overrideCoreMethods: {
    provideWhitelistFile: (langResults) => { disableWhitelistFile(langResults); },
    outputSingleFile: (_combinedFiles) => { /* do nothing to suppress defaultMessages.json */ }
  }
});
