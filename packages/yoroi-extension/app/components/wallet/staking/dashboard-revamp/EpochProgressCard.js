// @flow
import type { Node } from 'react';
import { Box } from '@mui/system';
import { CircularProgress, Stack, Typography } from '@mui/material';

type Props = {|
  +percentage: number,
  +days: string,
  +currentEpoch: number,
  +startEpochDate: string,
  +endEpochDate: string,
|};

// TODO: Remove placeholders
export function EpochProgressCard({
  percentage,
  days,
  currentEpoch,
  startEpochDate,
  endEpochDate,
}: Props): Node {
  return (
    <Box>
      <Graph value={percentage} days={days} />
      <Stack direction="row" spacing={4} mt="32px">
        <LabelWithValue label="Current Epoch" value={currentEpoch} />
        <LabelWithValue label="Epoch started at" value={startEpochDate} />
        <LabelWithValue label="Epoch end at" value={endEpochDate} />
      </Stack>
    </Box>
  );
}

type InfoColumnProps = {|
  +label: string,
  +value: string | number,
|};
const LabelWithValue = ({ label, value }: InfoColumnProps): Node => {
  return (
    <Box>
      <Typography mb="6px" color="var(--yoroi-palette-gray-600)">
        {label}
      </Typography>
      <Typography color="var(--yoroi-palette-gray-900)">{value}</Typography>
    </Box>
  );
};

const Graph = ({ value, days }): Node => {
  return (
    <Box position="relative" display="flex" justifyContent="center">
      <CircularProgress
        size={190}
        thickness={4}
        variant="determinate"
        value={value}
        sx={{
          color: 'var(--yoroi-palette-primary-300)',
          animationDuration: '550ms',
          position: 'absolute',
          zIndex: 1,
        }}
      />
      <CircularProgress
        size={190}
        thickness={4}
        variant="determinate"
        sx={{
          color: 'var(--yoroi-palette-gray-50)',
        }}
        value={100}
      />
      <Box
        position="absolute"
        sx={{
          top: '40%',
          left: '50%',
          transform: 'translate(-50%)',
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" color="var(--yoroi-palette-gray-900)">
          {value}%
        </Typography>
        <Typography variant="body2" color="var(--yoroi-palette-gray-600)">
          {days} days
        </Typography>
      </Box>
    </Box>
  );
};
