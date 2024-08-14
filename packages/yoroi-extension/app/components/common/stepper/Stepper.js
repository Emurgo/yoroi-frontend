// @flow
import type { Node, ComponentType } from 'react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { injectIntl } from 'react-intl';
import { observer } from 'mobx-react';
import { Stack, Box, Typography, styled } from '@mui/material';
import { ReactComponent as StepMarkIcon } from '../../../assets/images/add-wallet/step-mark.inline.svg';
import styles from './Stepper.scss';

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type StepProps = {| stepId: string, message: any |};

type Props = {|
  steps: Array<StepProps>,
  currentStep: string,
  setCurrentStep(stepId: string): void,
  sx?: Object,
|};

const IconWrapper = styled(Box)(({ theme, active }) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_normal,
    },
  },
}));

function Stepper(props: Props & Intl): Node {
  const { intl, steps, currentStep, setCurrentStep, sx } = props;
  const currentStepIdx = steps.findIndex(step => step.stepId === currentStep);
  if (currentStepIdx === -1) throw new Error(`Step to found. Should never happen`);

  return (
    <Stack sx={{ flexDirection: 'row', ...sx }} className={styles.stackContainer}>
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
            sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
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
                ...(!isPrevStep
                  ? {
                      borderWidth: '2.5px',
                      borderStyle: 'solid',
                    }
                  : {}),
                bgcolor: isCurrentStep ? 'primary.500' : 'unset',
                borderRadius: '50%',
                transition: 'color 300ms ease',
                cursor,
                borderColor: isCurrentStep ? 'primary.500' : stepColor,
              }}
            >
              {isPrevStep ? (
                <IconWrapper>
                  <StepMarkIcon />
                </IconWrapper>
              ) : (
                <Typography
                  component="div"
                  variant="body2"
                  fontWeight={500}
                  color={isCurrentStep ? 'ds.text_gray_medium' : stepColor}
                  lineHeight="27px"
                >
                  {idx + 1}
                </Typography>
              )}
            </Box>
            <Typography component="div" sx={{ cursor }} variant="body1" color={stepColor} fontWeight={500}>
              {intl.formatMessage(message)}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}

export default (injectIntl(observer(Stepper)): ComponentType<Props>);
