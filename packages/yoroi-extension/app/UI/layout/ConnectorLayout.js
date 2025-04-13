import { observer } from 'mobx-react';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '../../routes-config';
import { Stack, Typography, Box, useTheme } from '@mui/material';
import { NETWORK_BADGES } from '../../containers/NavBarContainerRevamp';
import { defineMessages } from 'react-intl';
import YoroiConnectorLogo from '../components/ilustrations/YoroiConnectorLogo';
import { IconWrapper, Icons } from '../components/icons';
import TestnetWarningBanner from '../../components/topbar/banners/TestnetWarningBanner';
import { useIntl } from '../context/IntlProvider';
import environment from '../../environment';

export const messages = defineMessages({
  yoroiDappConnector: {
    id: 'global.connector.yoroiDappConnector',
    defaultMessage: '!!!Yoroi Dapp Connector',
  },
  yoroiConnector: {
    id: 'global.connector.yoroiConnector',
    defaultMessage: '!!!Yoroi Connector',
  },
});

const ConnectorLayout = observer(({ networkId, children }) => {
  const { intl } = useIntl();
  const location = useLocation();
  const theme = useTheme();

  const title = intl.formatMessage(
    location.pathname === ROUTES.SELECT_CASHBACK_WALLET ? messages.yoroiConnector : messages.yoroiDappConnector
  );

  let testnetBadge = null;
  const badge = NETWORK_BADGES[networkId];
  if (badge) {
    testnetBadge = (
      <Box
        sx={{
          borderRadius: '16px',
          paddingLeft: '8px',
          paddingRight: '8px',
          height: '24px',
          lineHeight: '24px', // vertically center text
          color: 'ds.black_static',
        }}
        style={{ backgroundColor: badge.color }}
      >
        {badge.text}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '480px',
        minHeight: '100vh',
        borderRadius: '2px',
        bgcolor: 'ds.bg_color_max',
        boxShadow: '0 2px 5px 3px rgba(0, 0, 0, 0.06)',
        margin: '0 auto',
        '@media screen and (min-width: 1441px)': {
          width: '640px',
        },
      }}
    >
      <TestnetWarningBanner isTestnet={environment.isTest()} />
      <Stack
        direction="row"
        alignItems="center"
        sx={{ height: '56px', color: 'ds.white_static', backgroundImage: theme.palette.ds.bg_gradient_3, padding: '16px 32px' }}
      >
        <Stack direction="row" alignItems="center" sx={{ flex: 1 }}>
          <YoroiConnectorLogo />
          <Stack direction="row" alignItems="center" sx={{ ml: '12px' }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: '16px',
                fontWeight: 500,
                letterSpacing: 0,
                lineHeight: '19px',
                textTransform: 'capitalize',
              }}
            >
              {title}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" sx={{ flex: 1 }}>
            <IconWrapper
              color="ds.white_static"
              icon={Icons.DappConnector}
              iconProps={{ width: '20px', height: '20px', marginLeft: '10px' }}
            />
          </Stack>
          {testnetBadge}
        </Stack>
      </Stack>
      <Box sx={{ position: 'relative' }}>{children}</Box>
    </Box>
  );
});

export default ConnectorLayout;
