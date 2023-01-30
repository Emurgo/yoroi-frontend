import { Box, Typography } from '@mui/material';
import { signTxMessages } from '../SignTxPage';
import ConnectedWallet from '../../connect/ConnectedWallet';
import { ReactComponent as NoDappIcon } from '../../../../assets/images/dapp-connector/no-dapp.inline.svg';
import { connectorMessages } from '../../../../i18n/global-messages';

export default function ConnectionInfoComponent({ intl, connectedWebsite, connectedWallet }) {
  const url = connectedWebsite?.url ?? '';
  const faviconUrl = connectedWebsite?.image ?? '';

  return (
    <Box>
      <Typography color="#4A5065" variant="body1" fontWeight={500} mb="16px">
        {intl.formatMessage(signTxMessages.connectedTo)}
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
        <Typography variant="body1" fontWeight="400" color="#242838">
          {url}
        </Typography>
      </Box>
      <Box mt="32px">
        <Typography color="#4A5065" variant="body1" fontWeight={500} mb="16px">
          {intl.formatMessage(connectorMessages.fromWallet)}
        </Typography>
        <ConnectedWallet publicDeriver={connectedWallet} />
      </Box>
    </Box>
  );
}
