import { Button, Stack, Typography } from '@mui/material';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import { useNavigateTo } from '../../features/governace/common/useNavigateTo';
import { FailedIlustration } from './FailedIlustration';

export const TransactionFailed = () => {
  const navigate = useNavigateTo();
  return (
    <Stack alignItems="center" mt="110px">
      <FailedIlustration />
      <Typography variant="h5" fontWeight="500" mt={4} mb={1}>
        <FormattedMessage {...globalMessages.transactionFailed} />
      </Typography>
      <Typography variant="body1" mb={2} color="ds.text_gray_medium">
        <FormattedMessage {...globalMessages.transactionFailedInfo} />
      </Typography>
      {/* @ts-ignore */}
      <Button variant="primary" onClick={() => navigate.selectStatus()}>
        <FormattedMessage {...globalMessages.tryAgain} />
      </Button>
    </Stack>
  );
};
