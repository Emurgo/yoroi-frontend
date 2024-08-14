import React from 'react';
import { Stack, Typography, Button } from '@mui/material';
import { SuccessIlustration } from './SuccessIlustration';
import { useHistory } from 'react-router-dom';
// @ts-ignore
import { ROUTES } from '../../../routes-config';
// @ts-ignore
import globalMessages from '../../../i18n/global-messages';
import { FormattedMessage } from 'react-intl';

export const TransactionSubmitted = () => {
  const history = useHistory();
  return (
    <Stack alignItems="center" mt="110px">
      <SuccessIlustration />
      <Typography variant="h5" fontWeight="500" mt={4} mb={1}>
        <FormattedMessage {...globalMessages.transactionSubmitted} />
      </Typography>
      <Typography variant="body1" mb={2} color="ds.text_gray_low">
        <FormattedMessage {...globalMessages.transactionSubmittedInfo} />
      </Typography>
      <Button
        //  @ts-ignore
        variant="primary"
        onClick={() => {
          history.push(ROUTES.WALLETS.TRANSACTIONS);
        }}
      >
        <FormattedMessage {...globalMessages.goToTransactions} />
      </Button>
    </Stack>
  );
};
