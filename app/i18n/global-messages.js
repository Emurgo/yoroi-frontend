import { defineMessages } from 'react-intl';

/*
 * Some messages need to be used in multiple components
 * In order to avoid componenets depending on each other just to resuse translation messages
 * We instead store the shared messages in this file
*/

export default defineMessages({
  fieldIsRequired: {
    id: 'global.errors.fieldIsRequired',
    defaultMessage: '!!!This field is required.',
    description: 'Error message when required fields are left empty.'
  },
  invalidWalletName: {
    id: 'global.errors.invalidWalletName',
    defaultMessage: '!!!Wallet name requires at least 1 and at most 40 letters.',
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
    defaultMessage: '!!!Note: Password needs to be at least 12 characters long.',
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
  languageRussian: {
    id: 'global.language.russian',
    defaultMessage: '!!!Russian',
    description: 'Language name for "Russian" language.'
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
  languageFrench: {
    id: 'global.language.french',
    defaultMessage: '!!!French',
    description: 'Language name for "French" language.'
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
  },
  walletSendConfirmationDialogTitle: {
    id: 'wallet.send.confirmationDialog.title',
    defaultMessage: '!!!Confirm transaction',
    description: 'Title for the "Confirm transaction" dialog.'
  },
  walletSendConfirmationAddressToLabel: {
    id: 'wallet.send.confirmationDialog.addressToLabel',
    defaultMessage: '!!!To',
    description: 'Label for the "To" in the wallet send confirmation dialog.',
  },
  walletSendConfirmationAmountLabel: {
    id: 'wallet.send.confirmationDialog.amountLabel',
    defaultMessage: '!!!Amount',
    description: 'Label for the "Amount" in the wallet send confirmation dialog.',
  },
  walletSendConfirmationFeesLabel: {
    id: 'wallet.send.confirmationDialog.feesLabel',
    defaultMessage: '!!!Fees',
    description: 'Label for the "Fees" in the wallet send confirmation dialog.',
  },
  walletSendConfirmationTotalLabel: {
    id: 'wallet.send.confirmationDialog.totalLabel',
    defaultMessage: '!!!Total',
    description: 'Label for the "Total" in the wallet send confirmation dialog.',
  },
  walletSendConfirmationBackButtonLabel: {
    id: 'wallet.send.confirmationDialog.back',
    defaultMessage: '!!!Back',
    description: 'Label for the back button in the wallet send confirmation dialog.'
  },
  trezorConnectAllDialogTitle: {
    id: 'wallet.trezor.dialog.title.label',
    defaultMessage: '!!!Connect to Trezor Hardware Wallet',
    description: 'Label "Connect to Trezor Hardware Wallet" on the Connect to Trezor Hardware Wallet dialog.'
  },
  trezorError101: {
    id: 'wallet.trezor.error.101',
    defaultMessage: '!!!Failed to connect trezor.io. Please check your Internet connection and retry.',
    description: '<Failed to connect trezor.io. Please check your Internet connection and retry.>'
  },
  trezorError102: {
    id: 'wallet.trezor.error.102',
    defaultMessage: '!!!Necessary permissions were not granted by the user. Please retry.',
    description: '<Necessary permissions were not granted by the user. Please retry.>'
  },
  trezorError103: {
    id: 'wallet.trezor.error.103',
    defaultMessage: '!!!Cancelled. Please retry.',
    description: '<Cancelled. Please retry.>'
  },
  walletCreatedNotificationMessage: {
    id: 'wallet.summary.page.walletCreatedNotificationMessage',
    defaultMessage: '!!!You have successfully created a new Wallet',
    description: 'Notification Message for successful wallet creation.',
  },
  walletRestoredNotificationMessage: {
    id: 'wallet.summary.page.walletRestoredNotificationMessage',
    defaultMessage: '!!!You have successfully restored your Wallet',
    description: 'Notification Message for successful wallet restoration.',
  },
  trezorTWalletIntegratedNotificationMessage: {
    id: 'wallet.summary.page.trezorTWalletIntegratedNotificationMessage',
    defaultMessage: '!!!You have successfully integrated with your Trezor Model T device',
    description: 'Notification Message for successful integration with Trezor Model T device.',
  },
  noTransactionsFound: {
    id: 'wallet.summary.no.transaction',
    defaultMessage: '!!!No transactions found',
    description: 'Message shown when wallet transaction search returns zero results.'
  },
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
