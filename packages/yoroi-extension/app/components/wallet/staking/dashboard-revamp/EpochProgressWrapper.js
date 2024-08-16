// @flow
import type { ComponentType, Node } from 'react';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { Box, styled } from '@mui/system';
import { Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { EpochProgressCard } from './EpochProgressCard';
import globalMessages from '../../../../i18n/global-messages';
import moment from 'moment';

type Props = {|
  epochProgress: {|
    currentEpoch: number,
    startEpochDate: string | Date,
    endEpochDate: string | Date,
    endEpochDateTime: Date,
    percentage: number,
  |},
|};

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

function EpochProgressWrapper({ epochProgress, intl }: Props & Intl): Node {
  const days = moment(epochProgress.endEpochDateTime).diff(moment(), 'days');

  return (
    <Card
      sx={{
        border: '1px solid',
        borderColor: 'grayscale.200',
        bgcolor: 'ds.bg_color_min',
      }}
    >
      <Box
        sx={{
          padding: '15px 24px',
          borderBottom: '1px solid',
          borderColor: 'grayscale.200',
        }}
      >
        <Typography component="div" variant="h5" color="ds.text_gray_medium" fontWeight={500}>
          {intl.formatMessage(globalMessages.epochProgress)}
        </Typography>
      </Box>
      <Box sx={{ padding: '24px' }}>
        <EpochProgressCard
          percentage={epochProgress.percentage}
          days={days}
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
  borderRadius: '8px',
  flex: '1 1 100%',
  display: 'flex',
  flexDirection: 'column',
});
