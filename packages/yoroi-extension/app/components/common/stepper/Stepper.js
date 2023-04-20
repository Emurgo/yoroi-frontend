// @flow
import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { defineMessages, injectIntl } from 'react-intl';
import { observer } from 'mobx-react';
import { Stack, Box, Typography } from '@mui/material';
import { ReactComponent as StepMarkIcon } from '../../../assets/images/add-wallet/step-mark.inline.svg';
import styles from './Stepper.scss';

const messages: * = defineMessages({
  firstStep: {
    id: 'wallet.create.firstStep',
    defaultMessage: '!!!Learn about recovery phrase',
  },
  secondStep: {
    id: 'wallet.create.secondStep',
    defaultMessage: '!!!Save recovery phrase',
  },
  thirdStep: {
    id: 'wallet.create.thirdStep',
    defaultMessage: '!!!Verify recovery phrase',
  },
  forthStep: {
    id: 'wallet.create.forthStep',
    defaultMessage: '!!!Add wallet details',
  },
});

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type StepProps = {| stepId: string, message: any |};

type Props = {|
  steps: Array<StepProps>,
  currentStep: string,
  setCurrentStep(stepId: string): void,
|};

function Stepper(props: Props & Intl): Node {
  const { intl, steps, currentStep, setCurrentStep } = props;
  const currentStepIdx = steps.findIndex(step => step.stepId === currentStep);
  if (currentStepIdx === -1) throw new Error(`Step to found. Should never happen`);

  return (
    <Box>
      <Stack sx={{ flexDirection: 'row' }} className={styles.stackContainer}>
        {steps.map(({ stepId, message }, idx) => {
          const isCurrentStep = currentStepIdx === idx;
          const isPrevStep = idx < currentStepIdx;
          const isFutureStep = idx > currentStepIdx;
          let stepColor = 'grey.400';
          let cursor = 'pointer';

          if (isCurrentStep) stepColor = 'primary.600';
          else if (isPrevStep) stepColor = 'primary.300';

          if (isFutureStep) cursor = 'not-allowed';

          return (
            <Stack
              sx={{ flexDirection: 'row' }}
              className={styles.stackSteps}
              key={stepId}
              onClick={() => {
                if (isPrevStep) setCurrentStep(stepId);
              }}
            >
              <Box
                component="button"
                className={styles.stackStep}
                sx={{ borderColor: stepColor, cursor }}
              >
                {isPrevStep ? (
                  <StepMarkIcon />
                ) : (
                  <Typography variant="body2" fontWeight={500} color={stepColor}>
                    {idx + 1}
                  </Typography>
                )}
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

export default (injectIntl(observer(Stepper)): ComponentType<Props>);
