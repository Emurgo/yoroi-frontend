import React from 'react';
import { defineMessages } from 'react-intl';
import { useIntl } from '../../../../context/IntlProvider';

export const messages = Object.freeze(
  defineMessages({
    notAvailableTitle: {
      id: 'wallet.registrationOver.mainTitle',
      defaultMessage: '!!!Registration is not available',
    },
    notAvailableSubtitle: {
      id: 'wallet.registrationOver.mainSubtitle',
      defaultMessage:
        '!!!The registration period for fund {roundNumber} has ended. For more information, check the <a href="https://projectcatalyst.io/get-involved/become-a-voter" target="_blank"> Catalyst app. </a>',
    },
    unavailableTitle: {
      id: 'wallet.registrationOver.unavailableTitle',
      defaultMessage: '!!!Catalyst Round information is currently unavailable.',
    },
    unavailableSubtitle: {
      id: 'wallet.registrationOver.unavailableSubtitle',
      defaultMessage: '!!!Please check the Catalyst app for more info',
    },
    earlyForRegistrationTitle: {
      id: 'wallet.registrationOver.earlyForRegistrationTitle',
      defaultMessage: "!!!Registration hasn't started yet.",
    },
    earlyForRegistrationSubTitle: {
      id: 'wallet.registrationOver.earlyForRegistrationSubTitle',
      defaultMessage: '!!!Registration for Round {roundNumber} begins at {registrationStart}.',
    },
    beforeVotingSubtitle: {
      id: 'wallet.registrationOver.beforeVotingSubtitle',
      defaultMessage: '!!!Registration has ended. Voting starts at {votingStart}',
    },
    betweenVotingSubtitle: {
      id: 'wallet.registrationOver.betweenVotingSubtitle',
      defaultMessage: '!!!"Registration has ended.  Voting ends at  {votingEnd}',
    },
    nextFundRegistration: {
      id: 'wallet.registrationOver.nextFundRegistration',
      defaultMessage: 'Round {roundNumber} starts at {registrationStart}',
    },
    title: {
      id: 'wallet.voting.lineTitle',
      defaultMessage: '!!!Register to vote on {fundName}',
    },
    subtitle: {
      id: 'wallet.voting.line2',
      defaultMessage: '!!!Before you begin, make sure to complete steps below',
    },
    downloadApp: {
      id: 'wallet.voting.line3',
      defaultMessage: '!!!Download the Catalyst Voting App.',
    },
    openApp: {
      id: 'wallet.voting.line4',
      defaultMessage: '!!!Open the Catalyst Voting App and click on the Complete registration button.',
    },
    notDelegated: {
      id: 'wallet.voting.notDelegated',
      defaultMessage:
        "!!!You haven't delegated anything. Your voting power is determined by the amount you delegate and voting rewards are distributed to your delegation reward address. Please remember to delegate prior to voting.",
    },
    keepDelegated: {
      id: 'wallet.voting.keepDelegated',
      defaultMessage:
        '!!!Your voting power is how much you delegate and the voting rewards will be distributed to your delegation reward address. Please keep delegated until the voting ends.',
    },
    trezorTRequirement: {
      id: 'wallet.voting.trezorTRequirement',
      defaultMessage:
        '!!!<a target="_blank" rel="noopener noreferrer" href="https://wiki.trezor.io/User_manual:Updating_the_Trezor_device_firmware">Update</a> your Trezor device firmware version to 2.4.1 or above.',
    },
    ledgerNanoRequirement: {
      id: 'wallet.voting.ledgerNanoRequirement',
      defaultMessage:
        '!!!<a target="_blank" rel="noopener noreferrer" href="https://emurgo.github.io/yoroi-extension-ledger-connect-vnext/catalyst/update-ledger-app/">Update</a> the Cardano app on your Ledger to version 6 or above with <a target="_blank" rel="noopener noreferrer" href="https://www.ledger.com/ledger-live"> Ledger Live</a>.',
    },
    disclaimerTitle: {
      id: 'buySell.disclaimer.title',
      defaultMessage: '!!!Disclaimer',
    },
    register: {
      id: 'wallet.voting.dialog.registerLabel',
      defaultMessage: '!!!Register',
    },
    votingRegistrationTitle: {
      id: 'wallet.voting.dialog.title',
      defaultMessage: '!!!Register for Voting',
    },
    pinStep: {
      id: 'wallet.voting.dialog.step.pin.line1',
      defaultMessage:
        '!!!Please write down this PIN as you will need it <strong>every time</strong> you want to access the Catalyst Voting app.',
    },
    pinStepButton: {
      id: 'wallet.voting.dialog.step.pin.actionButton',
      defaultMessage: '!!!Confirm that I wrote down the PIN',
    },
    confirmPinStep: {
      id: 'wallet.voting.dialog.step.confirm.line1',
      defaultMessage:
        '!!!Please enter the PIN as you will need it <strong>every time</strong> you want to access the Catalyst Voting app.',
    },
    confirmPinStepButton: {
      id: 'wallet.voting.dialog.stepConfirm',
      defaultMessage: '!!!Confirm',
    },
    passwordStep: {
      id: 'wallet.voting.dialog.step.register.line1',
      defaultMessage: '!!!Enter your password to be able to generate the required certificate for voting.',
    },
    passwordStepButton: {
      id: 'global.labels.next',
      defaultMessage: '!!!Next',
    },
    txStep: {
      id: 'wallet.voting.dialog.step.trx.line1',
      defaultMessage: '!!!Confirm your password to register in the blockchain the certificate previously generated for voting.',
    },
    txStepTrezor: {
      id: 'wallet.voting.dialog.step.trx.trezor.info.line.1',
      defaultMessage: '!!!After connecting your Trezor device to your computer, press the Register button.',
    },
    txStepLedger: {
      id: 'wallet.voting.dialog.step.trx.ledger.info.line.1',
      defaultMessage: "!!!After connecting your Ledger device to your computer's USB port, press the Register button.",
    },
    txStepLedger2: {
      id: 'wallet.send.ledger.confirmationDialog.info.line.2',
      defaultMessage: '!!!Make sure Cardano ADA app must remain open on the Ledger device throughout the process.',
    },
    txStepTrezor2: {
      id: 'wallet.send.trezor.confirmationDialog.info.line.2',
      defaultMessage: '!!!A new tab will appear. Please follow the instructions in the new tab.',
    },
    useCatalystAppToScan: {
      id: 'wallet.voting.dialog.step.qr.lineTitle',
      defaultMessage: '!!!Use the Catalyst Voting App to scan the QR code',
    },
    qrCodeIsTheGeneratedCertificate: {
      id: 'wallet.voting.dialog.step.qr.line2',
      defaultMessage:
        '!!!The following QR code is the generated certificate required by the Catalyst App to be able to participate in the voting process of Cardano.',
    },
    takeAScreenshot: {
      id: 'wallet.voting.dialog.step.qr.line3',
      defaultMessage:
        "!!!Also we suggest to take a screenshot of it as a backup — you won't be able to access this QR code after clicking Complete.",
    },
    qrStepConfirm: {
      id: 'wallet.voting.dialog.step.qr.actionButton',
      defaultMessage: '!!!Confirm that I saved the QR code',
    },
    qrStepDownload: {
      id: 'wallet.voting.dialog.step.qr.downloadQrCode',
      defaultMessage: '!!!Download QR code',
    },
    close: {
      id: 'global.labels.close',
      defaultMessage: '!!!Close',
    },
    passwordLabel: {
      id: 'global.labels.password',
      defaultMessage: '!!!Password',
    },
    confirmPinInputLabel: {
      id: 'wallet.voting.dialog.confirmPin',
      defaultMessage: '!!!Confirm PIN',
    },
    step1Label: {
      id: 'wallet.voting.dialog.stepPin',
      defaultMessage: '!!!PIN',
    },
    step4Label: {
      id: 'wallet.voting.dialog.transactionLabel',
      defaultMessage: '!!!Transaction',
    },
    step5Label: {
      id: 'wallet.voting.dialog.stepQrCode',
      defaultMessage: '!!!QR Code',
    },
    processingLabel: {
      id: 'global.labels.processing',
      defaultMessage: '!!!Processing...',
    },
    txGeneration: {
      id: 'wallet.delegation.transaction.generation',
      defaultMessage: '!!!Generating transaction',
    },
  })
);

