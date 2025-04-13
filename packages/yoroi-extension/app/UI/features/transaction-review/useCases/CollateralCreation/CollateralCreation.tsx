import { Button, Stack, Typography, Link } from '@mui/material';
import React from 'react';
import { useTxReviewModal } from '../../module/ReviewTxProvider';
import { Ilustration } from './Ilustration';
import { useStrings } from '../../common/hooks/useStrings';

export const CollateralCreation = () => {
  const strings = useStrings();
  const { closeTxReviewModal, changeModalView } = useTxReviewModal();

  const learnMoreLink = (
    <Link
      href="https://docs.cardano.org/plutus/collateral-mechanism"
      target="_blank"
      rel="noreferrer"
      sx={{ textDecoration: 'none' }}
    >
      {strings.learnMore}
    </Link>
  );
  return (
    <Stack direction="column" height="100%" justifyContent="space-between" alignItems="center" pt="80px">
      <Stack direction="column" height="100%" justifyContent="center" alignItems="center" px="24px">
        <Ilustration />

        <Typography color="ds.text_gray_medium" variant="body1" textAlign="center" mt="16px">
          {strings.collateralInfo} {learnMoreLink}
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
          {strings.addCollateral}
        </Button>
      </Stack>
    </Stack>
  );
};
