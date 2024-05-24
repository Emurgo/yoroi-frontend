import React from 'react';
import { Stack, Typography, Button } from '@mui/material';
import { FailedIlustration } from './FailedIlustration';

export const TransactionFailed = () => {
  return (
    <Stack alignItems="center" mt="110px">
      <FailedIlustration />
      <Typography variant="h5" fontWeight="500" mt={4} mb={1}>
        Transaction failed
      </Typography>
      <Typography variant="body1" mb={2} color="ds.text_gray_medium">
        Your transaction has not been processed properly due to technical issues
      </Typography>
      <Button variant="primary">Try again</Button>
    </Stack>
  );
};
