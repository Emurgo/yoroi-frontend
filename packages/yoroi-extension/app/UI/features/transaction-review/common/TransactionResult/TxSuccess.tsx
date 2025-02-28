import { Button, Stack, Typography } from '@mui/material';
import React from 'react';
import { useNavigateTo } from '../hooks/useNavigateTo';
import { SuccessIlustration } from './SuccessIlustration';

export const TxSuccess = () => {
  const navigate = useNavigateTo();
  return (
    <Stack width="100%" alignItems="center" pt="143px" sx={{ maxWidth: '500px', margin: '0 auto' }}>
      <SuccessIlustration />
      <Typography variant="h5" fontWeight="500" mt="8px">
        Transaction signed
      </Typography>
      <Typography variant="body1" color="ds.gray_gray_medium" mt="8px">
        It may take a few minutes to display it in the list of wallet transactions.
      </Typography>

      <Typography variant="body1" mt="8px" color="ds.text_gray_low" textAlign="center" mb="16px">
        It may take a few minutes to display it in the list of wallet transactions.{' '}
      </Typography>
      <Button
        //  @ts-ignore
        variant="primary"
        onClick={() => {
          navigate.walletTransactions();
        }}
      >
        Close
      </Button>
    </Stack>
  );
};
