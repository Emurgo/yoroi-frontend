// @flow
import { useState } from 'react';
import type { Node, ComponentType } from 'react';
import { defineMessages, injectIntl, FormattedHTMLMessage } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Stack, Typography, Box } from '@mui/material'
import StepController from './StepController';
import type {
  NetworkRow,
} from '../../../api/ada/lib/storage/database/primitives/tables';

const messages: * = defineMessages({
  description: {
    id: 'wallet.create.selectNetwork.description',
    defaultMessage: 'Pick a <strong>network</strong> you want to create a wallet on.',
  },
});

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type Props = {|
    selectedNetwork: void | $ReadOnly<NetworkRow>,
    setSelectedNetwork(network: $ReadOnly<NetworkRow>): void,
|};

function SelectNetworkStep(props: Props & Intl): Node {
  const { selectedNetwork, setSelectedNetwork } = props;

  return (
    <Stack alignItems='center' justifyContent='center'>
      <Stack direction='column' alignItems='left' justifyContent='center' maxWidth='700px'>
        <Stack mb='8px' flexDirection='row' alignItems='center' gap='6px'>
          <Typography>
            <FormattedHTMLMessage {...messages.description} />
          </Typography>
        </Stack>

        <StepController
        //   goNext={goNextStepCallback()}
        //   goBack={() => setCurrentStep(CREATE_WALLET_SETPS.LEARN_ABOUT_RECOVERY_PHRASE)}
        />
      </Stack>
    </Stack>
  )
}

export default (injectIntl(observer(SelectNetworkStep)) : ComponentType<Props>);