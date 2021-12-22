// @flow
import type { ComponentType, Node } from 'react';
import { Box, styled } from '@mui/system';
import { Stack, Typography } from '@mui/material';
import { injectIntl } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { getAvatarFromPoolId } from '../utils';

type RewardHistoryItemProps = {|
  poolId: string,
  poolTicker: string,
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
  poolTicker,
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
          <Typography>{poolTicker}</Typography>
        </Box>
      </Box>
      <Stack spacing="22px">
        {historyList.map(({ type, date, balance }) => (
          <Box display="flex" justifyContent="space-between" alignItems="center">
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
  list: Array<Object>,
  onOpenRewardList: () => void,
|};

function RewardHistoryTab({ list, onOpenRewardList, intl }: RewardHistoryTabProps & Intl): Node {
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
      {list.map(item => (
        <RewardHistoryItem
          key={item.poolId}
          poolId={item.poolId}
          poolTicker={item.poolTicker}
          poolAvatar={item.poolAvatar}
          historyList={item.history}
        />
      ))}
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
