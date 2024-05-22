// @flow
import { defineMessages } from 'react-intl';

/*
 * Some messages need to be used in multiple components
 * In order to avoid components depending on each other just to reuse translation messages
 * We instead store the shared messages in this file
 */

const globalMessages: * = defineMessages({
  receive: {
    id: 'global.receive',
    defaultMessage: '!!!Receive',
  },
  send: {
    id: 'wallet.navigation.send',
    defaultMessage: '!!!Send',
  },
  yoroi: {
    id: 'global.yoroi',
    defaultMessage: '!!!Yoroi',
  },
  yoroiNightly: {
    id: 'global.yoroiNightly',
    defaultMessage: '!!!Yoroi Nightly',
  },
  yoroiIntro: {
    id: 'global.yoroi.intro',
    defaultMessage: '!!!Light wallet for Cardano assets',
  },
  here: {
    id: 'global.util.here',
    defaultMessage: '!!!here',
  },
  addToken: {
    id: 'global.labels.addToken',
    defaultMessage: '!!!Add Token',
  },
  addNft: {
    id: 'global.labels.addNft',
    defaultMessage: '!!!Add NFT',
  },
  nfts: {
    id: 'global.labels.nft',
    defaultMessage: '!!!NFTs',
  },
  passwordLabel: {
    id: 'global.labels.password',
    defaultMessage: '!!!Password',
  },
  standardWallet: {
    id: 'wallet.nav.type.standard',
    defaultMessage: '!!!Standard wallet',
  },
  transactionFee: {
    id: 'wallet.send.preview.transactionFee',
    defaultMessage: '!!!Transaction Fee',
  },
  trezorWallet: {
    id: 'wallet.nav.type.trezor',
    defaultMessage: '!!!Trezor wallet',
  },
  ledgerWallet: {
    id: 'wallet.nav.type.ledger',
    defaultMessage: '!!!Ledger wallet',
  },
  important: {
    id: 'global.dialogs.important',
    defaultMessage: '!!!Important',
  },
  fieldIsRequired: {
    id: 'global.errors.fieldIsRequired',
    defaultMessage: '!!!This field is required.',
  },
  invalidWalletName: {
    id: 'global.errors.invalidWalletName',
    defaultMessage: '!!!Wallet name requires at least 1 and no more than 40 characters.',
  },
  invalidWalletPassword: {
    id: 'global.errors.invalidWalletPassword',
    defaultMessage: '!!!Password requires at least 10 characters.',
  },
  invalidRepeatPassword: {
    id: 'global.errors.invalidRepeatPassword',
    defaultMessage: '!!!Passwords do not match. Please retype.',
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
  minAda: {
    id: 'global.labels.minAda',
    defaultMessage: '!!!Min-ADA',
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
  close: {
    id: 'global.labels.close',
    defaultMessage: '!!!Close',
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
  restore: {
    id: 'global.labels.restore',
    defaultMessage: '!!!Restore',
  },
  remove: {
    id: 'global.labels.remove',
    defaultMessage: '!!!Remove',
  },
  cardanoscan: {
    id: 'global.explorers.cardanoscan',
    defaultMessage: '!!!Cardanoscan',
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
  smartContracts: {
    id: 'global.labels.smartContracts',
    defaultMessage: '!!!Smart contracts',
  },
  walletLabel: {
    id: 'settings.menu.wallet.link.label',
    defaultMessage: '!!!Wallet',
  },
  assetDepositLabel: {
    id: 'settings.menu.assetDeposit.link.label',
    defaultMessage: '!!!Locked assets deposit',
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
  languageCzech: {
    id: 'global.language.czech',
    defaultMessage: '!!!Czech',
  },
  languageSlovak: {
    id: 'global.language.slovak',
    defaultMessage: '!!!Slovak',
  },
  languageVietnamese: {
    id: 'global.language.vietnamese',
    defaultMessage: '!!!Vietnamese',
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
  allWalletsLabel: {
    id: 'wallet.nav.allWalletsLabel',
    defaultMessage: '!!!All wallets',
  },
  changeWallet: {
    id: 'wallet.nav.changeWallet',
    defaultMessage: '!!!Change wallet',
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
  walletSendConfirmationTxSizeLabel: {
    id: 'wallet.send.confirmationDialog.txSizeLabel',
    defaultMessage: '!!!Size',
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
    defaultMessage:
      '!!!Your computer must remain connected to the Internet throughout the process.',
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
    defaultMessage:
      '!!!Failed to connect trezor.io. Please check your Internet connection and retry.',
  },
  hwError101: {
    id: 'wallet.hw.common.error.101',
    defaultMessage: '!!!Necessary permissions were not granted by the user. Please retry.',
  },
  trezorError103: {
    id: 'wallet.connect.trezor.error.103',
    defaultMessage: '!!!Cancelled. Please retry.',
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
    defaultMessage: '!!!No transaction history.',
  },
  assetSelect: {
    id: 'global.selectAsset.labael',
    defaultMessage: '!!!Select asset',
  },
  assets: {
    id: 'global.label.assets',
    defaultMessage: '!!!assets',
  },
  success: {
    id: 'global.label.success',
    defaultMessage: '!!!Success',
  },
  step1: {
    id: 'transfer.form.instructions.step1.text',
    defaultMessage:
      '!!!It will take about 1 minute to restore your balance. In the next step, you will be presented with a transaction that will move all of your funds. Please review the details of the transaction carefully. You will need to pay a standard transaction fee on the Cardano network to make the transaction.',
  },
  feeLabel: {
    id: 'wallet.transaction.fee',
    defaultMessage: '!!!Fee',
  },
  languageSelectLabel: {
    id: 'profile.languageSelect.form.languageSelectLabel',
    defaultMessage: '!!!Select your language',
  },
  languageSelectLabelShort: {
    id: 'profile.languageSelect.form.languageSelectLabelShort',
    defaultMessage: '!!!Select language',
  },
  languageSelectLabelInfo: {
    id: 'settings.general.languageSelect.labelInfo',
    defaultMessage: '!!!The selected language translation is fully provided by the community',
  },
  languageSelectInfo: {
    id: 'settings.general.languageSelect.info',
    defaultMessage:
      '!!!For EMURGO, friendliness in Yoroi is an important topic. We believe understanding blockchain concepts is easier in your native language. We try supporting as many languages as possible, but for a broader selection of languages we need to accept the help from community translators. The selected language translation is fully provided by the community.',
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
    defaultMessage:
      '!!!Unexpected error occurred. We apologize for the inconvenience. If this error persists, please reach out to our support team {supportRequestLink}',
  },
  logsContent: {
    id: 'settings.support.logs.content',
    defaultMessage:
      '!!!If you want to inspect logs, you can {downloadLogsLink}. Logs do not contain sensitive information, and it would be helpful to attach them to problem reports to help the team investigate the issue you are experiencing. Logs can be attached automatically when using the bug reporting feature.',
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
    defaultMessage: '!!!New password',
  },
  newPasswordFieldPlaceholder: {
    id: 'wallet.settings.changePassword.dialog.newPasswordFieldPlaceholder',
    defaultMessage: '!!!Type new password',
  },
  repeatPasswordLabel: {
    id: 'wallet.settings.changePassword.dialog.repeatPasswordLabel',
    defaultMessage: '!!!Repeat new password',
  },
  repeatPasswordFieldPlaceholder: {
    id: 'wallet.settings.changePassword.dialog.repeatPasswordFieldPlaceholder',
    defaultMessage: '!!!Type new password',
  },
  uriSchemeLabel: {
    id: 'global.uriSchemeTitleLabel',
    defaultMessage: '!!!Cardano Payment URLs',
  },
  uriExplanation: {
    id: 'global.uriExplanation',
    defaultMessage:
      '!!!These allow you to easily share invoices with friends and businesses by simply clicking a URL.',
  },
  uriExplanationRevamp: {
    id: 'global.uriExplanation.revamp',
    defaultMessage: '!!!Allow URLs to easily share invoices with friends and businesses',
  },
  copyTooltipMessage: {
    id: 'global.copyTooltipMessage',
    defaultMessage: '!!!Copied',
  },
  attentionTitle: {
    id: 'transfer.instructions.attention.title.label',
    defaultMessage: '!!!Attention',
  },
  invalidMemo: {
    id: 'wallet.transaction.memo.invalid',
    defaultMessage: '!!!Memo must be at least 1 and at most {maxMemo} characters.',
  },
  sendingIsDisabled: {
    id: 'wallet.send.form.sendingIsDisabled',
    defaultMessage:
      '!!!Unable to process. Please retry after the previous transaction has been completed.',
  },
  passwordDisclaimer: {
    id: 'wallet.restore.dialog.passwordDisclaimer',
    defaultMessage:
      '!!!Typing the wrong wallet password will give you a different wallet. This allows for plausible deniability.',
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
    defaultMessage: '!!!Not found',
  },
  invalidRecoveryPhrase: {
    id: 'wallet.restore.dialog.form.errors.invalidRecoveryPhrase',
    defaultMessage: '!!!Invalid recovery phrase. Please retype.',
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
    defaultMessage: `!!!Wallet Upgrade`,
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
    defaultMessage:
      '!!!Wallets created before July 29th, 2020 are Byron-era wallets and cannot delegate.',
  },
  sendButtonLabel: {
    id: 'wallet.send.confirmationDialog.submit',
    defaultMessage: '!!!Send',
  },
  walletPasswordLabel: {
    id: 'wallet.send.confirmationDialog.walletPasswordLabel',
    defaultMessage: '!!!Password',
  },
  walletPasswordFieldPlaceholder: {
    id: 'wallet.send.confirmationDialog.walletPasswordFieldPlaceholder',
    defaultMessage: '!!!Type your password',
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
  stakePoolChecksumAndName: {
    id: 'global.labels.stakePoolChecksumAndName',
    defaultMessage: '!!!Stake pool checksum and name',
  },
  rewardsLabel: {
    id: 'global.labels.rewardsLabel',
    defaultMessage: '!!!Rewards',
  },
  rewardsListLabel: {
    id: 'global.labels.rewardsListLabel',
    defaultMessage: '!!!Rewards list',
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
  poolSize: {
    id: 'wallet.staking.pool.size',
    defaultMessage: '!!!Pool size',
  },
  poolShare: {
    id: 'wallet.staking.pool.share',
    defaultMessage: '!!!Share',
  },
  poolSaturation: {
    id: 'wallet.staking.pool.saturation',
    defaultMessage: '!!!Saturation',
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
  // Revamp labels for sidebar
  stakingDashboard: {
    id: 'sidebar.stakingDashboard',
    defaultMessage: '!!!Staking Dashboard',
  },
  sidebarStaking: {
    id: 'sidebar.staking',
    defaultMessage: '!!!Staking',
  },
  sidebarPortfolio: {
    id: 'sidebar.portfolio',
    defaultMessage: '!!!Portfolio',
  },
  sidebarNfts: {
    id: 'sidebar.nfts',
    defaultMessage: '!!!NFTs',
  },
  sidebarVoting: {
    id: 'sidebar.voting',
    defaultMessage: '!!!Voting',
  },
  sidebarSwap: {
    id: 'sidebar.swap',
    defaultMessage: '!!!Swap',
  },
  sidebarFaq: {
    id: 'sidebar.faq',
    defaultMessage: '!!!Faq',
  },
  sidebarNewUpdates: {
    id: 'sidebar.newUpdates',
    defaultMessage: '!!!New updates',
  },
  sidebarFeedback: {
    id: 'sidebar.feedback',
    defaultMessage: '!!!Feedback',
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
  roa30d: {
    id: 'wallet.staking.banner.roa30d',
    defaultMessage: '!!!ROA 30d',
  },
  roaHelperMessage: {
    id: 'wallet.staking.banner.roaHelperMessage',
    defaultMessage:
      '!!!Estimated ROA (Return of ADA) based on staking result from the last 30 days',
  },
  stakePoolDelegated: {
    id: 'wallet.dashboard.upcomingRewards.stakePoolDelegated',
    defaultMessage: '!!!Stake Pool Delegated',
  },
  totalDelegated: {
    id: 'wallet.dashboard.summary.totalDelegated',
    defaultMessage: '!!!Total Delegated',
  },
  overview: {
    id: 'wallet.staking.overview',
    defaultMessage: '!!!Overview',
  },
  rewardHistory: {
    id: 'wallet.staking.rewards.rewardHistory',
    defaultMessage: '!!!Reward History',
  },
  rewardValue: {
    id: 'wallet.staking.rewards.rewardValue',
    defaultMessage: '!!!Reward value',
  },
  openRewardHistory: {
    id: 'wallet.staking.rewards.openRewardHistory',
    defaultMessage: '!!!Open Reward History',
  },
  epochProgress: {
    id: 'wallet.staking.epochProgress',
    defaultMessage: '!!!Epoch Progress',
  },
  epochs: {
    id: 'wallet.staking.epochsLabel',
    defaultMessage: '!!!Epochs',
  },
  tokens: {
    id: 'wallet.assets.tokens',
    defaultMessage: '!!!Tokens',
  },
  fingerprint: {
    id: 'wallet.assets.fingerprint',
    defaultMessage: '!!!Fingerprint',
  },
  auditAddressWarning: {
    id: 'wallet.receive.page.internalWarning2',
    defaultMessage:
      '!!!addresses are shown here for personal auditing purposes and should <strong>never</strong> be used.',
  },
  lastSyncMessage: {
    id: 'myWallets.wallets.lastSyncText',
    defaultMessage: '!!!Last sync',
  },
  neverSyncedMessage: {
    id: 'myWallets.wallets.neverSync',
    defaultMessage: '!!!Never synced',
  },
  createWalletLabel: {
    id: 'wallet.add.page.create.title',
    defaultMessage: '!!!Create Wallet',
  },
  allLabel: {
    id: 'wallet.receive.navigation.allLabel',
    defaultMessage: '!!!All',
  },
  noteLabel: {
    id: 'global.labels.note',
    defaultMessage: '!!!Note:',
  },
  upgradeLabel: {
    id: 'global.labels.upgrade',
    defaultMessage: '!!!Upgrade',
  },
  pendingTxWarning: {
    id: 'wallet.staking.warning.pendingTx',
    defaultMessage:
      '!!!You cannot change your delegation preference while a transaction is pending',
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
    defaultMessage: '!!!Byron',
  },
  shelleyLabel: {
    id: 'global.labels.shelleyLabel',
    defaultMessage: '!!!Shelley',
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
  termsOfService: {
    id: 'settings.menu.termsOfService.link.label',
    defaultMessage: '!!!Terms of Service Agreement',
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
    defaultMessage: '!!!You can read our {blogLink} to learn more.',
  },
  keyLabel: {
    id: 'global.key.label',
    defaultMessage: '!!!Key',
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
  pinDoesNotMatch: {
    id: 'global.errors.pinDoesNotMatch',
    defaultMessage: '!!!PIN codes do not match. Please retype.',
  },
  invalidPin: {
    id: 'global.errors.invalidPin',
    defaultMessage: '!!!Invalid PIN. Please retype.',
  },
  buyAda: {
    id: 'button.buyAda',
    defaultMessage: '!!!Buy ADA',
  },
  sellAda: {
    id: 'button.sellAda',
    defaultMessage: '!!!Sell ADA',
  },
  buySellAda: {
    id: 'button.buySellAda',
    defaultMessage: '!!!Buy/Sell ADA',
  },
  txConfirmationLedgerNanoLine2: {
    id: 'wallet.send.ledger.confirmationDialog.info.line.2',
    defaultMessage:
      '!!!Make sure Cardano ADA app must remain open on the Ledger device throughout the process.',
  },
  txConfirmationTrezorTLine2: {
    id: 'wallet.send.trezor.confirmationDialog.info.line.2',
    defaultMessage: '!!!A new tab will appear. Please follow the instructions in the new tab.',
  },
  syncing: {
    id: 'wallet.syncing',
    defaultMessage: '!!!Syncing...',
  },
  loading: {
    id: 'wallet.loading',
    defaultMessage: '!!!Loading...',
  },
  confirmOnLedger: {
    id: 'label.confirm.ledger',
    defaultMessage: '!!!Confirm on Ledger',
  },
  confirmOnTrezor: {
    id: 'label.confirm.trezor',
    defaultMessage: '!!!Confirm on Trezor',
  },
  tosAgreement: {
    id: 'profile.languageSelect.tosAgreement',
    defaultMessage:
      '!!!I agree with <span id="tosLink">Terms of Service Agreement</span> and <span id="privacyLink">Privacy Notice</span>',
  },
  goToTransactions: {
    id: 'wallet.transaction.success.button.label',
    defaultMessage: '!!!Go To Transactions',
  },
  provider: {
    id: 'buysell.dialog.provider',
    defaultMessage: '!!!Provider',
  },
  portfolioHeaderText: {
    id: 'portfolio.main.header.text',
    defaultMessage: '!!!Tokens',
  },
  portfolioDetailHeaderText: {
    id: 'portfolio.detail.header.text',
    defaultMessage: '!!!Token details',
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
  },
  memoWarning: {
    id: 'wallet.send.form.memoWarning',
    defaultMessage: '!!!(Optional) Memo is stored locally',
  },
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
  signTransaction: {
    id: 'connector.settings.signTransaction',
    defaultMessage: '!!!Sign transaction',
  },
  signData: {
    id: 'connector.signin.signData',
    defaultMessage: '!!!Sign data',
  },
  connect: {
    id: 'connector.settings.connect',
    defaultMessage: '!!!Connect',
  },
  dappConnector: {
    id: 'connector.appName',
    defaultMessage: '!!!Dapp Connector',
  },
  connector: {
    id: 'connector.appNameShort',
    defaultMessage: '!!!Connector',
  },
  yourAddresses: {
    id: 'connector.yourAddresses',
    defaultMessage: '!!!Your Addresses',
  },
  foreignAddresses: {
    id: 'connector.foreignAddresses',
    defaultMessage: '!!!Foreign Addresses',
  },
  fromWallet: {
    id: 'connector.fromWallet',
    defaultMessage: '!!!From wallet',
  },
  fromAddresses: {
    id: 'connector.from',
    defaultMessage: '!!!From (Inputs): {qty}',
  },
  toAddresses: {
    id: 'connector.to',
    defaultMessage: '!!!To (Outputs): {qty}',
  },
  send: {
    id: 'wallet.navigation.send',
    defaultMessage: '!!!Send',
  },
  receive: {
    id: 'wallet.navigation.receive',
    defaultMessage: '!!!Receive',
  },
  assetsSent: {
    id: 'connector.assetsSent',
    defaultMessage: '!!!{quantity} assets sent',
  },
  assetsReceived: {
    id: 'connector.assetsReceived',
    defaultMessage: '!!!{quantity} assets received',
  },
  assetSent: {
    id: 'connector.assetSent',
    defaultMessage: '!!!{assetName} sent',
  },
  assetReceived: {
    id: 'connector.assetReceived',
    defaultMessage: '!!!{assetName} received',
  },
  noAssetsSent: {
    id: 'connector.noAssetsSent',
    defaultMessage: '!!!No assets sent',
  },
  noAssetsReceived: {
    id: 'connector.noAssetsReceived',
    defaultMessage: '!!!No assets received',
  },
});

export function listOfTranslators(contributorsList: string, contributorsAck: string): string {
  let output = '';
  // append name of contributors only if the message is not empty
  if (contributorsList !== globalMessages.translationContributors.defaultMessage) {
    output = contributorsAck + contributorsList;
  }
  return output;
}
