// @flow
import { useEffect, useState } from 'react';
import type { Node, ComponentType } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Stack, Box, Typography } from '@mui/material'
import SaveRecoveryPhraseTipsDialog from './SaveRecoveryPhraseTipsDialog';

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
    currentStep: number,
|};

function CreateWalletSteps(props: Props & Intl): Node {
  const { intl, currentStep } = props;
  // steps: [id, label]
  const steps = [
    [1, messages.firstStep],
    [2, messages.secondStep],
    [3, messages.thirdStep],
    [4, messages.forthStep],
  ];

  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true)
  }, [])

  return (
    <Box>
      <Stack direction='row' alignItems='center' justifyContent='center' gap='24px' mt='24px' mb='48px'>
        {steps.map(([stepId, label]) => {
          const stepColor = currentStep === stepId ? 'primary.200' : 'grey.400';
          return (
            <Stack direction='row' alignItems='center' justifyContent='center' key={stepId}>
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
                  {stepId}
                </Typography>
              </Box>
              <Typography variant='body1' color={stepColor} fontWeight={500}>
                {intl.formatMessage(label)}
              </Typography>
            </Stack>
          )
        })}
      </Stack>
      <SaveRecoveryPhraseTipsDialog
        open={open}
        onClose={() => setOpen(false)}
      />
    </Box>
  );
}

export default (injectIntl(observer(CreateWalletSteps)) : ComponentType<Props>);