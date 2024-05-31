import React from 'react';
import { Stack, Typography, Button } from '@mui/material';
import { SuccessIlustration } from './SuccessIlustration';
import { useHistory } from 'react-router-dom';
import { ROUTES } from '../../../routes-config';

export const TransactionSubmitted = () => {
  const history = useHistory();
  return (
    <Stack alignItems="center" mt="110px">
      <SuccessIlustration />
      <Typography variant="h5" fontWeight="500" mt={4} mb={1}>
        Transaction submitted
      </Typography>
      <Typography variant="body1" mb={2} color="ds.text_gray_medium">
        Check this transaction in the list of wallet transactions
      </Typography>
      <Button
        variant="primary"
        onClick={() => {
          history.push(ROUTES.WALLETS.TRANSACTIONS);
        }}
      >
        Go to transactions
      </Button>
    </Stack>
  );
};
