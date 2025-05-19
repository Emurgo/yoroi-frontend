import React from 'react';
import { RegistrationStepper } from './RegistrationStepper';
import { Button, Box, Typography, Stack } from '@mui/material';
import { useStrings } from '../hooks/useStrings';
import { PinInput } from '../../../../components/Input/PinInput';

type Props = {
  handleNextStep: () => void;
  handlePreviousStep: (step: number) => void;
};

export const PinStep = ({ handleNextStep, handlePreviousStep }: Props) => {
  const strings = useStrings();
  return (
    <Stack direction="column" gap="24px" height="100%" pb="24px">
      <RegistrationStepper currentStep={1} onStepClick={handlePreviousStep} />
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

        <PinInput value="1234" length={4} />
      </Box>
      <Box>
        <Button
          // @ts-ignore
          variant="primary"
          fullWidth
          onClick={handleNextStep}
        >
          {strings.pinStepButton}
        </Button>
      </Box>
    </Stack>
  );
};
