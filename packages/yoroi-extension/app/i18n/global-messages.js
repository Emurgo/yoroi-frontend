// @flow
import { defineMessages } from 'react-intl';

/*
 * Some messages need to be used in multiple components
 * In order to avoid components depending on each other just to reuse translation messages
 * We instead store the shared messages in this file
*/

const globalMessages: * = defineMessages({
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
  current: {
    id: 'global.labels.current',
    defaultMessage: '!!!Current',
  },
  name: {
    id: 'global.labels.name',
    defaultMessage: '!!!Name',
  },
  amount: {
    id: 'global.labels.amount',
    defaultMessage: '!!!Amount',
  },
  id: {
    id: 'global.labels.id',
    defaultMessage: '!!!ID',
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
  delegateLabel: {
    id: 'global.labels.delegate',
    defaultMessage: '!!!Delegate',
  },
  create: {
    id: 'global.labels.create',
    defaultMessage: '!!!Create',
  },
  remove: {
    id: 'global.labels.remove',
    defaultMessage: '!!!Remove',
  },
  exportButtonLabel: {
    id: 'wallet.transaction.export.dialog.exportButton.label',
    defaultMessage: '!!!Export',
  },
  derivationPathLabel: {
    id: 'wallet.receive.confirmationDialog.derivationPathLabel',
    defaultMessage: '!!!Derivation Path',
  },
  publicKeyExplanation: {
    id: 'global.publicKey.explanation',
    defaultMessage: `!!!Public keys allow seeing the wallet history for the wallet, but does <strong>not</strong> allow to spend or move the funds in any way (private key is <strong>not</strong> included)`,
  },
  whyUse: {
    id: 'global.why',
    defaultMessage: `!!!This can be used to:`,
  },
  save: {
    id: 'global.labels.save',
    defaultMessage: '!!!Save',
  },
  learnMore: {
    id: 'global.labels.LearnMore',
    defaultMessage: '!!!Learn more',
  },
  walletLabel: {
    id: 'settings.menu.wallet.link.label',
    defaultMessage: '!!!Wallet',
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
  languagePortuguese: {
    id: 'global.language.portuguese',
    defaultMessage: '!!!Português',
  },
  languageDutch: {
    id: 'global.language.dutch',
    defaultMessage: '!!!Nederlands',
  },
  languageIndonesian: {
    id: 'global.language.indonesian',
    defaultMessage: '!!!Bahasa Indonesia',
  },
  languageTurkish: {
    id: 'global.language.turkish',
    defaultMessage: '!!!Turkish',
  },
  languageSpanish: {
    id: 'global.language.spanish',
    defaultMessage: '!!!Español',
  },
  languageItalian: {
    id: 'global.language.italian',
    defaultMessage: '!!!Italiano',
  },
  addressLabel: {
    id: 'wallet.receive.confirmationDialog.addressLabel',
    defaultMessage: '!!!Address',
  },
  addressesLabel: {
    id: 'wallet.receive.confirmationDialog.addressesLabel',
    defaultMessage: '!!!Addresses',
  },
  addWalletLabel: {
    id: 'wallet.nav.addButton',
    defaultMessage: '!!!Add new wallet',
  },
  attentionHeaderText: {
    id: 'widgets.warningBox.headerText',
    defaultMessage: '!!!ATTENTION:',
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
  amountLabel: {
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
  connectLabel: {
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
    defaultMessage: '!!!You have successfully created a new wallet',
  },
  walletRestoredNotificationMessage: {
    id: 'wallet.summary.page.walletRestoredNotificationMessage',
    defaultMessage: '!!!You have successfully restored your wallet',
  },
  integratedNotificationMessage: {
    id: 'wallet.summary.page.integratedNotificationMessage',
    defaultMessage: '!!!You have successfully integrated with your {deviceName}',
  },
  noTransactionsFound: {
    id: 'wallet.summary.no.transaction',
    defaultMessage: '!!!No transactions found',
  },
  assetSelect: {
    id: 'global.selectAsset.labael',
    defaultMessage: '!!!Select asset',
  },
  assets: {
    id: 'global.label.assets',
    defaultMessage: '!!!assets',
  },
  step1: {
    id: 'transfer.form.instructions.step1.text',
    defaultMessage: '!!!It will take about 1 minute to restore your balance. In the next step, you will be presented with a transaction that will move all of your funds. Please review the details of the transaction carefully. You will need to pay a standard transaction fee on the Cardano network to make the transaction.',
  },
  feeLabel: {
    id: 'wallet.transaction.fee',
    defaultMessage: '!!!Fee',
  },
  languageSelectLabel: {
    id: 'profile.languageSelect.form.languageSelectLabel',
    defaultMessage: '!!!Select your language',
  },
  languageSelectLabelInfo: {
    id: 'settings.general.languageSelect.labelInfo',
    defaultMessage: '!!!The selected language translation is fully provided by the community',
  },
  languageSelectInfo: {
    id: 'settings.general.languageSelect.info',
    defaultMessage: '!!!For EMURGO, friendliness in Yoroi is an important topic. We believe understanding blockchain concepts is easier in your native language. We try supporting as many languages as possible, but for a broader selection of languages we need to accept the help from community translators. The selected language translation is fully provided by the community.',
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
  forMoreHelp: {
    id: 'loading.screen.error',
    defaultMessage: '!!!For more help, you can {supportRequestLink}',
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
    defaultMessage: '!!!explorer',
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
  invalidMemo: {
    id: 'wallet.transaction.memo.invalid',
    defaultMessage: '!!!Memo must be at least 1 and at most {maxMemo} characters.',
  },
  sendingIsDisabled: {
    id: 'wallet.send.form.sendingIsDisabled',
    defaultMessage: '!!!Cannot send a transaction while there is a pending one',
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
  totalRewardsLabel: {
    id: 'wallet.dashboard.summary.rewardsTitle',
    defaultMessage: '!!!Total Rewards',
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
  dateToday: {
    id: 'wallet.summary.page.todayLabel',
    defaultMessage: '!!!Today',
  },
  dateYesterday: {
    id: 'wallet.summary.page.yesterdayLabel',
    defaultMessage: '!!!Yesterday',
  },
  uriLandingDialogConfirmLabel: {
    id: 'uri.landing.dialog.confirm.label',
    defaultMessage: '!!!I understand',
  },
  restoreByronEraWalletDescription: {
    id: 'wallet.add.optionDialog.walletEra.byronEra.description',
    defaultMessage: '!!!Wallets created before July 29th, 2020 are Byron-era wallets and cannot delegate.',
  },
  restoreShelleyEraWalletDescription: {
    id: 'wallet.add.optionDialog.walletEra.shelleyEra.description',
    defaultMessage: '!!!Shelley-era wallets support delegation to stake pools.',
  },
  hardwareTransferInstructions: {
    id: 'transfer.instructions.hardware.disclaimer.instructions1',
    defaultMessage: '!!!When you originally setup your hardware wallet, you were asked to write down a recovery phrase on a piece of paper. Entering this phrase will allow you to transfer your funds out of your hardware wallet and into the current wallet.',
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
  txGeneration: {
    id: 'wallet.delegation.transaction.generation',
    defaultMessage: '!!!Generating transaction',
  },
  poolFetching: {
    id: 'wallet.delegation.poolInfo.fetching',
    defaultMessage: '!!!Fetching pool information',
  },
  transactionId: {
    id: 'wallet.transaction.transactionId',
    defaultMessage: '!!!Transaction ID',
  },
  epochLabel: {
    id: 'global.labels.epoch',
    defaultMessage: '!!!Epoch',
  },
  stakepoolNameLabel: {
    id: 'global.labels.stakepool',
    defaultMessage: '!!!Stakepool Name',
  },
  rewardsLabel: {
    id: 'global.labels.rewardsLabel',
    defaultMessage: '!!!Rewards',
  },
  totalTokenLabel: {
    id: 'wallet.dashboard.summary.adaTitle',
    defaultMessage: '!!!Total {ticker}',
  },
  marginsLabel: {
    id: 'wallet.dashboard.stakePool.margins',
    defaultMessage: '!!!Margins',
  },
  loadMoreButtonLabel: {
    id: 'global.labels.loadMore',
    defaultMessage: '!!!Load more',
  },
  unknownPoolLabel: {
    id: 'wallet.staking.pool.unknownLabel',
    defaultMessage: '!!!Unknown pool',
  },
  sidebarWallets: {
    id: 'sidebar.wallets',
    defaultMessage: '!!!My wallets',
  },
  sidebarSettings: {
    id: 'sidebar.settings',
    defaultMessage: '!!!Settings',
  },
  sidebarTransfer: {
    id: 'sidebar.transfer',
    defaultMessage: '!!!Claim or transfer wallet',
  },
  ledgerTitle: {
    id: 'wallet.add.optionDialog.connect.hw.ledger.title',
    defaultMessage: '!!!Ledger Hardware Wallet',
  },
  trezorTitle: {
    id: 'wallet.add.optionDialog.connect.hw.trezor.title',
    defaultMessage: '!!!Trezor Hardware Wallet',
  },
  undelegateLabel: {
    id: 'global.labael.undelegate',
    defaultMessage: '!!!Undelegate',
  },
  auditAddressWarning: {
    id: 'wallet.receive.page.internalWarning2',
    defaultMessage: '!!!addresses are shown here for personal auditing purposes and should <strong>never</strong> be used.'
  },
  lastSyncMessage: {
    id: 'myWallets.wallets.lastSyncText',
    defaultMessage: '!!!Last sync',
  },
  neverSyncedMessage: {
    id: 'myWallets.wallets.neverSync',
    defaultMessage: '!!!Never synced',
  },
  hardwareWalletLabel: {
    id: 'yoroiTransfer.start.instructions.hardware',
    defaultMessage: '!!!Hardware wallet',
  },
  daedalusWalletLabel: {
    id: 'daedalusTransfer.instructions.attention.button.label',
    defaultMessage: '!!!Daedalus Wallet',
  },
  yoroiPaperLabel: {
    id: 'yoroiTransfer.start.instructions.yoroiPaper',
    defaultMessage: '!!!Yoroi paper wallet',
  },
  addToAddressbookLabel: {
    id: 'global.label.addToAddressbook',
    defaultMessage: '!!!Add to address book',
  },
  createWalletLabel: {
    id: 'wallet.add.page.create.title',
    defaultMessage: '!!!Create Wallet'
  },
  paperWalletLabel: {
    id: 'wallet.add.optionDialog.restore.paperWallet.title',
    defaultMessage: '!!!Paper Wallet'
  },
  allLabel: {
    id: 'wallet.receive.navigation.allLabel',
    defaultMessage: '!!!All'
  },
  noteLabel: {
    id: 'global.labels.note',
    defaultMessage: '!!!Note:'
  },
  upgradeLabel: {
    id: 'global.labels.upgrade',
    defaultMessage: '!!!Upgrade'
  },
  pendingTxWarning: {
    id: 'wallet.staking.warning.pendingTx',
    defaultMessage: '!!!You cannot change your delegation preference while a transaction is pending',
  },
  stakePoolHash: {
    id: 'wallet.delegation.transaction.stakePoolHash',
    defaultMessage: '!!!Stake pool id',
  },
  finalBalanceLabel: {
    id: 'transfer.summary.finalBalance.label',
    defaultMessage: '!!!Final balance',
  },
  StakeDeregistration: {
    id: 'wallet.transaction.certificate.StakeDeregistration',
    defaultMessage: '!!!Staking key deregistration',
  },
  withdrawalsLabel: {
    id: 'wallet.transaction.withdrawalsLabel',
    defaultMessage: '!!!Withdrawals',
  },
  withdrawLabel: {
    id: 'wallet.transaction.withdraw',
    defaultMessage: '!!!Withdraw',
  },
  byronLabel: {
    id: 'wallet.receive.navigation.byronLabel',
    defaultMessage: '!!!Byron'
  },
  shelleyLabel: {
    id: 'global.labels.shelleyLabel',
    defaultMessage: '!!!Shelley'
  },
  spendingKeyLabel: {
    id: 'global.labels.spendingKey',
    defaultMessage: '!!!Spending key',
  },
  stakingKeyLabel: {
    id: 'global.labels.stakingKey',
    defaultMessage: '!!!Staking key',
  },
  spendingKeyHashLabel: {
    id: 'global.labels.spendingKeyHash',
    defaultMessage: '!!!Spending key hash',
  },
  stakingKeyHashLabel: {
    id: 'global.labels.stakingKeyHash',
    defaultMessage: '!!!Staking key hash',
  },
  keyRegistrationPointer: {
    id: 'global.labels.keyRegistrationPointer',
    defaultMessage: '!!!Key registration pointer',
  },
  support: {
    id: 'settings.menu.support.link.label',
    defaultMessage: '!!!Support',
  },
  termsOfUse: {
    id: 'settings.menu.termsOfUse.link.label',
    defaultMessage: '!!!Terms of use',
  },
  fromAddresses: {
    id: 'wallet.transaction.addresses.from',
    defaultMessage: '!!!From addresses',
  },
  toAddresses: {
    id: 'wallet.transaction.addresses.to',
    defaultMessage: '!!!To addresses',
  },
  resyncButtonLabel: {
    id: 'wallet.settings.resync.buttonLabel',
    defaultMessage: '!!!Resync wallet',
  },
  blogLinkWrapper: {
    id: 'settings.support.faq.blogLinkWrapper',
    defaultMessage: '!!!blog post',
  },
  blogLearnMore: {
    id: 'global.blog.learnMore',
    defaultMessage: '!!!You can read our {blogLink} to learn more.'
  },
  keyLabel: {
    id: 'global.key.label',
    defaultMessage: '!!!Key',
  },
  invalidKeyLengthLabel: {
    id: 'global.invalidKeyLength.label',
    defaultMessage: '!!!Invalid key. Should be {length} characters long.',
  },
  invalidKeyLength2Label: {
    id: 'global.invalidKeyLength2.label',
    defaultMessage: '!!!Invalid key. Should one of {lengths}.',
  },
  invalidKeyFormatLabel: {
    id: 'global.invalidKeyFormat.label',
    defaultMessage: '!!!Invalid key. Should be hexadecimal-encoded.',
  },
  stepPin: {
    id: 'wallet.voting.dialog.stepPin',
    defaultMessage: '!!!PIN',
  },
  stepConfirm: {
    id: 'wallet.voting.dialog.stepConfirm',
    defaultMessage: '!!!Confirm',
  },
  registerLabel: {
    id: 'wallet.voting.dialog.registerLabel',
    defaultMessage: '!!!Register',
  },
  transactionLabel: {
    id: 'wallet.voting.dialog.transactionLabel',
    defaultMessage: '!!!Transaction',
  },
  stepQrCode: {
    id: 'wallet.voting.dialog.stepQrCode',
    defaultMessage: '!!!QR Code',
  },
  votingRegistrationTitle: {
    id: 'wallet.voting.dialog.title',
    defaultMessage: '!!!Register for Voting',
  },
  confirmPin: {
    id: 'wallet.voting.dialog.confirmPin',
    defaultMessage: '!!!Confirm PIN',
  },
  completeLabel: {
    id: 'wallet.voting.dialog.completeLabel',
    defaultMessage: '!!!complete',
  },
  pinDoesNotMatch: {
    id: 'global.errors.pinDoesNotMatch',
    defaultMessage: '!!!Pin Does Not Match',
  },
  invalidPin: {
    id: 'global.errors.invalidPin',
    defaultMessage: '!!!Invalid Pin',
  },
  buySellAda: {
    id: 'button.buySellAda',
    defaultMessage: '!!!Buy/Sell ADA',
  },
  txConfirmationLedgerNanoLine2: {
    id: 'wallet.send.ledger.confirmationDialog.info.line.2',
    defaultMessage: '!!!Make sure Cardano ADA app must remain open on the Ledger device throughout the process.',
  },
  txConfirmationTrezorTLine2: {
    id: 'wallet.send.trezor.confirmationDialog.info.line.2',
    defaultMessage: '!!!A new tab will appear. Please follow the instructions in the new tab.',
  },
});
export default globalMessages;

export const memoMessages: * = defineMessages({
  memoLabel: {
    id: 'global.labels.memo',
    defaultMessage: '!!!Memo',
  },
  addMemo: {
    id: 'global.labels.addMemo',
    defaultMessage: '!!!Add memo',
  },
  editMemo: {
    id: 'global.labels.editMemo',
    defaultMessage: '!!!Edit memo',
  },
  deleteMemo: {
    id: 'global.labels.deleteMemo',
    defaultMessage: '!!!Delete memo',
  },
  optionalMemo: {
    id: 'global.labels.optionalMemo',
    defaultMessage: '!!!Memo (optional)',
  }
});
export const connectorMessages: * = defineMessages({
  connectedWebsites: {
    id: 'global.connector.connectedWebsites',
    defaultMessage: '!!!Connected Websites',
  },
  messageReadOnly: {
    id: 'global.connector.messageReadOnly',
    defaultMessage: '!!!We are granting read-only to view utxos/addresses.',
  },
  about: {
    id: 'connector.settings.about',
    defaultMessage: '!!!About',
  },
});


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