export const useStrings = () => {
  const { intl } = useIntl();
  return React.useRef({
    notAvailableTitle: intl.formatMessage(messages.notAvailableTitle),
    notAvailableSubtitle: (roundNumber: string) => intl.formatMessage(messages.notAvailableSubtitle, { roundNumber }),
    unavailableTitle: intl.formatMessage(messages.unavailableTitle),
    unavailableSubtitle: intl.formatMessage(messages.unavailableSubtitle),
    earlyForRegistrationTitle: intl.formatMessage(messages.earlyForRegistrationTitle),
    earlyForRegistrationSubTitle: (roundNumber: string, registrationStart: string) =>
      intl.formatMessage(messages.earlyForRegistrationSubTitle, { roundNumber, registrationStart }),
    beforeVotingSubtitle: (votingStart: string) => intl.formatMessage(messages.beforeVotingSubtitle, { votingStart }),
    betweenVotingSubtitle: (votingEnd: string) => intl.formatMessage(messages.betweenVotingSubtitle, { votingEnd }),
    nextFundRegistration: (roundNumber: string, registrationStart: string) =>
      intl.formatMessage(messages.nextFundRegistration, { roundNumber, registrationStart }),
    title: (fundName: string) => intl.formatMessage(messages.title, { fundName }),
    subtitle: intl.formatMessage(messages.subtitle),
    downloadApp: intl.formatMessage(messages.downloadApp),
    openApp: intl.formatMessage(messages.openApp),
    notDelegated: intl.formatMessage(messages.notDelegated),
    keepDelegated: intl.formatMessage(messages.keepDelegated),
    trezorTRequirement: intl.formatMessage(messages.trezorTRequirement),
    ledgerNanoRequirement: intl.formatMessage(messages.ledgerNanoRequirement),
    disclaimerTitle: intl.formatMessage(messages.disclaimerTitle),
    register: intl.formatMessage(messages.register),
    votingRegistrationTitle: intl.formatMessage(messages.votingRegistrationTitle),
    pinStep: intl.formatMessage(messages.pinStep),
    pinStepButton: intl.formatMessage(messages.pinStepButton),
    confirmPinStep: intl.formatMessage(messages.confirmPinStep),
    confirmPinStepButton: intl.formatMessage(messages.confirmPinStepButton),
    passwordStep: intl.formatMessage(messages.passwordStep),
    passwordStepButton: intl.formatMessage(messages.passwordStepButton),
    passwordLabel: intl.formatMessage(messages.passwordLabel),
    txStep: intl.formatMessage(messages.txStep),
    txStepTrezor: intl.formatMessage(messages.txStepTrezor),
    txStepTrezor2: intl.formatMessage(messages.txStepTrezor2),
    txStepLedger: intl.formatMessage(messages.txStepLedger),
    txStepLedger2: intl.formatMessage(messages.txStepLedger2),
    useCatalystAppToScan: intl.formatMessage(messages.useCatalystAppToScan),
    qrCodeIsTheGeneratedCertificate: intl.formatMessage(messages.qrCodeIsTheGeneratedCertificate),
    takeAScreenshot: intl.formatMessage(messages.takeAScreenshot),
    qrStepConfirm: intl.formatMessage(messages.qrStepConfirm),
    qrStepDownload: intl.formatMessage(messages.qrStepDownload),
    close: intl.formatMessage(messages.close),
    confirmPinInputLabel: intl.formatMessage(messages.confirmPinInputLabel),
    step1Label: intl.formatMessage(messages.step1Label),
    step2Label: intl.formatMessage(messages.confirmPinStepButton),
    step3Label: intl.formatMessage(messages.register),
    step4Label: intl.formatMessage(messages.step4Label),
    step5Label: intl.formatMessage(messages.step5Label),
    processingLabel: intl.formatMessage(messages.processingLabel),
    txGeneration: intl.formatMessage(messages.txGeneration),
  }).current;
};
