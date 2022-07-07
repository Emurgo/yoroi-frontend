// @flow
import type { Node, ComponentType } from 'react';
import { useMemo } from 'react';
import { observer } from 'mobx-react';
import globalMessages from '../../../../i18n/global-messages';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import { Typography } from '@mui/material';
import Dialog from '../../../widgets/Dialog';
import { injectIntl } from 'react-intl';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Box } from '@mui/system';
import { RewardHistoryItem } from './RewardHistoryTab';
// import InvalidURIImg from '../../../../assets/images/uri/invalid-uri.inline.svg';
import ErrorBlock from '../../../widgets/ErrorBlock';
import LoadingSpinner from '../../../widgets/LoadingSpinner';
import VerticallyCenteredLayout from '../../../layout/VerticallyCenteredLayout';
import LocalizableError from '../../../../i18n/LocalizableError';
import { groupByPoolName } from '../utils';

export type GraphRewardData = {|
  error: ?LocalizableError,
  items: Array<{|
    name: string,
    primary: number,
    poolName: string,
    poolId: string,
    date: string,
  |}>,
|};

type Props = {|
  graphData: GraphRewardData,
  onClose: () => void,
|};
type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

function RewardHistoryDialog({ graphData, onClose, intl }: Props & Intl): Node {
  const rewardList = graphData.items;

  const rewardsByPoolName = useMemo(() => groupByPoolName(rewardList), []);

  return (
    <Dialog
      styleOverride={{ minWidth: '673px' }}
      title={intl.formatMessage(globalMessages.rewardHistory)}
      closeOnOverlayClick={false}
      closeButton={<DialogCloseButton onClose={onClose} />}
      onClose={onClose}
    >
      <Typography color="var(--yoroi-palette-gray-600)">
        {intl.formatMessage(globalMessages.rewardsLabel)} ({rewardList.length})
      </Typography>
      <Box>
        {graphData.error && (
          <div>
            <center>
              {/* <InvalidURIImg /> */}
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
    </Dialog>
  );
}
export default (injectIntl(observer(RewardHistoryDialog)): ComponentType<Props>);
