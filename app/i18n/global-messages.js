import { defineMessages } from 'react-intl';

// Some messages need to be used in multiple components
// In order to avoid componenets depending on each other just to resuse translation messages
// We instead store the shared messages in this file 

export default defineMessages({
  fieldIsRequired: {
    id: 'global.errors.fieldIsRequired',
    defaultMessage: '!!!This field is required.',
    description: 'Error message when required fields are left empty.'
  },
  invalidWalletName: {
    id: 'global.errors.invalidWalletName',
    defaultMessage: '!!!Wallet name requires at least 3 and at most 40 letters.',
    description: 'Error message shown when invalid wallet name was entered in create wallet dialog.'
  },
  invalidWalletPassword: {
    id: 'global.errors.invalidWalletPassword',
    defaultMessage: '!!!Invalid password',
    description: 'Error message shown when invalid wallet password was entered in create wallet dialog.'
  },
  invalidRepeatPassword: {
    id: 'global.errors.invalidRepeatPassword',
    defaultMessage: '!!!Doesn\'t match.',
    description: 'Error message shown when wallet password and repeat passwords don\'t match in create wallet dialog.'
  },
  passwordInstructions: {
    id: 'global.passwordInstructions',
    defaultMessage: '!!!Note that password needs to be at least 7 characters long, and have at least 1 uppercase, 1 lowercase letter and 1 number.',
    description: 'Password instructions note.',
  },
  cancel: {
    id: 'global.labels.cancel',
    defaultMessage: '!!!Cancel',
    description: 'The word "cancel" reused at several places (like cancel buttons)',
  },
  change: {
    id: 'global.labels.change',
    defaultMessage: '!!!Change',
    description: 'The word "change" reused at several places (like change buttons)',
  },
  create: {
    id: 'global.labels.create',
    defaultMessage: '!!!Create',
    description: 'The word "create" reused at several places (like create buttons)',
  },
  remove: {
    id: 'global.labels.remove',
    defaultMessage: '!!!Remove',
    description: 'The word "remove" reused at several places (like remove buttons)',
  },
  save: {
    id: 'global.labels.save',
    defaultMessage: '!!!Save',
    description: 'The word "save" reused at several places (like save buttons)',
  },
  languageEnglish: {
    id: 'global.language.english',
    defaultMessage: '!!!English',
    description: 'Language name for "English" language.'
  },
  languageJapanese: {
    id: 'global.language.japanese',
    defaultMessage: '!!!Japanese',
    description: 'Language name for "Japanese" language.'
  },
  languageChineseSimplified: {
    id: 'global.language.chinese.simplified',
    defaultMessage: '!!!Chinese Simplified',
    description: 'Language name for "Simplified Chinese" language.'
  },
  languageChineseTraditional: {
    id: 'global.language.chinese.traditional',
    defaultMessage: '!!!Chinese Traditional',
    description: 'Language name for "Traditional Chinese" language.'
  },
  languageKorean: {
    id: 'global.language.korean',
    defaultMessage: '!!!Korean',
    description: 'Language name for "Korean" language.'
  },
  languageGerman: {
    id: 'global.language.german',
    defaultMessage: '!!!German',
    description: 'Language name for "German" language.'
  },
  languageCroatian: {
    id: 'global.language.croatian',
    defaultMessage: '!!!Croatian',
    description: 'Language name for "Croatian" language.'
  },
  unitAda: {
    id: 'global.unit.ada',
    defaultMessage: '!!!Ada',
    description: 'Name for "Ada" unit.'
  },
  recoveryPhraseDialogTitle: {
    id: 'wallet.backup.recovery.phrase.dialog.title',
    defaultMessage: '!!!Recovery phrase',
    description: 'Title for the "Recovery Phrase" dialog.'
  },
  faqLinkUrl: {
    id: 'settings.support.faq.faqLinkURL',
    defaultMessage: '!!!https://yoroi-wallet.com/faq/',
    description: 'URL for the "FAQ on Yoroi website"',
  }
});

export const environmentSpecificMessages = {
  ada: defineMessages({
    currency: {
      id: 'environment.currency.ada',
      defaultMessage: '!!!Ada',
      description: 'Name for "Ada" unit.'
    },
    apiName: {
      id: 'environment.apiName.cardano',
      defaultMessage: '!!!Cardano',
      description: 'Name for "Cardano" client.'
    },
    apiVersion: {
      id: 'environment.apiVersion.cardano',
      defaultMessage: '!!!1.0.4',
      description: 'Version of "Cardano" client.'
    },
  }),
};
