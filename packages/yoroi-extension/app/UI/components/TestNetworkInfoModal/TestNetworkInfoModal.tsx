import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  subtitile: {
    id: 'settings.general.testnetModal.subtitle',
    defaultMessage:
      '!!!The test networks serve as a platform for the community and developers to test products and experiments without risking real funds on the mainnet',
  },
  keyFeatures: {
    id: 'settings.general.testnetModal.keyFeatures',
    defaultMessage: '!!!Key features of testnet coins:',
  },
  noValue: {
    id: 'settings.general.testnetModal.noValue',
    defaultMessage: '!!!Have no real value.',
  },
  separate: {
    id: 'settings.general.testnetModal.separate',
    defaultMessage: '!!!Are separate from the mainnet.',
  },
  cannotBeSent: {
    id: 'settings.general.testnetModal.cannotBeSent',
    defaultMessage: '!!!Cannot be sent to mainnet wallets.',
  },
  easilyObtainable: {
    id: 'settings.general.testnetModal.easilyObtainable',
    defaultMessage: '!!!Are easily obtainable from Cardano faucets.',
  },
  learnMore: {
    id: 'settings.general.testnetModal.learnMore',
    defaultMessage: '!!!Learn more about networks in Cardano',
  },
  understand: {
    id: 'settings.general.testnetModal.understand',
    defaultMessage: '!!!Learn more about networks in Cardano',
  },
});

export const TestNetworkInfoModal = ({ onClose }) => {
  const intl = useIntl();
  return (
    <Stack>
      <Typography variant="body1" mb="24px">
        {intl.formatMessage(messages.subtitile)}
      </Typography>
      <Stack gap="2px">
        <Typography variant="body1" fontWeight={500}>
          {intl.formatMessage(messages.keyFeatures)}
        </Typography>
        <Stack ml="4px">
          <Typography variant="body1">&#x2022; {intl.formatMessage(messages.noValue)}</Typography>
          <Typography variant="body1">&#x2022; {intl.formatMessage(messages.separate)}</Typography>
          <Typography variant="body1">&#x2022; {intl.formatMessage(messages.cannotBeSent)}</Typography>
          <Typography variant="body1">&#x2022; {intl.formatMessage(messages.easilyObtainable)}</Typography>
        </Stack>
      </Stack>
      {/* <Link mt="8px">{intl.formatMessage(messages.learnMore)}</Link> */}
      {/* @ts-ignore */}
      <Button variant="primary" onClick={onClose} sx={{ mt: '28px' }} id="testNetworkInfoModal-understand-button">
        {intl.formatMessage(messages.understand)}
      </Button>
    </Stack>
  );
};
