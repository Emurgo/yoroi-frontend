// @flow
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Icon,
  Grid,
  Alert,
  styled,
  Paper,
  Box,
  Stack,
} from '@mui/material';
import { formatTimeSpan } from './helpers';

import { ReactComponent as WarningSvg } from '../../../../assets/images/alert.inline.svg';

type Props = {|
  label: string,
  poolName?: string,
  roa?: string,
  fee?: string,
  deadlineMilliseconds?: number,
  suggestedPool?: boolean,
|};

export const StakePoolCard = ({
  label,
  poolName,
  roa,
  fee,
  deadlineMilliseconds,
  suggestedPool = false,
}: Props): React$Node => {
  return (
    <CustomCard suggestedPool={suggestedPool}>
      <Typography variant="body1" fontWeight={500} mb={2}>
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={400}>
        {poolName}
      </Typography>
      <Stack direction="column" gap={1} my={2}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body1" color="grayscale.600">
            Estimated ROA
          </Typography>
          <Typography variant="body1" color="grayscale.600">
            {roa}%
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body1" color="grayscale.600">
            Fee
          </Typography>
          <Typography variant="body1" color="grayscale.600">
            {fee}%
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row">
        {!suggestedPool && (
          <Box mr="4px">
            <WarningSvg />
          </Box>
        )}
        <Typography color={suggestedPool ? 'grayscale.max' : 'magenta.500'} component="span">
          <Typography variant="body2" component="span">
            {suggestedPool
              ? 'This pool continues to generate staking rewards'
              : 'This pool will stop generating staking rewards in'}
          </Typography>
          {!suggestedPool && (
            <Typography variant="body2" fontWeight="500" component="span" pl={0.4}>
              {deadlineMilliseconds
                ? formatTimeSpan(deadlineMilliseconds)
                : 'This pool is NOT generating staking rewards anymore'}
            </Typography>
          )}
        </Typography>
      </Stack>
    </CustomCard>
  );
};

const CustomCard = styled(Box)(({ theme, suggestedPool }) => ({
  background: suggestedPool ? 'linear-gradient(312deg, #C6F7ED 0%, #E4E8F7 70.58%)' : 'transparent',
  padding: theme.spacing(2),
  width: '294px',
  borderWidth: 1,
  borderRadius: 8,
  border: `1px solid ${theme.palette.grayscale['200']}`,
  boxShadow: 'none',
}));
