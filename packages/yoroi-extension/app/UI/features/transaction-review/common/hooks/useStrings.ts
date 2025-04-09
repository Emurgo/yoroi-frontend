import React from 'react';
import { defineMessages } from 'react-intl';
import { useIntl } from '../../../../context/IntlProvider';

export const messages = Object.freeze(
  defineMessages({
    tolatValue: {
      id: 'transaction.review.tolatValue',
      defaultMessage: '!!!Total wallet value',
    },
    confirmHardware: {
      id: 'transaction.review.confirmHardware',
      defaultMessage: '!!!Confirm on your hardware wallet',
    },
    takeHardwareWallet: {
      id: 'transaction.review.takeHardwareWallet',
      defaultMessage: '!!!Take your hardware wallet device and follow the instructions there. Make sure you confirm a trusted action.',
    },
    enterPassword: {
      id: 'transaction.review.enterPassword',
      defaultMessage: '!!!Enter password to sign this transaction',
    },
    password: {
      id: 'global.labels.password',
      defaultMessage: '!!!password',
    },
    wrongPassword: {
      id: 'global.labels.wrongPassword',
      defaultMessage: '!!!wrong password',
    },
    wallet: {
      id: 'settings.menu.wallet.link.label',
      defaultMessage: '!!!wallet',
    },
    metadata: {
      id: 'wallet.nftGallary.details.metadata',
      defaultMessage: '!!!metadata',
    },
    missingMetadata: {
      id: 'wallet.nftGallary.details.missingMetadata',
      defaultMessage: '!!!Metadata is missing',
    },
    addressToLabel: {
      id: 'wallet.send.confirmationDialog.addressToLabel',
      defaultMessage: '!!!To',
    },
    send: {
      id: 'wallet.send.confirmationDialog.submit',
      defaultMessage: '!!!send',
    },
    inputsLabel: {
      id: 'transaction.review.inputsLabel',
      defaultMessage: '!!!Inputs',
    },
    outputsLabel: {
      id: 'transaction.review.outputsLabel',
      defaultMessage: '!!!Outputs',
    },
    yourAddressLabel: {
      id: 'transaction.review.yourAddressLabel',
      defaultMessage: '!!!Your Address',
    },
    feeLabel: {
      id: 'wallet.transaction.fee',
      defaultMessage: '!!!fee',
    },
    interactWithOperations: {
      id: 'wallet.transaction.fee',
      defaultMessage: '!!!You are about to interact with operations, which are key components used in governance and various blockchain activities. These include Cardano Governance Certificates, as outlined in CIP-0095, which facilitate governance transactions.',
    },
    learnMore: {
      id: 'global.labels.LearnMore',
      defaultMessage: '!!!Learn more',
    },
    collateralInfo: {
      id: 'transaction.review.collateralInfo',
      defaultMessage: '!!!Collateral is mandatory when interacting with certain smart contracts on Cardano. ADA will only be deduced from your collateral if transaction validation fails.',
    },
    addCollateral: {
      id: 'connector.signin.reorg.title',
      defaultMessage: '!!!Add collateral',
    },
    identifyDrep: {
      id: 'transaction.review.identifyDrep',
      defaultMessage: '!!!Identify your preferred DRep and enter their ID below to delegate your vote:',
    },
    confirmLabel: {
      id: 'global.labels.confirm',
      defaultMessage: '!!!confirm',
    },
    registerStakingKey: {
      id: 'transaction.review.registerStakingKey',
      defaultMessage: '!!!Register Staking key deposit',
    },
    trezorConfirm: {
      id: 'transaction.review.trezorConfirm',
      defaultMessage: '!!!Confirm using Trezor',
    },
    ledgerConfirm: {
      id: 'transaction.review.ledgerConfirm',
      defaultMessage: '!!!Confirm using Ledger',
    },
    submitLabel: {
      id: 'global.labels.submit',
      defaultMessage: '!!!submit',
    },
    cancelLabel: {
      id: 'global.labels.cancel',
      defaultMessage: '!!!cancel',
    },
    transactionReview: {
      id: 'transaction.review.transactionReview',
      defaultMessage: '!!!Transaction Review',
    },
    walletDetails: {
      id: 'transaction.review.walletDetails',
      defaultMessage: '!!!Wallet Details',
    },
    submitTransaction: {
      id: 'transaction.review.submitTransaction',
      defaultMessage: '!!!Submit Transaction',
    },
    chooseDrep: {
      id: 'governance.chooseDrep',
      defaultMessage: '!!!Choose your Drep',
    },
    operations: {
      id: 'governance.operations',
      defaultMessage: '!!!operations',
    },
    attentionLabel: {
      id: 'transfer.instructions.attention.title.label',
      defaultMessage: '!!!Attention',
    },
    rewardsWithdraw: {
      id: 'transaction.review.rewardsWithdraw',
      defaultMessage: '!!!Our rewards will automatically get withdrawn once you undelegate from a stake pool. You will also receive back your staking deposit of 2 ADA. If you wish to choose another stake pool, you can change your preference without undelegation.',
    },
  })
);

export const useStrings = () => {
  const { intl } = useIntl();
  return React.useRef({
    tolatValue: intl.formatMessage(messages.tolatValue),
    confirmHardware: intl.formatMessage(messages.confirmHardware),
    takeHardwareWallet: intl.formatMessage(messages.takeHardwareWallet),
    enterPassword: intl.formatMessage(messages.enterPassword),
    password: intl.formatMessage(messages.password),
    wrongPassword: intl.formatMessage(messages.wrongPassword),
    wallet: intl.formatMessage(messages.wallet),
    metadata: intl.formatMessage(messages.metadata),
    missingMetadata: intl.formatMessage(messages.missingMetadata),
    addressToLabel: intl.formatMessage(messages.addressToLabel),
    sendLabel: intl.formatMessage(messages.send),
    inputsLabel: intl.formatMessage(messages.inputsLabel),
    outputsLabel: intl.formatMessage(messages.outputsLabel),
    yourAddressLabel: intl.formatMessage(messages.yourAddressLabel),
    feeLabel: intl.formatMessage(messages.feeLabel),
    interactWithOperations: intl.formatMessage(messages.interactWithOperations),
    learnMore: intl.formatMessage(messages.learnMore),
    collateralInfo: intl.formatMessage(messages.collateralInfo),
    addCollateral: intl.formatMessage(messages.addCollateral),
    identifyDrep: intl.formatMessage(messages.identifyDrep),
    confirmLabel: intl.formatMessage(messages.confirmLabel),
    registerStakingKey: intl.formatMessage(messages.registerStakingKey),
    trezorConfirm: intl.formatMessage(messages.trezorConfirm),
    ledgerConfirm: intl.formatMessage(messages.ledgerConfirm),
    submitLabel: intl.formatMessage(messages.submitLabel),
    cancelLabel: intl.formatMessage(messages.cancelLabel),
    transactionReview: intl.formatMessage(messages.transactionReview),
    walletDetails: intl.formatMessage(messages.walletDetails),
    submitTransaction: intl.formatMessage(messages.submitTransaction),
    chooseDrep: intl.formatMessage(messages.chooseDrep),
    operations: intl.formatMessage(messages.operations),
    attentionLabel: intl.formatMessage(messages.attentionLabel),
    rewardsWithdraw: intl.formatMessage(messages.rewardsWithdraw),
  }).current;
};
