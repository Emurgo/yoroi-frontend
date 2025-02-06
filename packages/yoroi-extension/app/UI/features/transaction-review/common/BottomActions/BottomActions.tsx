import { Box, Button, Stack } from '@mui/material';
import React from 'react';
import { useTxReviewModal } from '../../module/ReviewTxProvider';

export const BottomActions = () => {
  const { closeTxReviewModal, changeModalView, modalView, submitTx, passswordInput } = useTxReviewModal();

  console.log('BottomActions', passswordInput);

  if (modalView === 'submitTx') {
    return (
      <Stack direction="row" justifyContent="space-between" p="24px">
        <Button
          //  @ts-ignore
          variant="primary"
          sx={{ width: '100%' }}
          onClick={() => submitTx(passswordInput)}
          disabled={passswordInput === undefined}
        >
          Submit
        </Button>
      </Stack>
    );
  }

  return (
    <Box
      borderTop="1px solid"
      borderColor="ds.gray_200"
      position="absolute"
      bottom={0}
      width="100%"
      sx={{ backgroundColor: 'ds.bg_color_contrast_high' }}
    >
      <Stack direction="row" justifyContent="space-between" p="24px">
        <Button
          sx={{ width: '229px' }}
          //  @ts-ignore
          variant="secondary"
          onClick={() => {
            closeTxReviewModal();
          }}
        >
          Cancel
        </Button>
        <Button
          sx={{ width: '229px' }}
          //  @ts-ignore
          variant="primary"
          onClick={() => {
            changeModalView({ modalView: 'submitTx', title: 'Submit Transaction' });
          }}
        >
          Confirm
        </Button>
      </Stack>
    </Box>
  );
};
