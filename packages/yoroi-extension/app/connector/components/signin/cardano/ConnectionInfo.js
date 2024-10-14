// @flow
import type { Node, ComponentType } from 'react';
import type { WhitelistEntry } from '../../../../../chrome/extension/connector/types';
import type { ConnectorIntl } from '../../../types';
import { defineMessages, injectIntl } from 'react-intl';
import { Box, Typography } from '@mui/material';
import ConnectedWallet from '../../connect/ConnectedWallet';
import { ReactComponent as NoDappIcon } from '../../../../assets/images/dapp-connector/no-dapp.inline.svg';
import { connectorMessages } from '../../../../i18n/global-messages';
import type { WalletState } from '../../../../../chrome/extension/background/types';

const messages: Object = defineMessages({
  connectedTo: {
    id: 'connector.signin.connectedTo',
    defaultMessage: '!!!Connected To',
  },
});


type Props = {|
  connectedWebsite: ?WhitelistEntry,
  connectedWallet: WalletState,
|};

function ConnectionInfo({ intl, connectedWebsite, connectedWallet }: Props & ConnectorIntl): Node {
  const url = connectedWebsite?.url ?? '';
  const faviconUrl = connectedWebsite?.image ?? '';

  return (
    <Box>
      <Typography component="div" color="#4A5065" variant="body1" fontWeight={500} mb="16px">
        {intl.formatMessage(messages.connectedTo)}
      </Typography>
      <Box display="flex" alignItems="center">
        <Box
          sx={{
            marginRight: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '40px',
            height: '40px',
            border: '1px solid #A7AFC0',
            borderRadius: '50%',
            img: { width: '30px' },
          }}
        >
          {faviconUrl != null && faviconUrl !== '' ? (
            <img src={faviconUrl} alt={`${url} favicon`} />
          ) : (
            <NoDappIcon />
          )}
        </Box>
        <Typography component="div" variant="body1" fontWeight="400" color="#242838" id="connectedToUrl">
          {url}
        </Typography>
      </Box>
      <Box mt="32px">
        <Typography component="div" color="#4A5065" variant="body1" fontWeight={500} mb="16px">
          {intl.formatMessage(connectorMessages.fromWallet)}
        </Typography>
        <ConnectedWallet publicDeriver={connectedWallet} />
      </Box>
    </Box>
  );
}

export default (injectIntl(ConnectionInfo): ComponentType<Props>);
