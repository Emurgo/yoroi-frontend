import React from 'react';
import { Box, Divider, styled, Typography } from '@mui/material';
import moment from 'moment';

import { EpochProgressCard } from './EpochProgressCard';
import { useStrings } from '../../common/hooks/useStrings';

export interface EpochProgressData {
  currentEpoch: number;
  startEpochDate: string | Date;
  endEpochDate: string | Date;
  endEpochDateTime: Date;
  percentage: number;
}

export interface EpochProgressWrapperProps {
  epochProgress: EpochProgressData;
}

const EpochProgressWrapper: React.FC<EpochProgressWrapperProps> = ({ epochProgress }) => {
  const strings = useStrings();

  // Days remaining
  const days = moment(epochProgress.endEpochDateTime).diff(moment(), 'days');

  return (
    <Card
      sx={{
        border: '1px solid',
        borderColor: 'ds.gray_200',
        bgcolor: 'ds.bg_color_max',
      }}
    >
      <Box sx={{ padding: '17px 24px' }}>
        <Typography variant="h5" color="ds.text_gray_medium" fontWeight={500}>
          {strings.epochProgress}
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'ds.gray_200' }} />

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
};

export default EpochProgressWrapper;

const Card = styled(Box)({
  borderRadius: '8px',
  flex: '1 1 100%',
  display: 'flex',
  flexDirection: 'column',
});
