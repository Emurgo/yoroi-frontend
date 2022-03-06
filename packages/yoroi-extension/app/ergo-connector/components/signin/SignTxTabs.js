// @flow
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { injectIntl, defineMessages } from 'react-intl'
import type { ComponentType, Node } from 'react';
import { useState } from 'react';
import globalMessages from '../../../i18n/global-messages';
import { Box, styled } from '@mui/system';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { observer } from 'mobx-react';
import { Tab } from '@mui/material';
import environment from '../../../environment';
import useMediaQuery from '@mui/material/useMediaQuery'

type Props = {|
  overviewContent: Node,
  utxoAddressContent: Node,
|};
type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

const messages = defineMessages({
  utxoAddresses: {
    id: 'connector.signIn.tabs.utxoAddreses',
    defaultMessage: '!!!UTXO addresses',
  },
});

function SignTxTabs({ overviewContent, utxoAddressContent, intl }: Props & Intl): Node {
  const [value, setValue] = useState(0);
  const match = useMediaQuery('(min-width: 700px)')
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const tabs = [
    {
      id: 0,
      label: intl.formatMessage(globalMessages.overview),
      component: overviewContent,
    },
    {
      id: 1,
      label: intl.formatMessage(messages.utxoAddresses),
      component: utxoAddressContent,
    },
  ];

  return (
    <Background>
      <TabContext value={value}>
        <Box
          sx={match && {
            backgroundColor: 'var(--yoroi-palette-common-white)',
            boxShadow: '0 4px 6px 0 #DEE2EA, 0 1px 2px 0 rgba(222,226,234,0.82), 0 2px 4px 0 rgba(222,226,234,0.74)'
          }}
        >
          <TabList
            sx={{
              '& .MuiTabs-indicator': { height: '4px' },
              width: match ? '600px' : 'auto',
              margin: 'auto',
              boxShadow: 'none',
            }}
            onChange={handleChange}
            aria-label="Staking tabs"
          >
            {tabs.map(({ label, id }) => (
              <StyledTab label={label} value={id} />
            ))}
          </TabList>
        </Box>
        {tabs.map(({ component, id }) => (
          <TabPanel
            sx={{
              height: environment.isNightly() || environment.isTest() ? 'calc(84vh - 55px)': '84vh',
              overflowY: 'scroll',
              width: match ? '600px' : 'auto',
              margin: 'auto',
            }}
            value={id}
          >
            {component}
          </TabPanel>
        ))}
      </TabContext>
    </Background>
  );
}

export default (injectIntl(observer(SignTxTabs)): ComponentType<Props>);

const Background = styled(Box)({
  backgroundColor: 'var(--yoroi-palette-common-white)',
});

const StyledTab = styled(Tab)({
  '&.MuiTabs-root': {
    boxShadow:
      '0 4px 6px 0 #DEE2EA, 0 1px 2px 0 rgba(222,226,234,0.82), 0 2px 4px 0 rgba(222,226,234,0.74)',
  },
  '&.Mui-selected': {
    fontWeight: 700,
  },
  '&.MuiTab-root': {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: '24px',
    paddingBottom: '8px',
    marginLeft: '35px',
  },
});
