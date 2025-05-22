import React, { useEffect } from 'react';
import { RegistrationStepper } from '../RegistrationStepper';
import { Button, Box, Typography, Stack } from '@mui/material';
import { useStrings } from '../../hooks/useStrings';
import { PinInput } from '../../../../../components/Input/PinInput';
import { useVoting } from '../../hooks/useVoting';

export const PinStep = () => {
  const strings = useStrings();
  const { registrationPin, startRegistration, votingNextStep } = useVoting();

  useEffect(() => {
    startRegistration();
  }, []);

  return (
    <Stack direction="column" gap="24px" height="100%" pb="24px">
      <RegistrationStepper />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          justifyContent: 'space-evenly',
        }}
      >
        <Typography
          component="div"
          textAlign="center"
          pt="24px"
          pb="40px"
          variant="body1"
          color="ds.text_gray_medium"
          dangerouslySetInnerHTML={{ __html: strings.pinStep }}
        />
        <PinInput value={registrationPin} length={4} />
      </Box>
      <Box>
        <Button
          // @ts-ignore
          variant="primary"
          fullWidth
          onClick={votingNextStep}
        >
          {strings.pinStepButton}
        </Button>
      </Box>
    </Stack>
  );
};
