import { useSwapRevamp } from '../../module/SwapContextProvider';
import { Stack, Typography } from '@mui/material';
import { useSwapErrorLabel } from '../hooks/useSwapError';

export const ErrorMessage = () => {
  const { swapForm, isLimitOptionsLoading } = useSwapRevamp();
  const code = swapForm.tokenOutInput.error;

  if (!code || isLimitOptionsLoading) {
    return null;
  }

  const message = useSwapErrorLabel()(code);

  return (
    <Stack sx={{ marginTop: '-8px' }}>
      <Typography variant="caption" color="ds.sys_magenta_500">
        {message}
      </Typography>
    </Stack>
  );
};
