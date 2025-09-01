import { Box, Link, Stack, Typography } from '@mui/material';
import { useEffect } from 'react';
import { PasswordInput } from '../../../../components';
import { useTxReviewModal } from '../../module/ReviewTxProvider';
import { Ilustration } from './Ilustration';
import { useStrings } from '../../common/hooks/useStrings';
import { RESTORE_WALLET_HELP_URL } from '../../../../common/constants';

export const SubmitInput = () => {
  const { inputError, changePasswordInputValue, passswordInput, setInputError, walletType } = useTxReviewModal();
  const strings = useStrings();

  useEffect(() => {
    setInputError({ type: 'setInputError', inputError: false });
  }, [passswordInput]);

  if (walletType === 'trezor' || walletType === 'ledger') {
    return (
      <Stack direction="column" height="100%" justifyContent="center" alignItems="center" p="24px">
        <Ilustration />
        <Typography color="ds.text_gray_medium" fontSize="16px" mt="16px" mb="8px">
          {strings.confirmHardware}
        </Typography>
        <Typography color="ds.text_gray_low" variant="body1" textAlign="center">
          {strings.takeHardwareWallet}
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack sx={{ height: '100%', mt: '24px', p: '24px' }} direction="column">
      <Typography variant="body1" color="ds.text_gray_medium" mb="16px">
        {strings.enterPassword}
      </Typography>
      <Box>
        <PasswordInput
          label={strings.password}
          id="txReview:submitTransaction-password-input"
          onChange={e => {
            changePasswordInputValue({ type: 'changeInputValue', passswordInput: e.target.value });
          }}
          value={passswordInput} // Use local state to ensure reactivity
          error={inputError}
          helperText={inputError ? strings.wrongPassword : ' '}
        />
      </Box>
      <Stack sx={{ height: '100%' }} direction="column" alignItems="center" justifyContent="flex-end">
        <Typography variant="body1" textAlign={'center'}>
          {strings.forgotPassword}
          &nbsp;
          <Link href={RESTORE_WALLET_HELP_URL} target="_blank" rel="noopener noreferrer">
            {strings.learnMore}
          </Link>
          &nbsp;
          {strings.howToRestorePassword}
        </Typography>
      </Stack>
    </Stack>
  );
};
