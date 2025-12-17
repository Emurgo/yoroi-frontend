import React from 'react';
import { Box, styled } from '@mui/system';
import { Button, CircularProgress, Stack, Typography } from '@mui/material';
import RewardGraphClean from './RewardGraphClean';
import MuiAccordion, { AccordionProps as MuiAccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps as MuiAccordionSummaryProps } from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import { getAvatarFromPoolId } from '../../common/helpers';
import { useStrings } from '../../common/hooks/useStrings';
import { GraphData } from '../../common/types';
import { useStaking } from '../../module/StakingContextProvider';

import RewardHistoryDialog from '../../../../../components/wallet/staking/dashboard-revamp/RewardHistoryDialog';
import { observer } from 'mobx-react';

type RewardHistoryEntry = {
  type: string;
  date: string;
  balance: string;
};

type RewardHistoryItemProps = {
  poolId: string;
  poolName: string;
  poolAvatar?: string | null;
  historyList: RewardHistoryEntry[];
};

type RewardHistoryGraphProps = {
  graphData: GraphData;
};

/* ---------- RewardHistoryItem ---------- */

export const RewardHistoryItem: React.FC<RewardHistoryItemProps> = ({ poolId, poolName, poolAvatar, historyList }) => {
  const avatarGenerated = getAvatarFromPoolId(poolId);

  return (
    <Accordion>
      <AccordionSummary aria-controls={`${poolId}-content`} id={`${poolId}-header`}>
        <Box>
          <Box display="block">
            <Typography component="div" color="var(--yoroi-palette-gray-600)">
              Stake Pool
            </Typography>
          </Box>
          <Box display="flex">
            <AvatarWrapper>
              <AvatarImg src={poolAvatar ?? avatarGenerated} alt="stake pool logo" />
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

/* ---------- Styled components ---------- */

const Accordion = styled((props: MuiAccordionProps) => (
  <MuiAccordion TransitionProps={{ timeout: { exit: 500 } }} disableGutters elevation={0} square {...props} />
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

const AvatarImg = styled('img')({
  width: '100%',
  background: 'white',
  objectFit: 'scale-down',
});

const AvatarWrapper = styled(Box)({
  width: '24px',
  height: '24px',
  minWidth: '24px',
  marginRight: '12px',
  borderRadius: '20px',
  overflow: 'hidden',
});

const ExpandMoreIcon: React.FC = () => (
  <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0.292893 0.292893C0.683417 -0.0976311 1.31658 -0.0976311 1.70711 0.292893L7 5.58579L12.2929 0.292893C12.6834 -0.0976311 13.3166 -0.0976311 13.7071 0.292893C14.0976 0.683417 14.0976 1.31658 13.7071 1.70711L7.70711 7.70711C7.31658 8.09763 6.68342 8.09763 6.29289 7.70711L0.292893 1.70711C-0.0976311 1.31658 -0.0976311 0.683417 0.292893 0.292893Z"
      fill="#6B7384"
    />
  </svg>
);

const AccordionSummary = styled((props: MuiAccordionSummaryProps) => (
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

const RewardHistoryGraph: React.FC<RewardHistoryGraphProps> = observer(({ graphData }) => {
  const strings = useStrings();
  const { stores } = useStaking();
  const { rewardsGraphData } = graphData;
  const rewardList = rewardsGraphData.items?.perEpochRewards;
  const title = strings.rewardHistoryLabel;

  const onOpenRewardList = async () => {
    console.log('OPENNNNNN222');
    stores.uiDialogs.open({
      dialog: RewardHistoryDialog,
    });
  };

  return (
    <Box
      p="24px"
      sx={{
        display: 'flex',
        flexFlow: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <Typography component="div" variant="body1" fontWeight={500} color="ds.text_gray_medium">
          {title}
        </Typography>
        <Button
          // @ts-ignore
          variant="outlined"
          size="medium"
          onClick={() =>
            stores.uiDialogs.open({
              dialog: RewardHistoryDialog,
            })
          }
          sx={{ lineHeight: '21px' }}
        >
          {title}
        </Button>
      </Box>

      {rewardsGraphData.error && !rewardsGraphData.items && (
        <div>
          <Typography variant="body2" color="ds.text_error">
            {strings.errorLabel}
          </Typography>
        </div>
      )}

      {!Array.isArray(rewardList) ? (
        <CircularProgress />
      ) : (
        <Box ml="-50px">
          <RewardGraphClean
            epochTitle={strings.epochLabel}
            stakepoolNameTitle={strings.stakepoolNameLabel}
            xAxisLabel={strings.epochLabel}
            yAxisLabel={strings.rewardValue}
            primaryBarLabel={strings.rewardsLabel}
            data={rewardList}
            hideYAxis={rewardsGraphData.hideYAxis}
          />
        </Box>
      )}
    </Box>
  );
});

export default RewardHistoryGraph;
