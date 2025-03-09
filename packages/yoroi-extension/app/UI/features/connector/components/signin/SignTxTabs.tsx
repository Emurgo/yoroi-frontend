import React, { useState } from 'react';
import { Box, Tab, Typography, useMediaQuery } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { styled } from '@mui/material/styles';
import { observer } from 'mobx-react';
import { FormattedMessage } from 'react-intl';
import { environment } from '../../../../../environment';
import type { SignTxTabsProps } from '../../types/signin';

const Background = styled(Box)({
  backgroundColor: 'var(--yoroi-palette-common-white)',
});

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

const Divider = styled('div')({
  backgroundColor: '#DCE0E9',
  height: '1px',
  width: '100%',
});

export const SignTxTabs: React.FC<SignTxTabsProps> = observer(({
  connectionContent,
  utxosContent,
  detailsContent,
  isDataSignin,
}) => {
  const [value, setValue] = useState<string>('0');
  const match = useMediaQuery('(min-width:1441px)');

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => setValue(newValue);

  const tabs = [
    { 
      id: '0', 
      label: <FormattedMessage id="connector.signIn.tabs.details" />, 
      component: detailsContent 
    },
    { 
      id: '1', 
      label: <FormattedMessage id="connector.signIn.tabs.utxos" />, 
      component: utxosContent 
    },
    { 
      id: '2', 
      label: <FormattedMessage id="connector.signIn.tabs.connection" />, 
      component: connectionContent 
    },
  ];

  const isTestEnv = environment.isNightly() || environment.isTest();

  return (
    <Background>
      <Typography component="div" color="#242838" variant="h4" align="center" sx={{ my: '32px' }}>
        <FormattedMessage 
          id={isDataSignin ? 'connector.signData' : 'connector.signTransaction'} 
        />
      </Typography>
      <TabContext value={value}>
        <Box sx={{
          backgroundColor: 'var(--yoroi-palette-common-white)',
          mx: '32px',
        }}>
          <TabList
            sx={{
              width: match ? '640px' : '480px',
              boxShadow: 'none',
              '&.MuiTabs-indicator': { height: '2px' },
            }}
            textColor="primary"
            indicatorColor="primary"
            onChange={handleChange}
            aria-label="Transaction signing tabs"
          >
            {tabs.map(({ label, component, id }) =>
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
          <Divider />
        </Box>
        {tabs.map(({ component, id }) =>
          component !== null && (
            <TabPanel
              key={id}
              value={id}
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
            >
              {component}
            </TabPanel>
          )
        )}
      </TabContext>
    </Background>
  );
});

export default SignTxTabs; 