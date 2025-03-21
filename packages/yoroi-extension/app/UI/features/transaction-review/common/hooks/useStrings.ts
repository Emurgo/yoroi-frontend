import React from 'react';
import { defineMessages } from 'react-intl';
import { useIntl } from '../../../../context/IntlProvider';

export const messages = Object.freeze(
  defineMessages({
    copyToClipboard: {
      id: 'widgets.copyableaddress.addressCopyTooltipMessage',
      defaultMessage: '!!!Copy to clipboard',
    },
    copied: {
      id: 'widgets.copyableaddress.copied',
      defaultMessage: '!!!Copied',
    },
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
  })
);

export const useStrings = () => {
  const { intl } = useIntl();
  return React.useRef({
    copyToClipboard: intl.formatMessage(messages.copyToClipboard),
    copied: intl.formatMessage(messages.copied),
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
  }).current;
};
