import React from 'react';
import { Box } from '@mui/material';
import Stepper, { StepStates } from '../../../../components/stepper/Stepper';
import { useStrings } from '../hooks/useStrings';
import { ProgressStep, useVoting } from '../hooks/useVoting';

export const RegistrationStepper = () => {
  const strings = useStrings();
  const { currentVotingStep: currentStep, votingPrevStep, walletType } = useVoting();
  return (
    <Box>
      <Stepper
        steps={[
          {
            label: strings.step1Label,
            disabled: currentStep === ProgressStep.GENERATE,
            onClick: votingPrevStep,
            state:
              currentStep > ProgressStep.GENERATE
                ? StepStates.COMPLETED_CURRENT
                : currentStep === ProgressStep.GENERATE
                ? StepStates.CURRENT
                : StepStates.NEXT,
          },
          {
            label: strings.step2Label,
            disabled: currentStep < ProgressStep.REGISTER,
            onClick: votingPrevStep,
            state:
              currentStep > ProgressStep.CONFIRM
                ? StepStates.COMPLETED_CURRENT
                : currentStep === ProgressStep.CONFIRM
                ? StepStates.CURRENT
                : StepStates.NEXT,
          },
          ...(walletType === 'mnemonic'
            ? [
                {
                  label: strings.step3Label,
                  disabled: currentStep < ProgressStep.TRANSACTION,
                  onClick: votingPrevStep,
                  state:
                    currentStep > ProgressStep.REGISTER
                      ? StepStates.COMPLETED_CURRENT
                      : currentStep === ProgressStep.REGISTER
                      ? StepStates.CURRENT
                      : StepStates.NEXT,
                },
              ]
            : []),
          {
            label: strings.step4Label,
            disabled: currentStep < ProgressStep.QR_CODE,
            onClick: votingPrevStep,
            state:
              currentStep > ProgressStep.TRANSACTION
                ? StepStates.COMPLETED_CURRENT
                : currentStep === ProgressStep.TRANSACTION
                ? StepStates.CURRENT
                : StepStates.NEXT,
          },
          {
            label: strings.step5Label,
            disabled: currentStep < ProgressStep.QR_CODE,
            onClick: votingPrevStep,
            state: currentStep === ProgressStep.QR_CODE ? StepStates.COMPLETED_CURRENT : StepStates.NEXT,
          },
        ]}
      />
    </Box>
  );
};
