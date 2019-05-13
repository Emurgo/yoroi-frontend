import { defineMessages } from 'react-intl';

/*
 * Some messages need to be used in multiple components
 * In order to avoid componenets depending on each other just to resuse translation messages
 * We instead store the shared messages in this file
*/

export default defineMessages({
  invalidMasterKey: {
    id: 'global.errors.invalidMasterKey',
    defaultMessage: '!!!Invalid master key entered, please check.',
  },
  fieldIsRequired: {
    id: 'global.errors.fieldIsRequired',
    defaultMessage: '!!!This field is required.',
  },
  invalidWalletName: {
    id: 'global.errors.invalidWalletName',
    defaultMessage: '!!!Wallet name requires at least 1 and at most 40 letters.',
  },
  invalidWalletPassword: {
    id: 'global.errors.invalidWalletPassword',
    defaultMessage: '!!!Invalid password',
  },
  invalidPaperPassword: {
    id: 'global.errors.invalidPaperPassword',
    defaultMessage: '!!!Invalid Paper Wallet password',
  },
  invalidRepeatPassword: {
    id: 'global.errors.invalidRepeatPassword',
    defaultMessage: '!!!Doesn\'t match.',
  },
  nextButtonLabel: {
    id: 'global.labels.next',
    defaultMessage: '!!!Next',
  },
  backButtonLabel: {
    id: 'global.labels.back',
    defaultMessage: '!!!Back',
  },
  instructionTitle: {
    id: 'transfer.instructions.instructions.title.label',
    defaultMessage: '!!!Instructions',
  },
  confirm: {
    id: 'global.labels.confirm',
    defaultMessage: '!!!Confirm',
  },
  finish: {
    id: 'global.labels.finish',
    defaultMessage: '!!!Finish',
  },
  cancel: {
    id: 'global.labels.cancel',
    defaultMessage: '!!!Cancel',
  },
  change: {
    id: 'global.labels.change',
    defaultMessage: '!!!Change',
  },
  create: {
    id: 'global.labels.create',
    defaultMessage: '!!!Create',
  },
  remove: {
    id: 'global.labels.remove',
    defaultMessage: '!!!Remove',
  },
  save: {
    id: 'global.labels.save',
    defaultMessage: '!!!Save',
  },
  languageEnglish: {
    id: 'global.language.english',
    defaultMessage: '!!!English',
  },
  languageJapanese: {
    id: 'global.language.japanese',
    defaultMessage: '!!!Japanese',
  },
  languageRussian: {
    id: 'global.language.russian',
    defaultMessage: '!!!Russian',
  },
  languageChineseSimplified: {
    id: 'global.language.chinese.simplified',
    defaultMessage: '!!!Chinese Simplified',
  },
  languageChineseTraditional: {
    id: 'global.language.chinese.traditional',
    defaultMessage: '!!!Chinese Traditional',
  },
  languageKorean: {
    id: 'global.language.korean',
    defaultMessage: '!!!Korean',
  },
  languageGerman: {
    id: 'global.language.german',
    defaultMessage: '!!!German',
  },
  languageFrench: {
    id: 'global.language.french',
    defaultMessage: '!!!French',
  },
  languageIndonesian: {
    id: 'global.language.indonesian',
    defaultMessage: '!!!Indonesian',
  },
  languageSpanish: {
    id: 'global.language.spanish',
    defaultMessage: '!!!Spanish',
  },
  unitAda: {
    id: 'global.unit.ada',
    defaultMessage: '!!!Ada',
  },
  recoveryPhraseDialogTitle: {
    id: 'wallet.backup.recovery.phrase.dialog.title',
    defaultMessage: '!!!Recovery phrase',
  },
  faqLinkUrl: {
    id: 'settings.support.faq.faqLinkURL',
    defaultMessage: '!!!https://yoroi-wallet.com/faq/',
  },
  walletSendConfirmationDialogTitle: {
    id: 'wallet.send.confirmationDialog.title',
    defaultMessage: '!!!Confirm transaction',
  },
  walletSendConfirmationAddressToLabel: {
    id: 'wallet.send.confirmationDialog.addressToLabel',
    defaultMessage: '!!!To',
  },
  walletSendConfirmationAmountLabel: {
    id: 'wallet.send.confirmationDialog.amountLabel',
    defaultMessage: '!!!Amount',
  },
  walletSendConfirmationFeesLabel: {
    id: 'wallet.send.confirmationDialog.feesLabel',
    defaultMessage: '!!!Fees',
  },
  walletSendConfirmationTotalLabel: {
    id: 'wallet.send.confirmationDialog.totalLabel',
    defaultMessage: '!!!Total',
  },
  hwConnectDialogConnectButtonLabel: {
    id: 'wallet.connect.hw.dialog.connect.button.label',
    defaultMessage: '!!!Connect',
  },
  hwConnectDialogSaveButtonLabel: {
    id: 'wallet.connect.hw.dialog.save.button.label',
    defaultMessage: '!!!Save',
  },
  hwConnectDialogAboutIntroTextLine1: {
    id: 'wallet.connect.hw.dialog.step.about.introText.line.1',
    defaultMessage: '!!!A hardware wallet is a small USB device that adds an extra level of security to your wallet.',
  },
  hwConnectDialogAboutIntroTextLine2: {
    id: 'wallet.connect.hw.dialog.step.about.introText.line.2',
    defaultMessage: '!!!It is more secure because your private key never leaves the hardware wallet.',
  },
  hwConnectDialogAboutIntroTextLine3: {
    id: 'wallet.connect.hw.dialog.step.about.introText.line.3',
    defaultMessage: '!!!Protects your funds when using a computer compromised with viruses, phishing attempts, malware and others.',
  },
  hwConnectDialogAboutPrerequisite4: {
    id: 'wallet.connect.hw.dialog.step.about.prerequisite.4',
    defaultMessage: '!!!Your computer must remain connected to the Internet throughout the process.',
  },
  hwConnectDialogAboutPrerequisiteHeader: {
    id: 'wallet.connect.hw.dialog.step.about.prerequisite.header',
    defaultMessage: '!!!Prerequisites',
  },
  hwConnectDialogConnectIntroTextLine3: {
    id: 'wallet.connect.hw.dialog.step.connect.introText.line.3',
    defaultMessage: '!!!This process shares the Cardano public key with Yoroi.',
  },
  hwConnectDialogSaveWalletNameInputLabel: {
    id: 'wallet.connect.hw.dialog.step.save.walletName.label',
    defaultMessage: '!!!Wallet name',
  },
  hwConnectDialogSaveWalletNameInputPH: {
    id: 'wallet.connect.hw.dialog.step.save.walletName.hint',
    defaultMessage: '!!!Enter wallet name',
  },
  ledgerConnectAllDialogTitle: {
    id: 'wallet.connect.ledger.dialog.title.label',
    defaultMessage: '!!!Connect to Ledger Hardware Wallet',
  },
  ledgerError101: {
    id: 'wallet.connect.ledger.error.101',
    defaultMessage: '!!!Failed to connect. Please check your ledger device and retry.',
  },
  trezorConnectAllDialogTitle: {
    id: 'wallet.connect.trezor.dialog.title.label',
    defaultMessage: '!!!Connect to Trezor Hardware Wallet',
  },
  trezorError101: {
    id: 'wallet.connect.trezor.error.101',
    defaultMessage: '!!!Failed to connect trezor.io. Please check your Internet connection and retry.',
  },
  hwError101: {
    id: 'wallet.hw.common.error.101',
    defaultMessage: '!!!Necessary permissions were not granted by the user. Please retry.',
  },
  trezorError103: {
    id: 'wallet.connect.trezor.error.103',
    defaultMessage: '!!!Cancelled. Please retry.',
  },
  hwConnectDialogSaveError101: {
    id: 'wallet.connect.hw.dialog.step.save.error.101',
    defaultMessage: '!!!Failed to save. Please check your Internet connection and retry.',
  },
  walletCreatedNotificationMessage: {
    id: 'wallet.summary.page.walletCreatedNotificationMessage',
    defaultMessage: '!!!You have successfully created a new Wallet',
  },
  walletRestoredNotificationMessage: {
    id: 'wallet.summary.page.walletRestoredNotificationMessage',
    defaultMessage: '!!!You have successfully restored your Wallet',
  },
  ledgerNanoSWalletIntegratedNotificationMessage: {
    id: 'wallet.summary.page.ledgerNanoSWalletIntegratedNotificationMessage',
    defaultMessage: '!!!You have successfully integrated with your Ledger Nano S device',
  },
  trezorTWalletIntegratedNotificationMessage: {
    id: 'wallet.summary.page.trezorTWalletIntegratedNotificationMessage',
    defaultMessage: '!!!You have successfully integrated with your Trezor Model T device',
  },
  noTransactionsFound: {
    id: 'wallet.summary.no.transaction',
    defaultMessage: '!!!No transactions found',
  },
  step1: {
    id: 'transfer.form.instructions.step1.text',
    defaultMessage: '!!!It will take about 1 minute to restore your balance. In the next step, you will be presented with a transaction that will move all of your funds. Please review the details of the transaction carefully. You will need to pay a standard transaction fee on the Cardano network to make the transaction.',
  },
  passwordInstructionsPaperWallet: {
    id: 'global.passwordInstructionsPaperWallet',
    defaultMessage: '!!!Note: Paper Wallet password needs to be at least 12 characters long.',
  },
});

export const environmentSpecificMessages = {
  ada: defineMessages({
    currency: {
      id: 'environment.currency.ada',
      defaultMessage: '!!!Ada',
    },
    apiName: {
      id: 'environment.apiName.cardano',
      defaultMessage: '!!!Cardano',
    },
    apiVersion: {
      id: 'environment.apiVersion.cardano',
      defaultMessage: '!!!1.0.4',
    },
  }),
};
