import React from 'react';
import { defineMessages, IntlProvider } from 'react-intl';
import { useIntl } from '../../../context/IntlProvider';

export const messages = Object.freeze(
  defineMessages({
    governanceStatus: {
      id: 'gouvernace.governanceStatus',
      defaultMessage: '!!!Governance status',
    },
    governanceStatusInfo: {
      id: 'gouvernace.governanceStatusInfo',
      defaultMessage:
        '!!!You have selected undefined as your governance status. You can change it at any time by clicking in the card bellow',
    },
    abstain: {
      id: 'gouvernace.abstain',
      defaultMessage: '!!!Abstain',
    },
    abstainInfo: {
      id: 'gouvernace.abstainInfo',
      defaultMessage: '!!!You are choosing not to cast a vote on all proposals now and in the future.',
    },
    noConfidence: {
      id: 'gouvernace.noConfidence',
      defaultMessage: '!!!No Confidence',
    },
    noConfidenceInfo: {
      id: 'gouvernace.noConfidenceInfo',
      defaultMessage: '!!!You are expressing a lack of trust for all proposals now and in the future.',
    },
    learnMore: {
      id: 'gouvernace.learnMore',
      defaultMessage: '!!!Learn more About Governance',
    },
    becomeADrep: {
      id: 'gouvernace.becomeADrep',
      defaultMessage: '!!!Want to became a Drep?',
    },
    drepId: {
      id: 'gouvernace.drepId',
      defaultMessage: '!!!Drep ID:',
    },
    delegateToDRep: {
      id: 'gouvernace.delegateToDRep',
      defaultMessage: '!!!Delegate to a DRep',
    },
    delegateingToDRep: {
      id: 'gouvernace.delegateingToDRep',
      defaultMessage: '!!!Delegating to a DRep',
    },
    designatingSomeoneElse: {
      id: 'gouvernace.designatingSomeoneElse',
      defaultMessage:
        '!!!You are designating someone else to cast your vote on your behalf for all proposals now and in the future.',
    },
  })
);

export const useStrings = () => {
  const { intl } = useIntl();
  return React.useRef({
    delegateToDRep: intl.formatMessage(messages.delegateToDRep),
    delegateingToDRep: intl.formatMessage(messages.delegateingToDRep),
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
  }).current;
};
