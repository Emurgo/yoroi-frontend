// @flow
import type { ComponentType, Node } from 'react';
import { useState } from 'react';
import { Box, styled } from '@mui/system';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { IconButton, Tab, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import InfoIconSVG from '../../../../assets/images/info-icon.inline.svg';
import CloseIcon from '../../../../assets/images/forms/close.inline.svg';
import DelegatedStakePoolCard from './DelegatedStakePoolCard';
import { defineMessages, injectIntl } from 'react-intl';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import type { PoolData } from '../../../../containers/wallet/staking/SeizaFetcher';
import { Graph as RewardGraph } from '../dashboard/GraphWrapper';

type Props = {|
  delegatedPool: PoolData,
  +undelegate: void | (void => Promise<void>),
|};
type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

const messages = defineMessages({
  alertInfo: {
    id: 'wallet.staking.alertInfo',
    defaultMessage:
      '!!!The first reward to receive takes 3-4 epochs which is equal to 15-20 days, learn more.',
  },
});

function StakingTabs({ delegatedPool, undelegate, intl }: Props & Intl): Node {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const tabs = [
    {
      id: 0,
      label: intl.formatMessage(globalMessages.stakePoolDelegated),
      disabled: false,
      component: (
        <Box>
          <StakePoolAlert message={intl.formatMessage(messages.alertInfo)} />
          <Box py="10px" borderBottom="1px solid var(--yoroi-palette-gray-200)">
            <DelegatedStakePoolCard delegatedPool={delegatedPool} undelegate={undelegate} />
          </Box>

          <RewardGraph
            epochTitle='some cool title'
            stakepoolNameTitle='Poll Name'
            xAxisLabel='X Label'
            yAxisLabel='Y Label'
            primaryBarLabel='Bar Label'
            data={[]}
            hideYAxis={false}
          />
        </Box>
      ),
    },
    {
      id: 1,
      label: 'Reward History',
      disabled: true,
      component: <Box>TODO: Reward History!</Box>,
    },
    {
      id: 2,
      label: 'Epoch progress',
      disabled: true,
      component: <Box>TODO: Epoch progress!</Box>,
    },
  ];

  return (
    <Card>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'var(--yoroi-palette-gray-200)' }}>
          <TabList onChange={handleChange} aria-label="Staking tabs">
            {tabs.map(({ label, id, disabled }) => (
              <StyledTab disabled={disabled} label={label} value={id} />
            ))}
          </TabList>
        </Box>
        {tabs.map(({ component, id }) => (
          <TabPanel value={id}>{component}</TabPanel>
        ))}
      </TabContext>
    </Card>
  );
}

export default (injectIntl(observer(StakingTabs)): ComponentType<Props>);

const Card = styled(Box)({
  backgroundColor: 'var(--yoroi-palette-common-white)',
  borderRadius: '8px',
  flex: '1 1 48.5%',
  maxWidth: '48.5%',
});

const StyledTab = styled(Tab)({
  '&.MuiTab-root': {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: '24px',
    paddingBottom: '20px',
    marginLeft: '24px',
    fontWeight: 500,
  },
});

function StakePoolAlert({ message }: {| message: string |}): Node {
  return (
    <StyledBox>
      <InfoIconSVG />
      <Typography variant="body2" color="var(--yoroi-palette-gray-600)" marginLeft="8px">
        {message}
      </Typography>
      <IconButton>
        <CloseIcon />
      </IconButton>
    </StyledBox>
  );
}
const StyledBox = styled(Box)({
  display: 'flex',
  background: 'var(--yoroi-palette-gray-50)',
  padding: '12px 16px',
  alignItems: 'center',
  marginBottom: '6px',
  borderRadius: '8px',
  '& > svg:first-child': {
    minWidth: '24px',
  },
});
