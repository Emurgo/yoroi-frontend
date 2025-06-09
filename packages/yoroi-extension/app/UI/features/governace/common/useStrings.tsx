import React from 'react';
import { defineMessages } from 'react-intl';
import { useIntl } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';

export const messages = Object.freeze(
  defineMessages({
    governanceStatus: {
      id: 'governance.governanceStatus',
      defaultMessage: '!!!Governance status',
    },
    governanceStatusInfo: {
      id: 'governance.governanceStatusInfo',
      defaultMessage:
        '!!!You have selected undefined as your governance status. You can change it at any time by clicking in the card bellow',
    },
    abstain: {
      id: 'governance.abstain',
      defaultMessage: '!!!Abstain',
    },
    abstainInfo: {
      id: 'governance.abstainInfo',
      defaultMessage: '!!!You are choosing not to cast a vote on all proposals now and in the future.',
    },
    noConfidence: {
      id: 'governance.noConfidence',
      defaultMessage: '!!!No Confidence',
    },
    noConfidenceInfo: {
      id: 'governance.noConfidenceInfo',
      defaultMessage: '!!!You are expressing a lack of trust for all proposals now and in the future.',
    },
    learnMore: {
      id: 'governance.learnMore',
      defaultMessage: '!!!Learn more About Governance',
    },
    becomeADrep: {
      id: 'governance.becomeADrep',
      defaultMessage: '!!!Want to became a Drep?',
    },
    drepId: {
      id: 'governance.drepId',
      defaultMessage: '!!!Drep ID (CIP 129):',
    },
    delegateToDRep: {
      id: 'governance.delegateToDRep',
      defaultMessage: '!!!Delegate to a DRep',
    },
    delegateToYoroiDRep: {
      id: 'governance.delegateToYoroiDRep',
      defaultMessage: '!!!Delegate to Yoroi DRep',
    },
    delegatingToDRep: {
      id: 'governance.delegatingToDRep',
      defaultMessage: '!!!Delegating to a DRep',
    },
    designatingSomeoneElse: {
      id: 'governance.designatingSomeoneElse',
      defaultMessage:
        '!!!You are designating someone else to cast your vote on your behalf for all proposals now and in the future.',
    },
    registerGovernance: {
      id: 'governance.registerGovernance',
      defaultMessage: '!!!Register in Governance',
    },
    chooseDrep: {
      id: 'governance.chooseDrep',
      defaultMessage: '!!!Choose your Drep',
    },
    reviewSelection: {
      id: 'governance.reviewSelection',
      defaultMessage: `!!!Your delegation helps shape Cardano's future.\nYou may change your governance status at any time.`,
    },
    statusSelected: {
      id: 'governance.statusSelected',
      defaultMessage:
        '!!!You have selected ${status} as your governance status. You can change it at any time by clicking in the card bellow',
    },
    statusPending: {
      id: 'governance.statusPending',
      defaultMessage: '!!!You have chosen your governance status, this process may take a while.',
    },
    needAdaForParticipation: {
      id: 'governance.needAdaForParticipation',
      defaultMessage: '!!!To participate in governance you need to have ADA in your wallet.',
    },
    thanksForParticipation: {
      id: 'governance.thanksForParticipation',
      defaultMessage: '!!!Thank you for participating in Governance.',
    },
    theTransactionCanTake: {
      id: 'governance.theTransactionCanTake',
      defaultMessage: '!!!This transaction can take a while!',
    },
    participatingInGovernance: {
      id: 'governance.participatingInGovernance',
      defaultMessage:
        '!!!Participating in the Cardano Governance gives you the opportunity to participate in the voting as well as withdraw your staking rewards',
    },
    goToGovernance: {
      id: 'governance.goToGovernance',
      defaultMessage: '!!!GO to governance',
    },
    designatedSomeone: {
      id: 'governance.designatedSomeone',
      defaultMessage:
        '!!!You are designating someone else to cast your vote on your behalf for all proposals now and in the future.',
    },
    delegateToYoroi: {
      id: 'governance.delegateToYoroi',
      defaultMessage:
        '!!!Support the Commercial and Technical adoption of the Cardano roadmap.\nPlease note Yoroi is part of the EMURGO Group.',
    },
    yoroiVotingRecordLink: {
      id: 'governance.yoroiVotingRecordLink',
      defaultMessage:
        '!!!See Yoroi’s voting record',
    },
    total: {
      id: 'wallet.send.confirmationDialog.totalLabel',
      defaultMessage: '!!!Total',
    },
    transactionDetails: {
      id: 'uri.verify.dialog.title',
      defaultMessage: '!!!Transaction details',
    },
    operations: {
      id: 'governance.operations',
      defaultMessage: '!!!Operations',
    },
    selectAbstein: {
      id: 'governance.selectAbstein',
      defaultMessage: '!!!Select abstain',
    },
    selectNoConfidenc: {
      id: 'governance.selectNoConfidenc',
      defaultMessage: '!!!Select no confidenc',
    },
    identifyDrep: {
      id: 'governance.identifyDrep',
      defaultMessage: '!!!Identify your preferred DRep and enter their ID below to delegate your vote',
    },
    password: {
      id: 'global.labels.password',
      defaultMessage: '!!!Password',
    },
    wrongPassword: {
      id: 'global.labels.wrongPassword',
      defaultMessage: '!!!Wrong Password',
    },
    back: {
      id: 'global.labels.back',
      defaultMessage: '!!!back',
    },
    confirm: {
      id: 'global.labels.confirm',
      defaultMessage: '!!!confirm',
    },
    incorectFormat: {
      id: 'global.labels.incorectFormat',
      defaultMessage: '!!!Incorrect format',
    },
  })
);

