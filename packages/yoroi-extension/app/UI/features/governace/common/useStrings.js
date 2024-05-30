import React from 'react';
import { defineMessages, IntlProvider } from 'react-intl';
import { useIntl } from '../../../context/IntlProvider';

export const messages = Object.freeze(
  defineMessages({
    delegateToDRep: {
      id: 'gouvernace.delegateToDRep',
      defaultMessage: '!!!Delegate to a DRep',
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
    designatingSomeoneElse: intl.formatMessage(messages.designatingSomeoneElse),
  }).current;
};
