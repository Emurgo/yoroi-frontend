// @flow
import type { Node, ComponentType } from 'react';
import type { GraphData } from '../dashboard/StakingDashboard';
import { useMemo } from 'react';
import { observer } from 'mobx-react';
import globalMessages from '../../../../i18n/global-messages';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import { Typography, Box, useTheme } from '@mui/material';
import Dialog from '../../../widgets/Dialog';
import { injectIntl, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { RewardHistoryItem } from './RewardHistoryTab';
import InvalidURIImg from '../../../../assets/images/uri/invalid-uri.inline.svg';
import ErrorBlock from '../../../widgets/ErrorBlock';
import LoadingSpinner from '../../../widgets/LoadingSpinner';
import VerticallyCenteredLayout from '../../../layout/VerticallyCenteredLayout';
import LocalizableError from '../../../../i18n/LocalizableError';
import { groupByPoolName } from '../utils';

const messages = defineMessages({
  epoch: {
    id: 'wallet.staking.rewards.rewardHistory.epochNum',
    defaultMessage: '!!!Epoch {number}',
  },
});

export type GraphRewardData = {|
  error: ?LocalizableError,
  items: Array<{|
    name: string,
    primary: number,
    poolName: string,
    poolId: string,
    currency: string,
    date: string,
  |}>,
|};

type Props = {|
  graphData: GraphData,
  onClose: () => void,
|};
type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

function RewardHistoryDialog({ graphData, onClose, intl }: Props & Intl): Node {
  const rewardItems = graphData.rewardsGraphData.items;
  const rewardList = rewardItems?.perEpochRewards.filter(p => Boolean(p.primary)) ?? [];
  const rewardsByPoolName = useMemo(() => groupByPoolName(rewardList), []);
  const { palette } = useTheme();

  return (
    <Dialog
      title={intl.formatMessage(globalMessages.rewardHistory)}
      closeOnOverlayClick={false}
      closeButton={<DialogCloseButton onClose={onClose} />}
      onClose={onClose}
      styleContentOverride={{ background: palette.ds.bg_color_max }}
    >
      <Box maxWidth="600px">
        <Typography component="div" mb="24px" variant="body1" fontWeight={500} color="ds.text_gray_medium">
          {intl.formatMessage(globalMessages.rewardsListLabel)} ({rewardList.length})
        </Typography>
        <Box>
          {graphData.rewardsGraphData.error && (
            <div>
              <center>
                <InvalidURIImg />
              </center>
              <ErrorBlock error={graphData.rewardsGraphData.error} />
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
                poolName={poolName || '-'}
                // $FlowFixMe[incompatible-use]: Object entries flow type
                poolAvatar={data.poolAvatar}
                // $FlowFixMe[incompatible-use]: Object entries flow type
                historyList={data.map(item => ({
                  // TODO: Make sure it's "received" in all use cases
                  type: intl.formatMessage(messages.epoch, { number: item.name }),
                  date: item.date,
                  balance: item.primary,
                  currency: item.currency,
                }))}
              />
            ))
          )}
        </Box>
      </Box>
    </Dialog>
  );
}
export default (injectIntl(observer(RewardHistoryDialog)): ComponentType<Props>);
