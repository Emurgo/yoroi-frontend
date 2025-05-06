import { Button, Stack, Typography } from '@mui/material';
import React from 'react';
import { useNavigateTo } from '../hooks/useNavigateTo';
import { SuccessIlustration } from './SuccessIlustration';
import { useModal } from '../../../../components/modals/ModalContext';

export const TxSuccess = () => {
  const navigate = useNavigateTo();
  const { closeModal } = useModal();
  return (
    <Stack width="100%" alignItems="center">
      <SuccessIlustration />
      <Typography variant="h5" fontWeight="500" mt="42px">
        Transaction signed
      </Typography>
      <Typography variant="body1" mt="8px" color="ds.text_gray_low" textAlign="center" mb="24px">
        It may take a few minutes to display it in the list of wallet transactions.{' '}
      </Typography>
      <Button
        //  @ts-ignore
        variant="primary"
        fullWidth
        onClick={() => {
          navigate.walletTransactions();
          closeModal();
        }}
        id="txSuccess-close-button"
      >
        Close
      </Button>
    </Stack>
  );
};
