// @flow
import React from 'react';
import { Typography, styled, Box, Stack } from '@mui/material';
import { formatTimeSpan } from './helpers';

import { ReactComponent as WarningSvg } from '../../../../assets/images/alert.inline.svg';
import { ReactComponent as EmurgoSvg } from '../../../../assets/images/emurgo-logo-small.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { messages } from './dialog-messages';

type Props = {|
  label: string,
  poolName?: string,
  roa?: string,
  fee?: string,
  deadlineMilliseconds?: number,
  suggestedPool?: boolean,
  intl: $npm$ReactIntl$IntlFormat,
|};

export const StakePoolCard = ({
  label,
  poolName,
  roa,
  fee,
  deadlineMilliseconds,
  suggestedPool = false,
  intl,
}: Props): React$Node => {
  return (
    <CustomCard suggestedPool={suggestedPool}>
      <Typography variant="body1" fontWeight={500} mb={2}>
        {label}
      </Typography>
      <Stack direction="row" gap={1}>
        <EmurgoSvg />
        <Typography variant="body1" fontWeight={400}>
          {poolName}
        </Typography>
      </Stack>
      <Stack direction="column" gap={1} my={2}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body1" color="grayscale.600">
            {intl.formatMessage(messages.estimatedROA)}
          </Typography>
          <Typography variant="body1" color="grayscale.600">
            {roa}%
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body1" color="grayscale.600">
            {intl.formatMessage(messages.fee)}
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
              ? intl.formatMessage(messages.poolContinues)
              : intl.formatMessage(messages.poolStop)}
          </Typography>
          {!suggestedPool && (
            <Typography variant="body2" fontWeight="500" component="span" pl={0.4}>
              {deadlineMilliseconds
                ? formatTimeSpan(deadlineMilliseconds)
                : intl.formatMessage(messages.poolNotGenerating)}
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
