import React from 'react';
import { defineMessages } from 'react-intl';
import { useIntl } from 'react-intl';
import globalMessages from '../../../../../i18n/global-messages';

export const messages = Object.freeze(
  defineMessages({
    governanceStatus: {
      id: 'governance.governanceStatus',
      defaultMessage: '!!!Governance status',
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
      defaultMessage: '!!!Want to become a Drep?',
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
        '!!!You have selected {status} as your governance status. You can change it at any time by clicking in the card bellow',
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
      defaultMessage: '!!!Select no confidence',
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

    // NEW STRINGSS

    delegationOptions: {
      id: 'governance.delegationOptions',
      defaultMessage: '!!!Delegation Options',
    },
    chooseDelegationOption: {
      id: 'governance.chooseDelegationOption',
      defaultMessage:
        '!!!Your delegation to DReps helps shaping Cardano’s future. You may change your governance status at any time.',
    },
    exploreOtherDRepsOrAbstain: {
      id: 'governance.exploreOtherDRepsOrAbstain',
      defaultMessage: '!!!Explore other governance options',
    },
    browseAdditionalDelegation: {
      id: 'governance.browseAdditionalDelegation',
      defaultMessage: '!!!Pick another DRep, abstain from voting, or show no confidence',
    },
    learnMoreLabel: {
      id: 'governance.learnMoreLabel',
      defaultMessage: '!!!Learn more about delegation options',
    },
    drepStatus: {
      id: 'governance.drepStatus',
      defaultMessage: '!!!DRep Status',
    },
    backToDashboard: {
      id: 'governance.backToDashboard',
      defaultMessage: '!!!Back to dashboard',
    },
    chooseVotingPower: {
      id: 'governance.chooseVotingPower',
      defaultMessage: '!!!Choose How to Use Your Voting Power',
    },
    delegateLabel: {
      id: 'global.labels.delegate',
      defaultMessage: '!!!Delegate',
    },
    designatedSomeoneElse: {
      id: 'governance.designatedSomeoneElse',
      defaultMessage:
        '!!!You are designating someone else to cast your vote on your behalf for all proposals now and in the future.',
    },
    chooseAbstain: {
      id: 'governance.abstainInfo',
      defaultMessage: '!!!You are choosing not to cast a vote on all proposals now and in the future.',
    },
    chooseNoConfidence: {
      id: 'governance.chooseNoConfidence',
      defaultMessage: '!!!You are expressing a lack of trust for all proposals now and in the future.',
    },
    changeToDrep: {
      id: 'governance.changeToDrep',
      defaultMessage: '!!!Change to DRep',
    },
    delegateToOtherDrep: {
      id: 'governance.delegateToOtherDrep',
      defaultMessage: '!!!Delegate to other DRep',
    },
    delegatingLabel: {
      id: 'governance.delegatingLabel',
      defaultMessage: '!!!Delegating',
    },
    delegationStatus: {
      id: 'governance.delegationStatus',
      defaultMessage: '!!!Delegation status',
    },
    votingPowerInfo: {
      id: 'governance.votingPowerInfo',
      defaultMessage:
        '!!!Your voting power is currently delegated and contributing to Cardano’s decision-making. You remain free to adjust your delegation whenever you choose.',
    },
    delegatingInGovernance: {
      id: 'governance.delegatingInGovernance',
      defaultMessage: '!!!Delegating in Governance',
    },
    dreps: {
      id: 'governance.dreps',
      defaultMessage: '!!!DReps',
    },
    governanceNotRegisteredSubtitle: {
      id: 'governance.notRegisteredSubtitle',
      defaultMessage: '!!!You can pick a DRep using their ID, choose to abstain or show no confidence.',
    },
    governanceDelegationSubtitle: {
      id: 'governance.delegationSubtitle',
      defaultMessage:
        "!!!Your delegation to DReps helps shaping Cardano's future. You may change your governance status at any time.",
    },
    activeDrepsCount: {
      id: 'governance.activeDrepsCount',
      defaultMessage: '!!!Active DReps ({count})',
    },
    searchDrep: {
      id: 'governance.searchDrep',
      defaultMessage: '!!!Search DRep',
    },
    drepColTickerAndName: {
      id: 'governance.drepColTickerAndName',
      defaultMessage: '!!!Ticker and name',
    },
    drepColVotingPower: {
      id: 'governance.drepColVotingPower',
      defaultMessage: '!!!Voting power',
    },
    drepColRegistered: {
      id: 'governance.drepColRegistered',
      defaultMessage: '!!!Registered',
    },
    drepColDelegators: {
      id: 'governance.drepColDelegators',
      defaultMessage: '!!!Delegators',
    },
    drepColRandom: {
      id: 'governance.drepColRandom',
      defaultMessage: '!!!Random',
    },
    viewDetails: {
      id: 'governance.viewDetails',
      defaultMessage: '!!!View details',
    },
    noDrepsFound: {
      id: 'governance.noDrepsFound',
      defaultMessage: '!!!No DReps found',
    },
    legacyDrepId: {
      id: 'governance.legacyDrepId',
      defaultMessage: '!!!Legacy DRep ID (CIP-105)',
    },
    objectives: {
      id: 'governance.objectives',
      defaultMessage: '!!!Objectives',
    },
    motivations: {
      id: 'governance.motivations',
      defaultMessage: '!!!Motivations',
    },
    qualifications: {
      id: 'governance.qualifications',
      defaultMessage: '!!!Qualifications',
    },
    unverifiedMetadataTitle: {
      id: 'governance.unverifiedMetadataTitle',
      defaultMessage: '!!!Unverified DRep metadata',
    },
    unverifiedMetadataMessage: {
      id: 'governance.unverifiedMetadataMessage',
      defaultMessage:
        "!!!This information couldn't be verified against the blockchain and may have been altered. It has been hidden for your safety.",
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
    // New Strings
    delegationOptions: intl.formatMessage(messages.delegationOptions),
    chooseDelegationOption: intl.formatMessage(messages.chooseDelegationOption),
    exploreOtherDRepsOrAbstain: intl.formatMessage(messages.exploreOtherDRepsOrAbstain),
    browseAdditionalDelegation: intl.formatMessage(messages.browseAdditionalDelegation),
    learnMoreLabel: intl.formatMessage(messages.learnMoreLabel),
    drepStatus: intl.formatMessage(messages.drepStatus),
    backToDashboard: intl.formatMessage(messages.backToDashboard),
    chooseVotingPower: intl.formatMessage(messages.chooseVotingPower),
    delegateLabel: intl.formatMessage(messages.delegateLabel),
    designatedSomeoneElse: intl.formatMessage(messages.designatedSomeoneElse),
    chooseAbstain: intl.formatMessage(messages.chooseAbstain),
    chooseNoConfidence: intl.formatMessage(messages.chooseNoConfidence),
    changeToDrep: intl.formatMessage(messages.changeToDrep),
    delegateToOtherDrep: intl.formatMessage(messages.delegateToOtherDrep),
    delegatingLabel: intl.formatMessage(messages.delegatingLabel),
    delegationStatus: intl.formatMessage(messages.delegationStatus),
    votingPowerInfo: intl.formatMessage(messages.votingPowerInfo),
    delegatingInGovernance: intl.formatMessage(messages.delegatingInGovernance),
    dreps: intl.formatMessage(messages.dreps),
    governanceNotRegisteredSubtitle: intl.formatMessage(messages.governanceNotRegisteredSubtitle),
    governanceDelegationSubtitle: intl.formatMessage(messages.governanceDelegationSubtitle),
    activeDrepsCount: (count: number) => intl.formatMessage(messages.activeDrepsCount, { count }),
    searchDrep: intl.formatMessage(messages.searchDrep),
    drepColTickerAndName: intl.formatMessage(messages.drepColTickerAndName),
    drepColVotingPower: intl.formatMessage(messages.drepColVotingPower),
    drepColRegistered: intl.formatMessage(messages.drepColRegistered),
    drepColDelegators: intl.formatMessage(messages.drepColDelegators),
    drepColRandom: intl.formatMessage(messages.drepColRandom),
    viewDetails: intl.formatMessage(messages.viewDetails),
    noDrepsFound: intl.formatMessage(messages.noDrepsFound),
    legacyDrepId: intl.formatMessage(messages.legacyDrepId),
    objectives: intl.formatMessage(messages.objectives),
    motivations: intl.formatMessage(messages.motivations),
    qualifications: intl.formatMessage(messages.qualifications),
    unverifiedMetadataTitle: intl.formatMessage(messages.unverifiedMetadataTitle),
    unverifiedMetadataMessage: intl.formatMessage(messages.unverifiedMetadataMessage),
  }).current;
};
