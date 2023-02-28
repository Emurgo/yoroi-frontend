// @flow
import type { Node, ComponentType } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Stack, Box, Typography } from '@mui/material'
import { CREATE_WALLET_SETPS } from './steps';

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
|};

const steps = [
  {
    id: CREATE_WALLET_SETPS.LEARN_ABOUT_RECOVERY_PHRASE,
    message: messages.firstStep,
  },
  {
    id: CREATE_WALLET_SETPS.SAVE_RECOVERY_PHRASE,
    message: messages.secondStep,
  },
  {
    id: CREATE_WALLET_SETPS.VERIFY_RECOVERY_PHRASE,
    message: messages.thirdStep,
  },
  {
    id: CREATE_WALLET_SETPS.ADD_WALLET_DETAILS,
    message: messages.forthStep,
  },
];

function CreateWalletSteps(props: Props & Intl): Node {
  const { intl, currentStep } = props;

  return (
    <Box>
      <Stack direction='row' alignItems='center' justifyContent='center' gap='24px' mt='24px' mb='48px'>
        {steps.map(({ id, message }, idx) => {
          const stepColor = currentStep === id ? 'primary.200' : 'grey.400';
          return (
            <Stack direction='row' alignItems='center' justifyContent='center' key={id}>
              <Box
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
                }}
              >
                <Typography variant='body2' fontWeight={500} color={stepColor}>
                  {idx + 1}
                </Typography>
              </Box>
              <Typography variant='body1' color={stepColor} fontWeight={500}>
                {intl.formatMessage(message)}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}

export default (injectIntl(observer(CreateWalletSteps)) : ComponentType<Props>);