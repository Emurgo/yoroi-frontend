// @flow
import type { Node, ComponentType } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Stack, Typography } from '@mui/material'

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
    next(): void,
    back(): void,
|};

function LearnAboutRecoveryPhrase(props: Props & Intl): Node {
    const { intl } = props;

    return (
      <Stack alignItems='center' justifyContent='center'>
        stepper
      </Stack>
    )
}

export default (injectIntl(observer(LearnAboutRecoveryPhrase)) : ComponentType<Props>);