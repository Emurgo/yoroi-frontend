// @flow
import type { Node, ComponentType } from 'react';
import { defineMessages, injectIntl, FormattedHTMLMessage } from 'react-intl';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Stack, Typography, Box } from '@mui/material';
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import YoroiLogo from '../../../assets/images/yoroi-logo-shape-blue.inline.svg';
import { networks } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import styles from './SelectNetworkStep.scss';
import globalMessages from '../../../i18n/global-messages';
import StepController from './StepController';

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
  onSelect: (network: $ReadOnly<NetworkRow>) => void,
  goBack: () => void,
|};

function SelectNetworkStep(props: Props & Intl): Node {
  const { intl, onSelect, goBack } = props;

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
    {
      name: 'Cardano Sancho Testnet',
      networkInfo: networks.CardanoSanchoTestnet,
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
        <Typography component="div" variant="h3" fontWeight={500}>
          {intl.formatMessage(messages.title)}
        </Typography>
      </Box>
      <Stack direction="column" alignItems="center" justifyContent="center" mb="72px">
        <Stack mb="38px" mt="24px" flexDirection="row" alignItems="center" gap="6px">
          <Typography component="div">
            <FormattedHTMLMessage {...messages.description} />
          </Typography>
        </Stack>

        <Stack alignItems="center" justifyContent="center" gap="16px">
          {networksList.map(({ name, networkInfo }) => (
            <Box
              component="button"
              className={styles.networkCard}
              key={name}
              onClick={() => onSelect(networkInfo)}
            >
              <Typography component="div" variant="h3" fontWeight={500}>
                {name}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
      <StepController
        actions={[
          {
            label: intl.formatMessage(globalMessages.backButtonLabel),
            disabled: false,
            onClick: goBack,
            type: 'secondary',
          },
        ]}
      />
    </Stack>
  );
}

export default (injectIntl(observer(SelectNetworkStep)): ComponentType<Props>);
