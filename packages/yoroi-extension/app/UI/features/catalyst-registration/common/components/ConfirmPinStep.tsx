import React, { useState } from 'react';
import { RegistrationStepper } from './RegistrationStepper';
import { Button, Box, Typography, Stack } from '@mui/material';
import { useStrings } from '../hooks/useStrings';
import { TextInput } from '../../../../components';

type Props = {
  handleNextStep: () => void;
  handlePreviousStep: (step: number) => void;
};

export const ConfirmPinStep = ({ handleNextStep, handlePreviousStep }: Props) => {
  const [pin, setPin] = useState('');
  const strings = useStrings();

  const handleSetPin = e => {
    setPin(e.target.value);
  };

  return (
    <Stack direction="column" gap="24px" height="100%" pb="24px">
      <RegistrationStepper currentStep={2} onStepClick={handlePreviousStep} />
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

        <TextInput label={strings.confirmPinInputLabel} value={pin} onChange={handleSetPin} id="confirm-pin" variant="outlined" />
      </Box>
      <Box>
        <Button
          // @ts-ignore
          variant="primary"
          fullWidth
          onClick={handleNextStep}
        >
          {strings.confirmPinStepButton}
        </Button>
      </Box>
    </Stack>
  );
};
