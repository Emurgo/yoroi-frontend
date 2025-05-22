import React, { useState } from 'react';
import { RegistrationStepper } from '../RegistrationStepper';
import { Button, Box, Typography, Stack } from '@mui/material';
import { useStrings } from '../../hooks/useStrings';
import { TextInput } from '../../../../../components';
import { useVoting } from '../../hooks/useVoting';

export const ConfirmPinStep = () => {
  const [pin, setPin] = useState('');
  const strings = useStrings();
  const { registrationPin, votingNextStep } = useVoting();

  const handleSetPin = e => {
    setPin(e.target.value.slice(0, 4));
  };

  const errorPin = pin.length === 4 && pin !== registrationPin;

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
          dangerouslySetInnerHTML={{ __html: strings.confirmPinStep }}
        />

        <TextInput
          error={errorPin}
          helperText={errorPin ? 'Incorrect pin' : ''}
          label={strings.confirmPinInputLabel}
          value={pin}
          onChange={handleSetPin}
          id="confirm-pin"
          variant="outlined"
        />
      </Box>

      <Box>
        <Button
          // @ts-ignore
          variant="primary"
          fullWidth
          onClick={votingNextStep}
          disabled={pin !== registrationPin}
        >
          {strings.confirmPinStepButton}
        </Button>
      </Box>
    </Stack>
  );
};
