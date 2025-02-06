import { Box, Stack, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { PasswordInput } from '../../../../components';
import { useTxReviewModal } from '../../module/ReviewTxProvider';

export const SubmitInput = () => {
  const { inputError, changePasswordInputValue, passswordInput, setInputError } = useTxReviewModal();

  useEffect(() => {
    setInputError({ type: 'setInputError', inputError: false });
  }, [passswordInput]);

  return (
    <Stack sx={{ height: '100%', mt: '24px', p: '24px' }} direction="column">
      <Typography variant="body1" color="ds.text_gray_medium" mb="16px">
        Enter password to sign this transaction
      </Typography>
      <Box>
        <PasswordInput
          label="Password"
          id="outlined-adornment-password"
          onChange={e => {
            changePasswordInputValue({ type: 'changeInputValue', passswordInput: e.target.value });
          }}
          value={passswordInput} // Use local state to ensure reactivity
          error={inputError}
          helperText={inputError ? 'Wrong Password' : ' '}
        />
      </Box>
    </Stack>
  );
};
