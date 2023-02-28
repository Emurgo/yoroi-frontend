// @flow
import { useEffect, useState } from 'react';
import type { Node, ComponentType } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Stack, Typography } from '@mui/material'
import StepController from './StepController';
import { CREATE_WALLET_SETPS } from './steps';
import SaveRecoveryPhraseTipsDialog from './SaveRecoveryPhraseTipsDialog';

const messages: * = defineMessages({
  description: {
    id: 'wallet.create.firstStep.description',
    defaultMessage: '!!!A recovery phrase is a secret series of words that can be used to recover your Yoroi Wallet. See the video below how to use a recovery phrase.',
  },
});

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type Props = {|
    currentStep: number,
    nextStep(step: string): void,
|};

function LearnAboutRecoveryPhrase(props: Props & Intl): Node {
  const { intl, nextStep } = props;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true)
  }, [])
  
  return (
    <Stack alignItems='center' justifyContent='center'>
      <Stack direction='column' alignItems='center' justifyContent='center' maxWidth='648px'>
        <Typography variant='body1' mb='16px'>
          {intl.formatMessage(messages.description)}
        </Typography>

        <iframe width="100%" height="365px" src="https://www.youtube.com/embed/_ltQayKP5ek" title="Introducing EMURGO" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen style={{ borderRadius: '8px' }} />

        <StepController
          goNext={() => nextStep(CREATE_WALLET_SETPS.SAVE_RECOVERY_PHRASE)}
        />
      </Stack>
      <SaveRecoveryPhraseTipsDialog
        open={open}
        onClose={() => setOpen(false)}
      />
    </Stack>
  );
}

export default (injectIntl(observer(LearnAboutRecoveryPhrase)) : ComponentType<Props>);