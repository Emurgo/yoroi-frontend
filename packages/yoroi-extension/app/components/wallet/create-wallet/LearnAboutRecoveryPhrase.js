// @flow
import type { Node, ComponentType } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Stack, Typography } from '@mui/material'
import StepController from './StepController';

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
|};

function LearnAboutRecoveryPhrase(props: Props & Intl): Node {
    const { intl } = props;

    return (
      <Stack alignItems='center' justifyContent='center'>
        <Stack direction='column' alignItems='center' justifyContent='center' maxWidth='648px'>
          <Typography variant='body1' mb='16px'>
            {intl.formatMessage(messages.description)}
          </Typography>

          <iframe width="100%" height="365px" src="https://www.youtube.com/embed/_ltQayKP5ek" title="Introducing EMURGO" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen style={{ borderRadius: '8px' }} />

          <StepController
            goNext={() => {}}
            goBack={() => {}}
          />
        </Stack>
      </Stack>
    )
}

export default (injectIntl(observer(LearnAboutRecoveryPhrase)) : ComponentType<Props>);