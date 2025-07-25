import { useSwapRevamp } from '../../module/SwapContextProvider';
import { Stack, Typography } from '@mui/material';

export const ErrorMessage = () => {
  const { swapForm } = useSwapRevamp();
  const message = swapForm.tokenOutInput.error;

  if (!message) {
    return null;
  }
  return (
    <Stack sx={{ marginTop: '-8px' }}>
      <Typography variant="caption" color="ds.sys_magenta_500">
        {message}
      </Typography>
    </Stack>
  );
};
