import { Box, Button, Stack } from '@mui/material';
import React from 'react';
import { useTxReviewModal } from '../../module/ReviewTxProvider';

export const BottomActions = () => {
  const { closeTxReviewModal, changeModalView, modalView, inputState } = useTxReviewModal();

  if (modalView === 'submitTx') {
    return (
      <Stack direction="row" justifyContent="space-between" p="24px">
        {/* @ts-ignore */}
        <Button variant="primary" sx={{ width: '100%' }} onClick={inputState.submit}>
          Submit
        </Button>
      </Stack>
    );
  }

  return (
    <Box
      borderTop="1px solid"
      borderColor="ds.bg_color_contrast_medium"
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
