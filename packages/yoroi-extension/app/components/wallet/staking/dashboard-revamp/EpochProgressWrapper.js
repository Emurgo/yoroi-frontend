// @flow
import type { ComponentType, Node } from 'react';
import { Box, styled } from '@mui/system';
import { Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { injectIntl } from 'react-intl';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import globalMessages from '../../../../i18n/global-messages';
import { EpochProgressCard } from './EpochProgressCard';
import moment from 'moment';

type Props = {|
  epochProgress: {|
    currentEpoch: number,
    startEpochDate: string,
    endEpochDate: string,
    percentage: number,
  |},
|};

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

function EpochProgressWrapper({ epochProgress, intl }: Props & Intl): Node {
  return (
    <Card>
      <Box
        sx={{
          padding: '15px 24px',
          borderBottom: '1px solid var(--yoroi-palette-gray-200)',
        }}
      >
        <Typography variant="h5" color="var(--yoroi-palette-gray-900)">
          {intl.formatMessage(globalMessages.epochProgress)}
        </Typography>
      </Box>
      <Box sx={{ padding: '24px' }}>
        <EpochProgressCard
          percentage={epochProgress.percentage}
          days={moment(epochProgress.endEpochDate).diff(moment(), 'days')}
          currentEpoch={epochProgress.currentEpoch}
          startEpochDate={epochProgress.startEpochDate}
          endEpochDate={epochProgress.endEpochDate}
        />
      </Box>
    </Card>
  );
}

export default (injectIntl(observer(EpochProgressWrapper)): ComponentType<Props>);

const Card = styled(Box)({
  backgroundColor: 'var(--yoroi-palette-common-white)',
  borderRadius: '8px',
  flex: '1 1 100%',
  display: 'flex',
  flexDirection: 'column',
});
