import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { IconWrapper, Icons } from '../icons';

type StepStates = 'current' | 'completed' | 'completed-current' | 'next' | 'error';

type Step = {
  label: string;
  disabled: boolean;
  onClick: () => void;
  state: StepStates;
};

type Props = {
  steps: Step[];
};

const getColorByState = (state: StepStates) => {
  switch (state) {
    case 'current':
    case 'completed-current':
      return {
        border: 'ds.primary_500',
        text: 'ds.bg_color_contrast_high',
        bg: 'ds.primary_500',
      };
    case 'completed':
      return {
        border: 'ds.primary_300',
        text: 'ds.bg_color_contrast_high',
        bg: 'ds.primary_300',
      };
    case 'next':
      return {
        border: 'ds.text_gray_min',
        text: 'ds.text_gray_min',
        bg: 'ds.bg_color_contrast_high',
      };
    case 'error':
      return {
        border: 'ds.sys_magenta_500',
        text: 'ds.bg_color_contrast_high',
        bg: 'ds.sys_magenta_500',
      };
  }
};

function Stepper(props: Props): React.ReactNode {
  const { steps } = props;

  return (
    <Stack direction="row" alignItems="center" justifyContent="center" mt="14px" py="24px" gap="24px">
      {steps.map(({ label, state, disabled, onClick }, idx) => {
        const stepIndex = idx + 1;
        const isCurrentStep = state === 'current' || state === 'completed-current';
        const isCompletedStep = state === 'completed' || state === 'completed-current';
        const color = getColorByState(state);
        return (
          <Stack key={idx} onClick={disabled ? undefined : onClick} display="flex" direction="row" alignItems="center" gap="8px">
            <Box
              component="div"
              sx={{
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '0',
                borderRadius: '50%',
                padding: '0',
                border: '2px solid',
                borderColor: color.border,
                color: color.text,
                bgcolor: color.bg,
              }}
              id={isCurrentStep ? 'currentStepButton' : isCompletedStep ? 'completedStepButton' : 'disabledStepButton'}
            >
              {isCompletedStep ? (
                <IconWrapper
                  sx={{ transform: 'translateY(-2px)' }}
                  color={color.text}
                  width="18px"
                  height="18px"
                  icon={Icons.Tick}
                />
              ) : (
                stepIndex
              )}
            </Box>
            <Typography variant="body1" color={color.border} fontWeight="500" lineHeight="22px">
              {label}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}

export default Stepper;
