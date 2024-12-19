// @flow
import type { Node, ComponentType } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Stack, Box, Typography, styled } from '@mui/material';
import { CREATE_WALLET_SETPS } from './steps';
import { ReactComponent as StepMarkIcon } from '../../../assets/images/add-wallet/step-mark.inline.svg';

const IconWrapper = styled(Box)(({ theme }) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.bg_color_max,
    },
    '& rect': {
      fill: theme.palette.ds.text_primary_min,
    },
  },
}));

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

type Props = {|
  currentStep: string,
  setCurrentStep(stepId: string): void,
|};

const steps = [
  {
    stepId: CREATE_WALLET_SETPS.LEARN_ABOUT_RECOVERY_PHRASE,
    message: messages.firstStep,
  },
  {
    stepId: CREATE_WALLET_SETPS.SAVE_RECOVERY_PHRASE,
    message: messages.secondStep,
  },
  {
    stepId: CREATE_WALLET_SETPS.VERIFY_RECOVERY_PHRASE,
    message: messages.thirdStep,
  },
  {
    stepId: CREATE_WALLET_SETPS.ADD_WALLET_DETAILS,
    message: messages.forthStep,
  },
];

function CreateWalletSteps(props: Props & Intl): Node {
  const { intl, currentStep, setCurrentStep } = props;
  const currentStepIdx = steps.findIndex(step => step.stepId === currentStep);
  if (currentStepIdx === -1) throw new Error(`Step to found. Should never happen`);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="center" gap="24px" mt="24px" mb="48px">
        {steps.map(({ stepId, message }, idx) => {
          const isCurrentStep = currentStepIdx === idx;
          const isPrevStep = idx < currentStepIdx;
          const isFutureStep = idx > currentStepIdx;
          let stepColor = 'grey.400';
          let cursor = 'pointer';

          if (isCurrentStep) {
            stepColor = 'ds.text_gray_medium';
          } else if (isPrevStep) {
            stepColor = 'ds.text_primary_min';
          }
          if (isFutureStep) {
            stepColor = 'ds.text_gray_min';
            cursor = 'not-allowed';
          }

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
                  borderWidth: isPrevStep ? '0px' : '2px',
                  borderStyle: 'solid',
                  borderColor: isCurrentStep ? 'ds.el_primary_medium' : 'ds.el_gray_min',
                  borderRadius: '50%',
                  transition: 'color 300ms ease',
                  bgcolor: isCurrentStep ? 'ds.text_primary_medium' : 'unset',
                  cursor,
                }}
              >
                {isPrevStep ? (
                  <IconWrapper>
                    <StepMarkIcon />
                  </IconWrapper>
                ) : (
                  <Typography
                    component="div"
                    sx={{
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    variant="body2"
                    fontWeight={500}
                    color={isCurrentStep ? 'ds.bg_color_max' : stepColor}
                  >
                    {idx + 1}
                  </Typography>
                )}
              </Box>
              <Typography
                component="div"
                sx={{ cursor }}
                variant="body1"
                color={isCurrentStep ? 'ds.text_primary_medium' : stepColor}
                fontWeight={500}
              >
                {intl.formatMessage(message)}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}

export default (injectIntl(observer(CreateWalletSteps)): ComponentType<Props>);
