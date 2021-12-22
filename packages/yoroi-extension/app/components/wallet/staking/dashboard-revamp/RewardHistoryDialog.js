// @flow
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import globalMessages from '../../../../i18n/global-messages';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import { Typography } from '@mui/material';
import Dialog from '../../../widgets/Dialog';
import { injectIntl } from 'react-intl';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Box } from '@mui/system';
import { RewardHistoryItem } from './RewardHistoryTab';

type Props = {|
  list: Array<Object>,
  onClose: () => void,
|};
type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

function RewardHistoryDialog({ list, onClose, intl }: Props & Intl): Node {
  return (
    <Dialog
      styleOverride={{ minWidth: '673px' }}
      title={intl.formatMessage(globalMessages.rewardHistory)}
      closeOnOverlayClick={false}
      closeButton={<DialogCloseButton onClose={onClose} />}
      onClose={onClose}
    >
      <Typography color="var(--yoroi-palette-gray-600)">
        {intl.formatMessage(globalMessages.rewardsLabel)} ({list.length})
      </Typography>
      <Box>
        {list.map(item => (
          <RewardHistoryItem
            poolId={item.poolId}
            poolTicker={item.poolTicker}
            poolAvatar={item.poolAvatar}
            historyList={item.history}
          />
        ))}
      </Box>
    </Dialog>
  );
}
export default (injectIntl(observer(RewardHistoryDialog)): ComponentType<Props>);
