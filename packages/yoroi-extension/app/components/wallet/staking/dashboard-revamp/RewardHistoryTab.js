// @flow
import type { ComponentType, Node } from 'react';
import { Box, styled } from '@mui/system';
import { Stack, Typography } from '@mui/material';
import { injectIntl } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { getAvatarFromPoolId, groupByPoolName } from '../utils';
import { useMemo } from 'react';
import type { GraphRewardData } from './RewardHistoryDialog';
import InvalidURIImg from '../../../../assets/images/uri/invalid-uri.inline.svg';
import ErrorBlock from '../../../widgets/ErrorBlock';
import VerticallyCenteredLayout from '../../../layout/VerticallyCenteredLayout';
import LoadingSpinner from '../../../widgets/LoadingSpinner';

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
    <Box
      paddingTop="20px"
      paddingBottom="26px"
      borderBottom="1px solid var(--yoroi-palette-gray-50)"
    >
      <Box marginBottom="20px">
        <Typography color="var(--yoroi-palette-gray-600)">Stake Pool</Typography>
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
      <Stack spacing="22px">
        {historyList.map(({ type, date, balance }, idx) => (
          // eslint-disable-next-line react/no-array-index-key
          <Box key={idx} display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography color="var(--yoroi-palette-gray-900)">{type}</Typography>
              <Typography variant="body3" color="var(--yoroi-palette-gray-600)">
                {date}
              </Typography>
            </Box>
            <Typography color="var(--yoroi-palette-gray-900)">{balance}</Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

type RewardHistoryTabProps = {|
  graphData: GraphRewardData,
  onOpenRewardList: () => void,
|};

function RewardHistoryTab({
  graphData,
  onOpenRewardList,
  intl,
}: RewardHistoryTabProps & Intl): Node {
  const rewardList = graphData.items;
  const rewardsByPoolName = useMemo(() => groupByPoolName(rewardList), []);
  return (
    <Box>
      <Typography
        as="button"
        variant="body2"
        color="var(--yoroi-palette-gray-600)"
        display="block"
        marginLeft="auto"
        onClick={onOpenRewardList}
      >
        {intl.formatMessage(globalMessages.openRewardHistory)}
      </Typography>
      {graphData.error && (
        <div>
          <center>
            <InvalidURIImg />
          </center>
          <ErrorBlock error={graphData.error} />
        </div>
      )}
      {rewardList == null ? (
        <VerticallyCenteredLayout>
          <LoadingSpinner />
        </VerticallyCenteredLayout>
      ) : (
        Object.entries(rewardsByPoolName ?? {}).map(([poolName, data]) => (
          <RewardHistoryItem
            key={poolName}
            // $FlowFixMe[incompatible-use]: Object entries flow type
            poolId={data.poolId}
            poolName={poolName}
            // $FlowFixMe[incompatible-use]: Object entries flow type
            poolAvatar={data.poolAvatar}
            // $FlowFixMe[incompatible-use]: Object entries flow type
            historyList={data.map(item => ({
              // TODO: Make sure it's "received" in all use cases
              type: 'Received',
              date: item.date,
              balance: item.primary,
            }))}
          />
        ))
      )}
    </Box>
  );
}
export default (injectIntl(RewardHistoryTab): ComponentType<RewardHistoryTabProps>);

const AvatarWrapper: any = styled(Box)({
  width: '24px',
  height: '24px',
  minWidth: '24px',
  marginRight: '12px',
  borderRadius: '20px',
  overflow: 'hidden',
});

const AvatarImg: any = styled('img')({
  width: '100%',
  background: 'white',
  objectFit: 'scale-down',
});
