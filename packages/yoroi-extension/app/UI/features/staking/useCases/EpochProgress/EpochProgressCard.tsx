import React from 'react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';

export interface EpochProgressCardProps {
  percentage: number;
  days: number;
  currentEpoch: number;
  startEpochDate: string | Date;
  endEpochDate: string | Date;
}

export const EpochProgressCard: React.FC<EpochProgressCardProps> = ({
  percentage,
  days,
  currentEpoch,
  startEpochDate,
  endEpochDate,
}) => {
  return (
    <Box>
      <Stack direction="row" spacing={24} justifyContent="flex-start">
        <Graph value={percentage} days={days} />
        <Stack direction="column" flexGrow={1}>
          <Title label="Current Epoch" value={currentEpoch} />
          <Stack direction="row" gap={16} mt="50px" justifyContent="space-between">
            <LabelWithValue label="Epoch started at" value={startEpochDate} />
            <LabelWithValue label="Epoch ends at" value={endEpochDate} />
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

interface TitleProps {
  label: string;
  value: string | number;
}

const Title: React.FC<TitleProps> = ({ label, value }) => {
  return (
    <Box>
      <Typography fontWeight={500} color="ds.primary_600">
        {label}: {value}
      </Typography>
    </Box>
  );
};

interface InfoColumnProps {
  label: string;
  value: string | number | Date;
}

const LabelWithValue: React.FC<InfoColumnProps> = ({ label, value }) => {
  return (
    <Box minWidth="203px">
      <Typography sx={{ textTransform: 'uppercase' }} variant="caption" mb="4px" color="ds.gray_600">
        {label}
      </Typography>
      <Typography color="ds.gray_900">{value instanceof Date ? value.toString() : value}</Typography>
    </Box>
  );
};

interface GraphProps {
  value: number;
  days: number;
}

const Graph: React.FC<GraphProps> = ({ value, days }) => {
  return (
    <Box mr="8px" position="relative" display="flex" justifyContent="center">
      <CircularProgress
        size={120}
        thickness={7}
        variant="determinate"
        value={value}
        sx={{
          color: 'primary.600',
          animationDuration: '550ms',
          position: 'absolute',
          zIndex: 1,
        }}
      />
      <CircularProgress size={120} thickness={7} variant="determinate" sx={{ color: 'ds.gray_100' }} value={100} />
      <Box
        position="absolute"
        sx={{
          top: '30%',
          left: '50%',
          transform: 'translate(-50%)',
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" color="ds.gray_900">
          {value}%
        </Typography>
        <Typography variant="caption" fontSize="12px" color="ds.gray_600">
          {days} days
        </Typography>
      </Box>
    </Box>
  );
};
