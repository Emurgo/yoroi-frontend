// @flow
import { defineMessages } from 'react-intl';

/*
 * Some messages need to be used in multiple components
 * In order to avoid componenets depending on each other just to resuse translation messages
 * We instead store the shared messages in this file
*/

const globalMessages = defineMessages({
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
  errorLabel: {
    id: 'global.labels.error',
    defaultMessage: '!!!Error',
  },
  processingLabel: {
    id: 'global.labels.processing',
    defaultMessage: '!!!Processing...',
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
  continue: {
    id: 'global.labels.continue',
    defaultMessage: '!!!Continue',
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
  learnMore: {
    id: 'global.labels.LearnMore',
    defaultMessage: '!!!Learn more',
  },
  languageEnglish: {
    id: 'global.language.english',
    defaultMessage: '!!!English',
  },
  languageJapanese: {
    id: 'global.language.japanese',
    defaultMessage: '!!!日本語',
  },
  languageRussian: {
    id: 'global.language.russian',
    defaultMessage: '!!!Pусский',
  },
  languageChineseSimplified: {
    id: 'global.language.chinese.simplified',
    defaultMessage: '!!!简体中文',
  },
  languageChineseTraditional: {
    id: 'global.language.chinese.traditional',
    defaultMessage: '!!!繁體中文',
  },
  languageKorean: {
    id: 'global.language.korean',
    defaultMessage: '!!!한국어',
  },
  languageGerman: {
    id: 'global.language.german',
    defaultMessage: '!!!Deutsch',
  },
  languageFrench: {
    id: 'global.language.french',
    defaultMessage: '!!!Français',
  },
  languageIndonesian: {
    id: 'global.language.indonesian',
    defaultMessage: '!!!Bahasa Indonesia',
  },
  languageSpanish: {
    id: 'global.language.spanish',
    defaultMessage: '!!!Español',
  },
  languageItalian: {
    id: 'global.language.italian',
    defaultMessage: '!!!Italiano',
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
  languageSelectLabel: {
    id: 'profile.languageSelect.form.languageSelectLabel',
    defaultMessage: '!!!Select your language',
  },
  languageSelectLabelInfo: {
    id: 'settings.general.languageSelect.labelInfo',
    defaultMessage: '!!!Language Label Info',
  },
  languageSelectInfo: {
    id: 'settings.general.languageSelect.info',
    defaultMessage: '!!!Language Info',
  },
  translationAcknowledgment: {
    id: 'settings.general.translation.acknowledgment',
    defaultMessage: '!!!Thanks to the following',
  },
  translationContributors: {
    id: 'settings.general.translation.contributors',
    // empty string can't be translated in CrowdIn so we use underscore instead
    defaultMessage: '_',
  },
  passwordInstructionsPaperWallet: {
    id: 'global.passwordInstructionsPaperWallet',
    defaultMessage: '!!!Note: Paper Wallet password needs to be at least 10 characters long.',
  },
  paperPasswordLabel: {
    id: 'wallet.restore.dialog.paperPasswordLabel',
    defaultMessage: '!!!Paper wallet password',
  },
  shortRecoveryPhrase: {
    id: 'wallet.restore.dialog.form.errors.shortRecoveryPhrase',
    defaultMessage: '!!!Short recovery phrase',
  },
  goBack: {
    id: 'global.labels.goBack',
    defaultMessage: '!!!Go back label',
  },
  allowLabel: {
    id: 'global.label.allow',
    defaultMessage: '!!!Allow',
  },
  supportRequestLinkUrl: {
    id: 'settings.support.faq.supportRequestLinkURL',
    defaultMessage: '!!!https://yoroi-wallet.com/support/',
  },
  contactSupport: {
    id: 'global.contact',
    defaultMessage: '!!!contact support',
  },
  staleTxnWarningLine1: {
    id: 'global.staleTxnWarningLine1',
    defaultMessage: '!!!Your wallet has changed since you created this transaction.',
  },
  staleTxnWarningLine2: {
    id: 'global.staleTxnWarningLine2',
    defaultMessage: '!!!You can still send this transaction but it may fail.',
  },
  logsContent: {
    id: 'settings.support.logs.content',
    defaultMessage: '!!!If you want to inspect logs, you can {downloadLogsLink}. Logs do not contain sensitive information, and it would be helpful to attach them to problem reports to help the team investigate the issue you are experiencing. Logs can be attached automatically when using the bug reporting feature.',
  },
  downloadLogsLink: {
    id: 'settings.support.logs.downloadLogsLink',
    defaultMessage: '!!!download them here',
  },
  downloadLogsButtonLabel: {
    id: 'settings.support.logs.downloadLogsButtonLabel',
    defaultMessage: '!!!Download Logs',
  },
  blockchainExplorer: {
    id: 'settings.general.explorer',
    defaultMessage: '!!!Blockchain Explorer',
  },
  newPasswordLabel: {
    id: 'wallet.settings.changePassword.dialog.newPasswordLabel',
    defaultMessage: '!!!New spending password',
  },
  newPasswordFieldPlaceholder: {
    id: 'wallet.settings.changePassword.dialog.newPasswordFieldPlaceholder',
    defaultMessage: '!!!Type new spending password',
  },
  repeatPasswordLabel: {
    id: 'wallet.settings.changePassword.dialog.repeatPasswordLabel',
    defaultMessage: '!!!Repeat new spending password',
  },
  repeatPasswordFieldPlaceholder: {
    id: 'wallet.settings.changePassword.dialog.repeatPasswordFieldPlaceholder',
    defaultMessage: '!!!Type new spending password',
  },
  uriSchemeLabel: {
    id: 'global.uriSchemeTitleLabel',
    defaultMessage: '!!!Cardano Payment URLs',
  },
  uriExplanation: {
    id: 'global.uriExplanation',
    defaultMessage: '!!!These allow you to easily share invoices with friends and businesses by simply clicking a URL.',
  },
  copyTooltipMessage: {
    id: 'global.copyTooltipMessage',
    defaultMessage: '!!!Copied',
  },
  transferInstructionsText: {
    id: 'transfer.instructions.instructions.text',
    defaultMessage: '!!!Before you can transfer funds, you must create a Yoroi wallet and back it up. Upon completion, you will receive a 15-word recovery phrase which can be used to restore your Yoroi wallet at any time.',
  },
  transferInstructionsButton: {
    id: 'transfer.instructions.instructions.button.label',
    defaultMessage: '!!!Create Yoroi wallet',
  },
  attentionTitle: {
    id: 'transfer.instructions.attention.title.label',
    defaultMessage: '!!!Attention',
  },
  transferTitleText: {
    id: 'daedalusTransfer.instructions.attention.title',
    defaultMessage: '!!!Transfer all funds from'
  },
  passwordDisclaimer: {
    id: 'wallet.restore.dialog.passwordDisclaimer',
    defaultMessage: '!!!Typing the wrong wallet password will give you a different wallet. This allows for plausible deniability.',
  },
  recoveryPhraseInputLabel: {
    id: 'wallet.restore.dialog.recovery.phrase.input.label',
    defaultMessage: '!!!Recovery phrase',
  },
  recoveryPhraseInputHint: {
    id: 'wallet.restore.dialog.recovery.phrase.input.hint',
    defaultMessage: '!!!Enter recovery phrase',
  },
  recoveryPhraseNoResults: {
    id: 'wallet.restore.dialog.recovery.phrase.input.noResults',
    defaultMessage: '!!!No results',
  },
  invalidRecoveryPhrase: {
    id: 'wallet.restore.dialog.form.errors.invalidRecoveryPhrase',
    defaultMessage: '!!!Invalid recovery phrase',
  },
  skipLabel: {
    id: 'profile.uriPrompt.form.skipLabel',
    defaultMessage: '!!!Skip',
  },
  checkLabel: {
    id: 'wallet.connect.hw.dialog.step.about.label',
    defaultMessage: '!!!CHECK',
  },
  walletUpgrade: {
    id: 'wallet.backup.dialog.legacy.upgrade',
    defaultMessage: `!!!Wallet Upgrade`
  },
  pdfGenDone: {
    id: 'settings.paperWallet.dialog.createPaper.done',
    defaultMessage: '!!!All done!',
  },
  legacyAttentionText: {
    id: 'transfer.instructions.attention.legacy',
    defaultMessage: '!!!Legacy wallets created during the Byron-era (before November 29th, 2019) can no longer be used. However, you can transfer your legacy funds to your current wallet to access your funds.',
  },
  uriLandingDialogConfirmLabel: {
    id: 'uri.landing.dialog.confirm.label',
    defaultMessage: '!!!I understand',
  },
  hardwareTransferInstructions: {
    id: 'transfer.instructions.hardware.disclaimer.instructions1',
    defaultMessage: '',
    // eslint-disable-next-line max-len
    // defaultMessage: '!!!When you originally setup your hardware wallet, you were asked to write down a recovery phrase on a piece of paper. Entering this phrase will allow you to transfer your funds out of your hardware wallet and into the current wallet.',
  },
  sendButtonLabel: {
    id: 'wallet.send.confirmationDialog.submit',
    defaultMessage: '!!!Send',
  },
  walletPasswordLabel: {
    id: 'wallet.send.confirmationDialog.walletPasswordLabel',
    defaultMessage: '!!!Spending password',
  },
  walletPasswordFieldPlaceholder: {
    id: 'wallet.send.confirmationDialog.walletPasswordFieldPlaceholder',
    defaultMessage: '!!!Type your spending password',
  },
});
export default globalMessages;

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

export function listOfTranslators(
  contributorsList: string,
  contributorsAck: string,
): string {
  let output = '';
  // append name of contributors only if the message is not empty
  if (contributorsList !== globalMessages.translationContributors.defaultMessage) {
    output = contributorsAck + contributorsList;
  }
  return output;
}
