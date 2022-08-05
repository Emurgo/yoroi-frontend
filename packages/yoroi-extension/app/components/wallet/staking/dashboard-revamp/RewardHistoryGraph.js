// @flow
import type { ComponentType, Node } from 'react';
import { useMemo } from 'react';
import { Box, styled } from '@mui/system';
import { Stack, Typography } from '@mui/material';
import { defineMessages, injectIntl } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { getAvatarFromPoolId, groupByPoolName } from '../utils';
import RewardGraphClean from './RewardGraphClean';
import InvalidURIImg from '../../../../assets/images/uri/invalid-uri.inline.svg';
import ErrorBlock from '../../../widgets/ErrorBlock';
import VerticallyCenteredLayout from '../../../layout/VerticallyCenteredLayout';
import LoadingSpinner from '../../../widgets/LoadingSpinner';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';

type RewardHistoryItemProps = {|
  poolId: string,
  poolName: string,
  poolAvatar: string,
  historyList: Array<{|
    type: string,
    date: string,
    balance: string,
  |}>,
|};
type Intl = {| intl: $npm$ReactIntl$IntlShape |};

export const RewardHistoryItem = ({
  poolId,
  poolName,
  poolAvatar,
  historyList,
}: RewardHistoryItemProps): Node => {
  const avatarGenerated = getAvatarFromPoolId(poolId);

  return (
    <Accordion>
      <AccordionSummary aria-controls={poolId + '-content'} id={poolId + '-header'}>
        <Box>
          <Box display="block">
            <Typography color="var(--yoroi-palette-gray-600)">Stake Pool</Typography>
          </Box>
          <Box display="flex">
            <AvatarWrapper>
              {poolAvatar != null ? (
                <AvatarImg src={poolAvatar} alt="stake pool logo" />
              ) : (
                <AvatarImg src={avatarGenerated} alt="stake pool logo" />
              )}
            </AvatarWrapper>
            <Typography>{poolName}</Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing="22px">
          {historyList.map(({ type, date, balance }, idx) => (
            // eslint-disable-next-line react/no-array-index-key
            <Box key={idx} display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography mb="2px" color="var(--yoroi-palette-gray-900)">
                  {type}
                </Typography>
                <Typography variant="body2" color="var(--yoroi-palette-gray-600)">
                  {date}
                </Typography>
              </Box>
              <Typography fontWeight={500} variant="body2">
                + {balance}
              </Typography>
            </Box>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

type RewardsGraphData = {|
  +items: ?{|
    totalRewards: Array<GraphItems>,
    perEpochRewards: Array<GraphItems>,
  |},
  +hideYAxis: boolean,
  +error: ?LocalizableError,
|};

type GraphData = {|
  +rewardsGraphData: RewardsGraphData,
|};

type RewardHistoryGraphProps = {|
  graphData: GraphData,
  onOpenRewardList: () => void,
  epochLength: ?number,
|};

const messages = defineMessages({
  epochAxisLabel: {
    id: 'wallet.dashboard.graph.epochAxisLabel',
    defaultMessage: '!!!Epoch ({epochLength} days)',
  },
  singleEpochAxisLabel: {
    id: 'wallet.dashboard.graph.singleEpochAxisLabel',
    defaultMessage: '!!!Epoch (1 day)',
  },
  dayToggleLabel: {
    id: 'wallet.dashboard.graph.dayToggleLabel',
    defaultMessage: '!!!Day (UTC)',
  },
});

function RewardHistoryGraph({
  graphData,
  onOpenRewardList,
  epochLength,
  intl,
}: RewardHistoryGraphProps & Intl): Node {
  function _getEpochLengthLabel(): string {
    if (epochLength == null) {
      return intl.formatMessage(globalMessages.epochLabel);
    }

    return epochLength === 1
      ? intl.formatMessage(messages.singleEpochAxisLabel)
      : intl.formatMessage(messages.epochAxisLabel, { epochLength });
  }

  const { rewardsGraphData } = graphData;
  const rewardList = rewardsGraphData.items?.perEpochRewards;
  const title = intl.formatMessage(globalMessages.rewardHistory);
  return (
    <Box
      p="24px"
      sx={{ height: '278px', display: 'flex', flexFlow: 'column', justifyContent: 'space-between' }}
    >
      <Typography
        as="button"
        variant="body2"
        color="var(--yoroi-palette-secondary-300)"
        display="block"
        marginLeft="auto"
        sx={{ textTransform: 'uppercase' }}
        onClick={onOpenRewardList}
      >
        {title}
      </Typography>
      {rewardsGraphData.error && (
        <div>
          <center>
            <InvalidURIImg />
          </center>
          <ErrorBlock error={rewardsGraphData.error} />
        </div>
      )}
      {!Array.isArray(rewardList) ? (
        <VerticallyCenteredLayout>
          <LoadingSpinner />
        </VerticallyCenteredLayout>
      ) : (
        <RewardGraphClean
          epochTitle={intl.formatMessage(globalMessages.epochLabel)}
          stakepoolNameTitle={intl.formatMessage(globalMessages.stakepoolNameLabel)}
          xAxisLabel={_getEpochLengthLabel()}
          yAxisLabel={intl.formatMessage(globalMessages.rewardHistory)}
          primaryBarLabel={intl.formatMessage(globalMessages.rewardsLabel)}
          data={rewardList}
          hideYAxis={rewardsGraphData.hideYAxis}
        />
      )}
    </Box>
  );
}
export default (injectIntl(RewardHistoryGraph): ComponentType<RewardHistoryTabProps>);
