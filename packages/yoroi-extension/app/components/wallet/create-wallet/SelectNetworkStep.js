// @flow
import { useState } from 'react';
import type { Node, ComponentType } from 'react';
import { defineMessages, injectIntl, FormattedHTMLMessage } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Stack, Typography, Box } from '@mui/material';
import StepController from './StepController';
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import YoroiLogo from '../../../assets/images/yoroi-logo-shape-blue.inline.svg';
import { networks } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import styles from './SelectNetworkStep.scss';

const messages: * = defineMessages({
  title: {
    id: 'wallet.create.selectNetwork.title',
    defaultMessage: '!!!Select network',
  },
  description: {
    id: 'wallet.create.selectNetwork.description',
    defaultMessage: '!!!Pick a <strong>network</strong> you want to create a wallet on.',
  },
});

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

type Props = {|
  selectedNetwork: void | $ReadOnly<NetworkRow>,
  setSelectedNetwork(network: $ReadOnly<NetworkRow>): void,
  setCurrentStep(stepId: string): void,
|};

function SelectNetworkStep(props: Props & Intl): Node {
  const { selectedNetwork, setSelectedNetwork, setCurrentStep, intl } = props;

  const networksList = [
    {
      name: 'Cardano Mainnet',
      networkInfo: networks.CardanoMainnet,
    },
    {
      name: 'Cardano Preprod Testnet',
      networkInfo: networks.CardanoPreprodTestnet,
    },
    {
      name: 'Cardano Preview Testnet',
      networkInfo: networks.CardanoPreviewTestnet,
    },
  ];

  return (
    <Stack className={styles.component} alignItems="center" justifyContent="center">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ width: '56px', height: '48px', mb: '38px' }}>
          <img src={YoroiLogo} alt="Yoroi" title="Yoroi" />
        </Box>
        <Typography variant="h3">{intl.formatMessage(messages.title)}</Typography>
      </Box>
      <Stack direction="column" alignItems="left" justifyContent="center">
        <Stack mb="8px" mt="24px" flexDirection="row" alignItems="center" gap="6px">
          <Typography>
            <FormattedHTMLMessage {...messages.description} />
          </Typography>
        </Stack>

        <Stack alignItems="center" justifyContent="center" gap="16px">
          {networksList.map(network => (
            <Box component="button" className={styles.card} key={network.name}>
              <Typography variant="h3">{network.name}</Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}

export default (injectIntl(observer(SelectNetworkStep)): ComponentType<Props>);
