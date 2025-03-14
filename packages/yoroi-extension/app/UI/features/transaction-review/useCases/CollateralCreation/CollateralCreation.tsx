import { Button, Stack, Typography, Link } from '@mui/material';
import React from 'react';
import { useTxReviewModal } from '../../module/ReviewTxProvider';
import { Ilustration } from './Ilustration';

export const CollateralCreation = () => {
  const { closeTxReviewModal, changeModalView } = useTxReviewModal();

  const learnMoreLink = (
    <Link
      href="https://docs.cardano.org/plutus/collateral-mechanism"
      target="_blank"
      rel="noreferrer"
      sx={{ textDecoration: 'none' }}
    >
      Learn more
    </Link>
  );
  return (
    <Stack direction="column" height="100%" justifyContent="space-between" alignItems="center" pt="80px">
      <Stack direction="column" height="100%" justifyContent="center" alignItems="center" px="24px">
        <Ilustration />

        <Typography color="ds.text_gray_medium" variant="body1" textAlign="center" mt="16px">
          Collateral is mandatory when interacting with certain smart contracts on Cardano. ADA will only be deduced from your
          collateral if transaction validation fails. {learnMoreLink}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between" p="24px" gap="24px">
        <Button
          sx={{ width: '229px' }}
          //  @ts-ignore
          variant="secondary"
          onClick={() => {
            closeTxReviewModal();
          }}
        >
          Cancel
        </Button>{' '}
        <Button
          //  @ts-ignore
          variant="primary"
          sx={{ width: '100%' }}
          onClick={() => {
            changeModalView({ modalView: 'transactionReview' });
          }}
        >
          Add collateral
        </Button>
      </Stack>
    </Stack>
  );
};
