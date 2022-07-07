// @flow
import type { ComponentType, Node } from 'react';
import { useState } from 'react';
import { Box, styled } from '@mui/system';
import { TabContext, TabList, TabPanel as TabPanelBase } from '@mui/lab';
import { Tab } from '@mui/material';
import { observer } from 'mobx-react';
import { ReactComponent as InfoIconSVG } from '../../../../assets/images/info-icon.inline.svg';
import { ReactComponent as CloseIcon } from '../../../../assets/images/forms/close.inline.svg';
import DelegatedStakePoolCard from './DelegatedStakePoolCard';
import { defineMessages, injectIntl } from 'react-intl';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import type { PoolData } from '../../../../containers/wallet/staking/SeizaFetcher';
import RewardGraph from './RewardsGraph';
import type { GraphData } from '../dashboard/StakingDashboard';
import { EpochProgressCard } from './EpochProgressCard';
import RewardHistoryTab from './RewardHistoryTab';
import type { GraphRewardData } from './RewardHistoryDialog';
import { StakePoolDelegatedTab } from './StakePoolDelegatedTab';

type Props = {|
  delegatedPool: {|
    pool: PoolData,
    undelegate: void | (void => Promise<void>),
  |},
  rewardHistory: {|
    graphData: GraphRewardData,
    onOpenRewardList: () => void,
  |},
  epochProgress: {|
    currentEpoch: number,
    startEpochDate: string,
    endEpochDate: string,
    percentage: number,
  |},
  +epochLength: ?number,
  +graphData: GraphData,
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
  epochAxisLabel: {
    id: 'wallet.dashboard.graph.epochAxisLabel',
    defaultMessage: '!!!Epoch ({epochLength} days)',
  },
  singleEpochAxisLabel: {
    id: 'wallet.dashboard.graph.singleEpochAxisLabel',
    defaultMessage: '!!!Epoch (1 day)',
  },
});

function StakingTabs({
  delegatedPool,
  epochLength,
  epochProgress,
  rewardHistory,
  intl,
  graphData,
}: Props & Intl): Node {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const getEpochLengthLabel: void => string = () => {
    if (epochLength == null) {
      return intl.formatMessage(globalMessages.epochLabel);
    }

    return epochLength === 1
      ? intl.formatMessage(messages.singleEpochAxisLabel)
      : intl.formatMessage(messages.epochAxisLabel, { epochLength });
  };

  const { hideYAxis, items } = graphData.rewardsGraphData;
  const tabs = [
    {
      id: 0,
      label: intl.formatMessage(globalMessages.stakePoolDelegated),
      component: (
        <StakePoolDelegatedTab
          alertMessage={intl.formatMessage(messages.alertInfo)}
          delegatedPool={delegatedPool.pool}
          undelegate={delegatedPool.undelegate}
        />
      ),
    },
    {
      id: 1,
      label: intl.formatMessage(globalMessages.rewardHistory),
      component: (
        <RewardHistoryTab
          graphData={rewardHistory.graphData}
          onOpenRewardList={rewardHistory.onOpenRewardList}
        />
      ),
    },
    {
      id: 2,
      label: intl.formatMessage(globalMessages.epochProgress),
      component: (
        <EpochProgressCard
          // TODO: Remove placeholders
          percentage={epochProgress.percentage}
          days="2.5"
          currentEpoch={epochProgress.currentEpoch}
          startEpochDate={epochProgress.startEpochDate}
          endEpochDate={epochProgress.endEpochDate}
        />
      ),
    },
  ];

  return (
    <Card>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'var(--yoroi-palette-gray-200)' }}>
          <TabList onChange={handleChange} aria-label="Staking tabs">
            {tabs.map(({ label, id }) => (
              <StyledTab key={id + label} label={label} value={String(id)} />
            ))}
          </TabList>
        </Box>
        {tabs.map(({ component, id }) => (
          <TabPanel key={id} value={String(id)}>
            {component}
          </TabPanel>
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
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
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

const TabPanel = styled(TabPanelBase)({
  flex: 'auto',
  overflow: 'auto',
});
