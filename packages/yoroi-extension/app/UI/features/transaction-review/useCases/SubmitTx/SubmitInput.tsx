import { Box, Stack, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { PasswordInput } from '../../../../components';
import { useTxReviewModal } from '../../module/ReviewTxProvider';
import { Ilustration } from './Ilustration';

export const SubmitInput = () => {
  const { inputError, changePasswordInputValue, passswordInput, setInputError, walletType } = useTxReviewModal();
  useEffect(() => {
    setInputError({ type: 'setInputError', inputError: false });
  }, [passswordInput]);

  if (walletType === 'trezor' || walletType === 'ledger') {
    return (
      <Stack direction="column" height="100%" justifyContent="center" alignItems="center" p="24px">
        <Ilustration />
        <Typography color="ds.text_gray_medium" fontSize="16px" mt="16px" mb="8px">
          Confirm on your hardware wallet
        </Typography>
        <Typography color="ds.text_gray_low" variant="body1" textAlign="center">
          Take your hardware wallet device and follow the instructions there. Make sure you confirm a trusted action.{' '}
        </Typography>
      </Stack>
    );
  }

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
