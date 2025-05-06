import type { WhitelistEntryType, WalletStateType } from '../types';
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useIntl } from '../../../context/IntlProvider';
import { connectorMessages } from '../../../../i18n/global-messages';
import NoDapp from '../../../../UI/components/ilustrations/NoDapp';
import ConnectedWallet from './ConnectedWallet';

interface Props {
  connectedWebsite: WhitelistEntryType | null;
  connectedWallet: WalletStateType;
}

const messages = {
  connectedTo: {
    id: 'connector.signin.connectedTo',
    defaultMessage: '!!!Connected To',
  },
};

const ConnectionInfo: React.FC<Props> = ({ connectedWebsite, connectedWallet }) => {
  const { intl } = useIntl();
  const url = connectedWebsite?.url ?? '';
  const faviconUrl = connectedWebsite?.image ?? '';

  return (
    <Box>
      <Typography component="div" color="ds.gray_700" variant="body1" fontWeight={500} mb="16px">
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
            border: '1px solid',
            borderColor: 'ds.gray_400',
            borderRadius: '50%',
            img: { width: '30px' },
          }}
        >
          {faviconUrl ? <img src={faviconUrl} alt={`${url} favicon`} /> : <NoDapp />}
        </Box>
        <Typography component="div" variant="body1" fontWeight="400" color="ds.gray_900" id="connectedToUrl">
          {url}
        </Typography>
      </Box>
      <Box mt="32px">
        <Typography component="div" color="ds.gray_700" variant="body1" fontWeight={500} mb="16px">
          {intl.formatMessage(connectorMessages.fromWallet)}
        </Typography>
        <ConnectedWallet publicDeriver={connectedWallet} />
      </Box>
    </Box>
  );
};

export default ConnectionInfo;
