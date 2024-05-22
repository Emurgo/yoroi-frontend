// @flow
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { injectIntl, defineMessages } from 'react-intl';
import type { ComponentType, Node } from 'react';
import { useState } from 'react';
import { connectorMessages } from '../../../i18n/global-messages';
import { Box, styled } from '@mui/system';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { observer } from 'mobx-react';
import { Tab, Typography } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import environment from '../../../environment';

type Props = {|
  connectionContent: Node,
  utxosContent: Node,
  detailsContent: Node,
  isDataSignin: boolean,
|};

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

const messages = defineMessages({
  details: { id: 'connector.signIn.tabs.details', defaultMessage: '!!!Details' },
  utxos: { id: 'connector.signIn.tabs.utxos', defaultMessage: '!!!UTxOs' },
  connection: { id: 'connector.signIn.tabs.connection', defaultMessage: '!!!Connection' },
});

function SignTxTabs({
  connectionContent,
  utxosContent,
  detailsContent,
  isDataSignin,
  intl,
}: Props & Intl): Node {
  const [value, setValue] = useState(0);
  const match = useMediaQuery('(min-width:1441px)');

  const handleChange = (event, newValue) => setValue(newValue);

  const tabs = [
    { id: 0, label: intl.formatMessage(messages.details), component: detailsContent },
    { id: 1, label: intl.formatMessage(messages.utxos), component: utxosContent },
    { id: 2, label: intl.formatMessage(messages.connection), component: connectionContent },
  ];

  const isTestEnv = environment.isNightly() || environment.isTest();

  return (
    <Background>
      <Typography component="div" color="#242838" variant="h4" align="center" my="32px">
        {intl.formatMessage(connectorMessages[isDataSignin ? 'signData' : 'signTransaction'])}
      </Typography>
      <TabContext value={value}>
        <Box
          sx={{
            backgroundColor: 'var(--yoroi-palette-common-white)',
            marginLeft: '32px',
            marginRight: '32px',
          }}
        >
          <TabList
            sx={{
              width: match ? '640px' : '480px',
              boxShadow: 'none',
              '&.MuiTabs-indicator': { height: '2px' },
            }}
            textColor="primary"
            indicatorColor="primary"
            onChange={handleChange}
            aria-label="Staking tabs"
          >
            {tabs.map(
              ({ label, component, id }) =>
                component !== null && (
                  <StyledTab
                    key={id}
                    disableRipple
                    label={
                      <Typography component="div" variant="body1" fontWeight={500}>
                        {label}
                      </Typography>
                    }
                    value={id}
                  />
                )
            )}
          </TabList>
          <div style={{ backgroundColor: '#DCE0E9', height: '1px', width: '100%' }} />
        </Box>
        {tabs.map(
          ({ component, id }) =>
            component !== null && (
              <TabPanel
                sx={{
                  height: isTestEnv
                    ? 'calc(100vh - 306px - 46px)' // 46px for nightly banner
                    : 'calc(100vh - 306px)',
                  overflowY: 'scroll',
                  margin: 'auto',
                  boxShadow: 'none',
                  backgroundColor: 'var(--yoroi-palette-common-white)',
                  p: '32px',
                  pr: '12px',
                  width: match ? '640px' : '480px',
                }}
                value={id}
                key={id}
              >
                {component}
              </TabPanel>
            )
        )}
      </TabContext>
    </Background>
  );
}

export default (injectIntl(observer(SignTxTabs)): ComponentType<Props>);

const Background = styled(Box)({ backgroundColor: 'var(--yoroi-palette-common-white)' });

const StyledTab = styled(Tab)({
  '&.MuiTab-root': {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: '11px',
    paddingBottom: '11px',
    marginRight: '24px',
    minWidth: 0,
  },
  '&.MuiTab-root:hover': {
    color: '#3154CB',
  },
});
