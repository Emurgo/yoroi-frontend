import React from 'react';
import { Stack, Typography, Button } from '@mui/material';
import { FailedIlustration } from './FailedIlustration';
import { FormattedMessage } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';

export const TransactionFailed = () => {
  return (
    <Stack alignItems="center" mt="110px">
      <FailedIlustration />
      <Typography variant="h5" fontWeight="500" mt={4} mb={1}>
        <FormattedMessage {...globalMessages.transactionFailed} />
      </Typography>
      <Typography variant="body1" mb={2} color="ds.text_gray_medium">
        <FormattedMessage {...globalMessages.transactionFailedInfo} />
      </Typography>
      <Button variant="primary">
        <FormattedMessage {...globalMessages.tryAgain} />
      </Button>
    </Stack>
  );
};
