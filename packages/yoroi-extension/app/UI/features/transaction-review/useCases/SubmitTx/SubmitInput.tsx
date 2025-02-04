import { Box, Stack, Typography } from '@mui/material';
import { useObserver } from 'mobx-react';
import React from 'react';
import { PasswordInput } from '../../../../components';
import { useTxReviewModal } from '../../module/ReviewTxProvider';

export const SubmitInput = () => {
  const { inputState } = useTxReviewModal();
  console.log('inputState', inputState);
  return useObserver(() => (
    <Stack sx={{ height: '100%', mt: '24px', p: '24px' }} direction="column">
      <Typography variant="body1" color="ds.text_gray_medium" mb="16px">
        Enter password to sign this transaction
      </Typography>
      <Box>
        <PasswordInput
          label="Passsword"
          id="outlined-adornment-password"
          onChange={inputState.onChange}
          // value={inputState.value}
          error={inputState.error}
          helperText={inputState.error ? 'Wrong Password' : ' '}
          // disabled={formLoading}
        />
      </Box>
    </Stack>
  ));
};
