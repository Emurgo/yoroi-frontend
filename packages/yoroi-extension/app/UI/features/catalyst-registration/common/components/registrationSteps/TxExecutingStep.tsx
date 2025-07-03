import { Box, Stack, Typography , CircularProgress } from '@mui/material';
import { useStrings } from '../../hooks/useStrings';
import { RegistrationStepper } from '../RegistrationStepper';

export const TxExecutingStep = () => {
  const strings = useStrings();

  return (
    <Stack direction="column" gap="24px" height="100%" pb="24px">
      <RegistrationStepper />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        <CircularProgress size={48} />
        <Typography component="div" textAlign="center" variant="body1" color="ds.text_gray_medium">
          {strings.processingLabel}
        </Typography>
        <Typography component="div" textAlign="center" variant="body2" color="ds.text_gray_medium">
          {strings.txGeneration}
        </Typography>
      </Box>
    </Stack>
  );
};
