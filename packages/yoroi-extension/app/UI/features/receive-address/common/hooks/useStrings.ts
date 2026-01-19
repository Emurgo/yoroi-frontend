import React from 'react';
import { defineMessages } from 'react-intl';
import { useIntl } from 'react-intl';

export const messages = Object.freeze(
  defineMessages({
    enableSettingsTitle: {
      id: 'singleAddress.settings.title',
      defaultMessage: '!!!Single address mode',
    },
    enableSettingsDescription: {
      id: 'singleAddress.settings.description',
      defaultMessage:
        '!!!Single address mode means your wallet will only maintain one address, ' +
        'use it for all transactions both as input and return change, ' +
        'and never generate other addresses. This simplifies interaction with some dApps.',
    },
    walletAddressLabel: {
      id: 'wallet.receive.page.walletAddressLabel',
      defaultMessage: '!!!Your wallet address',
    },
    walletReceiveInstructions: {
      id: 'wallet.receive.page.singleAddress.walletReceiveInstructions',
      defaultMessage: '!!!Share this wallet address to receive payments.',
    },
  })
);

export const useStrings = () => {
  const intl = useIntl();

  return React.useRef({
    enableSettingsTitle: intl.formatMessage(messages.enableSettingsTitle),
    enableSettingsDescription: intl.formatMessage(messages.enableSettingsDescription),
    walletAddressLabel: intl.formatMessage(messages.walletAddressLabel),
    walletReceiveInstructions: intl.formatMessage(messages.walletReceiveInstructions),
  }).current;
};
