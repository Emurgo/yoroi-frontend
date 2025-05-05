import { Button, Stack, Typography } from '@mui/material';
import React from 'react';
import { FailedIlustration } from './FailedIlustration';
import { useModal } from '../../../../components/modals/ModalContext';

export const TxFail = () => {
  const { closeModal } = useModal();

  return (
    <Stack width="100%" alignItems="center">
      <FailedIlustration />
      <Typography variant="h5" fontWeight="500" mt="42px">
        Transaction failed
      </Typography>
      <Typography variant="body1" mt="8px" color="ds.text_gray_low" textAlign="center" mb="24px">
        Your transaction has not been processed properly due to technical issues.
      </Typography>
      <Button
        //  @ts-ignore
        variant="primary"
        fullWidth
        onClick={() => {
          closeModal();
        }}
        id="txFail-close-button"
      >
        Close
      </Button>
    </Stack>
  );
};
