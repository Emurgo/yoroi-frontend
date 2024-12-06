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
  })
);

export const useStrings = () => {
  const { intl } = useIntl();
  console.log('useStrings intlintl', intl);
  return React.useRef({
    copyToClipboard: intl.formatMessage(messages.copyToClipboard),
    copied: intl.formatMessage(messages.copied),
  }).current;
};