export const useStrings = () => {
  const intl = useIntl();

  return React.useRef({
    delegateToDRep: intl.formatMessage(messages.delegateToDRep),
    delegateToYoroiDRep: intl.formatMessage(messages.delegateToYoroiDRep),
    delegatingToDRep: intl.formatMessage(messages.delegatingToDRep),
    designatingSomeoneElse: intl.formatMessage(messages.designatingSomeoneElse),
    governanceStatus: intl.formatMessage(messages.governanceStatus),
    governanceStatusInfo: intl.formatMessage(messages.governanceStatusInfo),
    abstain: intl.formatMessage(messages.abstain),
    abstainInfo: intl.formatMessage(messages.abstainInfo),
    noConfidence: intl.formatMessage(messages.noConfidence),
    noConfidenceInfo: intl.formatMessage(messages.noConfidenceInfo),
    learnMore: intl.formatMessage(messages.learnMore),
    becomeADrep: intl.formatMessage(messages.becomeADrep),
    drepId: intl.formatMessage(messages.drepId),
    registerGovernance: intl.formatMessage(messages.registerGovernance),
    reviewSelection: intl.formatMessage(messages.reviewSelection),
    statusSelected: status => intl.formatMessage(messages.statusSelected, { status }),
    chooseDrep: intl.formatMessage(messages.chooseDrep),
    designatedSomeone: intl.formatMessage(messages.designatedSomeone),
    transactionDetails: intl.formatMessage(messages.transactionDetails),
    operations: intl.formatMessage(messages.operations),
    selectAbstein: intl.formatMessage(messages.selectAbstein),
    selectNoConfidence: intl.formatMessage(messages.selectNoConfidenc),
    back: intl.formatMessage(messages.back),
    confirm: intl.formatMessage(messages.confirm),
    total: intl.formatMessage(messages.total),
    password: intl.formatMessage(messages.password),
    wrongPassword: intl.formatMessage(messages.wrongPassword),
    identifyDrep: intl.formatMessage(messages.identifyDrep),
    incorectFormat: intl.formatMessage(messages.incorectFormat),
    statusPending: intl.formatMessage(messages.statusPending),
    needAdaForParticipation: intl.formatMessage(messages.needAdaForParticipation),
    thanksForParticipation: intl.formatMessage(messages.thanksForParticipation),
    theTransactionCanTake: intl.formatMessage(messages.theTransactionCanTake),
    participatingInGovernance: intl.formatMessage(messages.participatingInGovernance),
    goToGovernance: intl.formatMessage(messages.goToGovernance),
    goToFaucet: intl.formatMessage(globalMessages.goToFaucetButton),
    notEnoughMoneyToSendError: intl.formatMessage(globalMessages.notEnoughMoneyToSendError),
    delegateToYoroi: intl.formatMessage(messages.delegateToYoroi),
    yoroiVotingRecordLink: intl.formatMessage(messages.yoroiVotingRecordLink),
  }).current;
};
