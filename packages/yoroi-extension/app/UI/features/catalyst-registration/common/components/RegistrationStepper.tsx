import React from 'react';
import { Box } from '@mui/material';
import Stepper from '../../../../components/stepper/Stepper';
import { useStrings } from '../hooks/useStrings';

type Props = {
  currentStep: number;
  onStepClick: (step: number) => void;
};

export const RegistrationStepper = ({ currentStep, onStepClick }: Props) => {
  const strings = useStrings();
  return (
    <Box>
      <Stepper
        steps={[
          {
            label: strings.step1Label,
            disabled: currentStep <= 1,
            onClick: () => onStepClick(1),
            state: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'next',
          },
          {
            label: strings.step2Label,
            disabled: currentStep <= 2,
            onClick: () => onStepClick(2),
            state: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'next',
          },
          {
            label: strings.step3Label,
            disabled: currentStep <= 3,
            onClick: () => onStepClick(3),
            state: currentStep > 3 ? 'completed' : currentStep === 3 ? 'current' : 'next',
          },
          {
            label: strings.step4Label,
            disabled: currentStep <= 4,
            onClick: () => onStepClick(4),
            state: currentStep > 4 ? 'completed' : currentStep === 4 ? 'current' : 'next',
          },
          {
            label: strings.step5Label,
            disabled: currentStep <= 5,
            onClick: () => onStepClick(5),
            state: currentStep === 5 ? 'completed-current' : 'next',
          },
        ]}
      />
    </Box>
  );
};
