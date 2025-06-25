import { useEffect } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ampli } from '../../../../../../ampli/index';
import { defineMessages, useIntl } from 'react-intl';
import NoDappsConnected from '../../common/components/NoDappsConnected';
import ConnectionRow from '../../common/components/ConnectionRow';
import { useDappConnections } from '../../common/hooks/useDappConnections';
import { observer } from 'mobx-react';

const messages = defineMessages({
  noWebsitesConnected: {
    id: 'connector.connect.noWebsitesConnected',
    defaultMessage: "!!!You don't have any websites connected yet",
  },
  connectedDapps: {
    id: 'connector.connected-dapps.title',
    defaultMessage: '!!!Connected DApps ({dappsCount})',
  },
  walletsLabel: {
    id: 'connector.connected-dapps.walletsLabel',
    defaultMessage: '!!!Wallets',
  },
  dappsLabel: {
    id: 'connector.connected-dapps.dappsLabel',
    defaultMessage: '!!!Dapps',
  }
});

const DappCenterDashboard = observer(() => {
  const theme = useTheme();
  const intl = useIntl();
  //const strings = useStrings();

  useEffect(() => {
    ampli.connectorPageViewed();
  }, []);

  const { cardanoNodes = [] } = useDappConnections();

  const hasNoRestult = cardanoNodes?.length === 0;

  return cardanoNodes.length === 0 || hasNoRestult ? (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
      spacing={theme.spacing(24)}
      sx={{ minHeight: 'calc(100vh - 220px)' }}
    >
      <NoDappsConnected />
    </Stack>
  ) : (
    <Box>
      <Box mb="15px">
        <Typography fontWeight={500} variant="h5" color="ds.text_gray_medium">
          {intl.formatMessage(messages.connectedDapps, { dappsCount: cardanoNodes.length })}
        </Typography>
      </Box>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          gap: '24px',
          py: '12px',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderBottomColor: 'ds.gray_200',
          color: 'ds.gray_600',
        }}
      >
        <Box width="100%">
          <Typography variant="body2">{intl.formatMessage(messages.walletsLabel)}</Typography>
        </Box>
        <Box width="100%">
          <Typography variant="body2">{intl.formatMessage(messages.dappsLabel)}</Typography>
        </Box>
      </Box>
      <Box mt="16px">
        {cardanoNodes.map((node, entryIndex) => (
          <ConnectionRow key={node.url} id={'walletRow_' + entryIndex} {...node} />
        ))}
      </Box>
    </Box>
  );
});

export default DappCenterDashboard;
