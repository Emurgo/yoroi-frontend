// @flow
import Dialog from '../../../../components/widgets/Dialog';
import { Typography, Button, Grid, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

import type { PoolTransition } from '../../../../stores/toplevel/DelegationStore';
import { StakePoolCard } from './StakePoolCard';
import { messages } from './dialog-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import Separator from '../../../../components/common/separator/Separator';
import { ReactComponent as ArrowRightSvg } from '../../../../assets/images/revamp/icons/arrow-right.inline.svg';
import { Box } from '@mui/material';

type Props = {|
  onClose: () => void,
  poolTransition: ?PoolTransition,
  onUpdatePool: () => void,
  currentPoolId?: string,
  intl: $npm$ReactIntl$IntlFormat,
|};

export const PoolTransitionDialog = ({
  onClose,
  poolTransition,
  onUpdatePool,
  currentPoolId,
  intl,
}: Props): React$Node => {
  const { currentPool, suggestedPool, deadlinePassed } = poolTransition || {};

  return (
    <Dialog
      onClose={onClose}
      title={intl.formatMessage(messages.upgradeStakePool)}
      styleOverride={{ width: '648px', height: '524px', padding: 0 }}
      styleContentOverride={{ padding: 0 }}
      closeOnOverlayClick
    >
      <Typography variant="body1" mb={2} mx="24px">
        {intl.formatMessage(messages.currentStakePool)}
      </Typography>
      <Stack direction="row" alignItems="center" justifyContent="center">
        <StakePoolCard
          label={intl.formatMessage(messages.currentPool)}
          poolName={`[${currentPool?.ticker ?? ''}] ${currentPool?.name ?? ''}`}
          roa={currentPool?.roa}
          fee={currentPool?.taxRatio ?? ''}
          deadlineMilliseconds={poolTransition?.deadlineMilliseconds || 0}
          poolHash={currentPoolId}
          deadlinePassed={deadlinePassed}
          intl={intl}
        />

        <Box px="8px">
          <ArrowRightSvg />
        </Box>

        <StakePoolCard
          label={intl.formatMessage(messages.newPool)}
          poolName={`[${suggestedPool?.ticker ?? ''}] ${suggestedPool?.name ?? ''}`}
          roa={suggestedPool?.roa}
          fee={suggestedPool?.taxRatio}
          poolHash={suggestedPool?.hash}
          deadlinePassed={deadlinePassed}
          suggestedPool
          intl={intl}
        />
      </Stack>
      <Grid
        container
        justifyContent="space-between"
        direction="column"
        style={{ marginTop: 24, marginBottom: 24 }}
      >
        <CustomButton variant="text" onClick={onClose} sx={{ color: '#242838' }}>
          {intl.formatMessage(messages.skipAndStop)}
        </CustomButton>

        <CustomButton
          variant="contained"
          color="primary"
          width="100%"
          onClick={onUpdatePool}
          sx={{ marginTop: '12px' }}
        >
          {intl.formatMessage(messages.updateNow)}
        </CustomButton>
      </Grid>
    </Dialog>
  );
};

const CustomButton = styled(Button)(({ _theme, _color }) => ({
  width: '100%',
  fontSize: '14px',
  marginLeft: '24px',
  marginRight: '24px',
  maxWidth: '600px',
}));
