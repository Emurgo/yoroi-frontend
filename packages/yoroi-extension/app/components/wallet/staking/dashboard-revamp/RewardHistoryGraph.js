// @flow
import type { ComponentType, Node } from 'react';
import { Box, styled } from '@mui/system';
import { Button, Stack, Typography } from '@mui/material';
import { injectIntl } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { getAvatarFromPoolId } from '../utils';
import RewardGraphClean from './RewardGraphClean';
import { ReactComponent as InvalidURIImg } from '../../../../assets/images/uri/invalid-uri.inline.svg';
import ErrorBlock from '../../../widgets/ErrorBlock';
import VerticallyCenteredLayout from '../../../layout/VerticallyCenteredLayout';
import LoadingSpinner from '../../../widgets/LoadingSpinner';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import type { GraphData } from '../dashboard/StakingDashboard';

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
            <Typography component="div" color="var(--yoroi-palette-gray-600)">
              Stake Pool
            </Typography>
          </Box>
          <Box display="flex">
            <AvatarWrapper>
              {poolAvatar != null ? (
                <AvatarImg src={poolAvatar} alt="stake pool logo" />
              ) : (
                <AvatarImg src={avatarGenerated} alt="stake pool logo" />
              )}
            </AvatarWrapper>
            <Typography component="div">{poolName}</Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing="22px">
          {historyList.map(({ type, date, balance }, idx) => (
            // eslint-disable-next-line react/no-array-index-key
            <Box key={idx} display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography component="div" mb="2px" color="var(--yoroi-palette-gray-900)">
                  {type}
                </Typography>
                <Typography component="div" variant="body2" color="var(--yoroi-palette-gray-600)">
                  {date}
                </Typography>
              </Box>
              <Typography component="div" fontWeight={500} variant="body2">
                + {balance}
              </Typography>
            </Box>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

const Accordion = styled((props /* AccordionProps */) => (
  <MuiAccordion
    TransitionProps={{ timeout: { exit: 500 } }}
    disableGutters
    elevation={0}
    square
    {...props}
  />
))(() => ({
  borderBottom: `1px solid var(--yoroi-palette-gray-50)`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
  paddingBottom: '16px',
  marginBottom: '16px',
}));

const AccordionDetails = styled(MuiAccordionDetails)(() => ({
  marginTop: '24px',
  padding: 0,
}));

const AvatarImg: any = styled('img')({
  width: '100%',
  background: 'white',
  objectFit: 'scale-down',
});

const AvatarWrapper: any = styled(Box)({
  width: '24px',
  height: '24px',
  minWidth: '24px',
  marginRight: '12px',
  borderRadius: '20px',
  overflow: 'hidden',
});

const ExpandMoreIcon = () => (
  <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0.292893 0.292893C0.683417 -0.0976311 1.31658 -0.0976311 1.70711 0.292893L7 5.58579L12.2929 0.292893C12.6834 -0.0976311 13.3166 -0.0976311 13.7071 0.292893C14.0976 0.683417 14.0976 1.31658 13.7071 1.70711L7.70711 7.70711C7.31658 8.09763 6.68342 8.09763 6.29289 7.70711L0.292893 1.70711C-0.0976311 1.31658 -0.0976311 0.683417 0.292893 0.292893Z"
      fill="#6B7384"
    />
  </svg>
);

const AccordionSummary = styled((props /* AccordionSummaryProps */) => (
  <MuiAccordionSummary expandIcon={<ExpandMoreIcon />} {...props} />
))(() => ({
  padding: 0,
  '.MuiAccordionSummary-content': {
    margin: 0,
  },
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(180deg)',
  },
  '& .MuiCollapse-vertical': {
    transitionDuration: '0.5s',
  },
}));

type RewardHistoryGraphProps = {|
  graphData: GraphData,
  onOpenRewardList: () => void,
|};

function RewardHistoryGraph({
  graphData,
  onOpenRewardList,
  intl,
}: RewardHistoryGraphProps & Intl): Node {
  const { rewardsGraphData } = graphData;
  const rewardList = rewardsGraphData.items?.perEpochRewards;
  const title = intl.formatMessage(globalMessages.rewardHistory);
  return (
    <Box p="24px" sx={{ display: 'flex', flexFlow: 'column', justifyContent: 'space-between' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <Typography component="div" variant="body1" fontWeight={500}>
          {title}
        </Typography>
        <Button
          color="primary"
          size="medium"
          onClick={onOpenRewardList}
          sx={{ lineHeight: '21px' }}
        >
          {title}
        </Button>
      </Box>
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
        <Box ml="-50px">
          <RewardGraphClean
            epochTitle={intl.formatMessage(globalMessages.epochLabel)}
            stakepoolNameTitle={intl.formatMessage(globalMessages.stakepoolNameLabel)}
            xAxisLabel={intl.formatMessage(globalMessages.epochs)}
            yAxisLabel={intl.formatMessage(globalMessages.rewardValue)}
            primaryBarLabel={intl.formatMessage(globalMessages.rewardsLabel)}
            data={rewardList}
            hideYAxis={rewardsGraphData.hideYAxis}
          />
        </Box>
      )}
    </Box>
  );
}

export default (injectIntl(RewardHistoryGraph): ComponentType<RewardHistoryGraphProps>);
