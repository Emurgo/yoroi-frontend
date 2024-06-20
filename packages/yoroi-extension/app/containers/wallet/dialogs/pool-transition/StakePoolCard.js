// @flow
import { forwardRef } from 'react';
import { Typography, styled, Box, Stack } from '@mui/material';
import { formatTimeSpan } from './helpers';

import { ReactComponent as WarningSvg } from '../../../../assets/images/revamp/icons/alert.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { messages } from './dialog-messages';
import { toSvg } from 'jdenticon';

type Props = {|
  label: string,
  poolName?: string,
  roa?: string,
  fee?: string,
  deadlineMilliseconds?: number,
  suggestedPool?: boolean,
  deadlinePassed: boolean,
  poolHash?: string,
  intl: $npm$ReactIntl$IntlFormat,
|};

export const StakePoolCard = ({
  label,
  poolName,
  roa,
  fee,
  deadlineMilliseconds,
  deadlinePassed,
  suggestedPool = false,
  intl,
  poolHash,
}: Props): React$Node => {
  const avatarSource = toSvg(poolHash, 36, { padding: 0 });
  const avatarGenerated = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSource)}`;
  return (
    <CustomCard suggestedPool={suggestedPool}>
      <Typography variant="body1" fontWeight={500} mb={2}>
        {label}
      </Typography>
      <Stack direction="row" gap={1}>
        <Box
          sx={{ width: '24px', height: '24px', borderRadius: '50%', display: 'inline-block' }}
          component="img"
          src={avatarGenerated}
        />
        <Typography variant="body1" fontWeight={400} color="primary.600">
          {poolName}
        </Typography>
      </Stack>
      <Stack direction="column" gap={1} my={2}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body1" color="grayscale.600">
            {intl.formatMessage(messages.estimatedROA)}
          </Typography>
          <Typography variant="body1" color="grayscale.max" fontWeight={suggestedPool ? 500 : 400}>
            {roa}%
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body1" color="grayscale.600">
            {intl.formatMessage(messages.fee)}
          </Typography>
          <Typography variant="body1" color="grayscale.max" fontWeight={suggestedPool ? 500 : 400}>
            {fee}%
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row">
        {!suggestedPool && (
          <Box mr="4px" mt="2px">
            <WarningSvg />
          </Box>
        )}
        <Typography color={suggestedPool ? 'grayscale.max' : 'magenta.500'} component="span">
          {suggestedPool && (
            <Typography variant="body2" component="span">
              {intl.formatMessage(messages.poolContinues)}
            </Typography>
          )}
          {!suggestedPool && (
            <>
              {!deadlinePassed ? (
                <Typography variant="body2">
                  {intl.formatMessage(messages.poolStop)}&nbsp;
                  <Typography component="span" variant="body2" fontWeight="500" sx={{ display: 'inline' }}>
                    {formatTimeSpan(Number(deadlineMilliseconds), Date.now())}
                  </Typography>
                </Typography>
              ) : (
                <Typography variant="body2" fontWeight="500" component="span" pl={0.4}>
                  {intl.formatMessage(messages.poolNotGenerating)}
                </Typography>
              )}
            </>
          )}
        </Typography>
      </Stack>
    </CustomCard>
  );
};

// eslint-disable-next-line no-unused-vars
const StyledBox = forwardRef(({ suggestedPool, ...props }, ref) => <Box {...props} ref={ref} />);

const CustomCard = styled(StyledBox)(({ theme, suggestedPool }) => ({
  background: suggestedPool ? 'linear-gradient(312deg, #C6F7ED 0%, #E4E8F7 70.58%)' : 'transparent',
  padding: theme.spacing(2),
  width: '284px',
  height: '228px',
  borderWidth: 1,
  borderRadius: 8,
  border: `1px solid ${theme.palette.grayscale['200']}`,
}));
