// @flow
import type { Node, ComponentType } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Stack, Box, Typography } from '@mui/material';
import { RESTORE_WALLET_STEPS } from './steps';

const messages: * = defineMessages({
  firstStep: {
    id: 'wallet.restore.firstStep',
    defaultMessage: '!!!Select wallet type',
  },
  secondStep: {
    id: 'wallet.create.secondStep',
    defaultMessage: '!!!Save recovery phrase',
  },
  thirdStep: {
    id: 'wallet.restore.thirdStep',
    defaultMessage: '!!!Add wallet details',
  },
});

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type Props = {|
  currentStep: string,
  setCurrentStep: function,
|};

const steps = [
  {
    stepId: RESTORE_WALLET_STEPS.SELECT_WALLET_TYPE,
    message: messages.firstStep,
  },
  {
    stepId: RESTORE_WALLET_STEPS.SAVE_RECOVERY_PHRASE,
    message: messages.secondStep,
  },
  {
    stepId: RESTORE_WALLET_STEPS.ADD_WALLET_DETAILS,
    message: messages.thirdStep,
  },
];

function RestoreWalletSteps(props: Props & Intl): Node {
  const { intl, currentStep, setCurrentStep } = props;
  const currentStepIdx = steps.findIndex(step => step.stepId === currentStep);
  if (currentStepIdx === -1) throw new Error(`Step to found. Should never happen`);

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        gap="24px"
        mt="24px"
        mb="48px"
      >
        {steps.map(({ stepId, message }, idx) => {
          const isCurrentStep = currentStepIdx === idx;
          const isPrevStep = idx < currentStepIdx;
          const isFutureStep = idx > currentStepIdx;
          let stepColor = 'grey.400';
          let cursor = 'pointer';

          if (isCurrentStep) stepColor = 'primary.200';
          else if (isPrevStep) stepColor = '#A0B3F2'; // Todo: add the color to the design system

          if (isFutureStep) cursor = 'not-allowed';

          return (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              key={stepId}
              onClick={() => {
                if (isPrevStep) setCurrentStep(stepId);
              }}
            >
              <Box
                component="button"
                sx={{
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: '8px',
                  borderWidth: '2.5px',
                  borderStyle: 'solid',
                  borderColor: stepColor,
                  borderRadius: '50%',
                  transition: 'color 300ms ease',
                  cursor,
                }}
              >
                <Typography variant="body2" fontWeight={500} color={stepColor}>
                  {idx + 1}
                </Typography>
              </Box>
              <Typography sx={{ cursor }} variant="body1" color={stepColor} fontWeight={500}>
                {intl.formatMessage(message)}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}

export default (injectIntl(observer(RestoreWalletSteps)): ComponentType<Props>);
