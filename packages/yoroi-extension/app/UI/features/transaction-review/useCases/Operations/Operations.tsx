import { Button, Stack, Typography } from '@mui/material';
import React from 'react';
import { useTxReviewModal } from '../../module/ReviewTxProvider';
import { OperationIlustration } from './Ilustration';

export const Operations = () => {
  const { changeModalView } = useTxReviewModal();
  return (
    <Stack height="100%" p="24px" direction="column" justifyContent="space-between">
      <Stack gap="54px" height="100%" direction="column" justifyContent="center" alignItems="center">
        <OperationIlustration />
        <Typography variant="body1" color="ds_text_gray_medium">
          You are about to interact with operations, which are key components used in governance and various blockchain
          activities. These include Cardano Governance Certificates, as outlined in CIP-0095, which facilitate governance
          transactions.
        </Typography>
      </Stack>
      <Button
        //  @ts-ignore
        variant="primary"
        sx={{ width: '100%' }}
        onClick={() => {
          changeModalView({ modalView: 'transactionReview' });
        }}
      >
        Ok
      </Button>
    </Stack>
  );
};
