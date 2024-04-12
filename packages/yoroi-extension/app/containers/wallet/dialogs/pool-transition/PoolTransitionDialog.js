// @flow
import React from 'react';
import Dialog from '../../../../components/widgets/Dialog';
import {
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  Modal,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import DialogCloseButton from '../../../../components/widgets/DialogCloseButton';
import type { PoolTransition } from '../../../../stores/toplevel/DelegationStore';
import type { Node } from 'react';
import { StakePoolCard } from './StakePoolCard';
import { Stack } from '@mui/material';
import { messages } from './dialog-messages';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
  onClose: () => void,
  poolTransition?: PoolTransition | null,
  onUpdatePool: () => void,
  intl: $npm$ReactIntl$IntlFormat,
|};

export const PoolTransitionDialog = ({
  onClose,
  poolTransition,
  onUpdatePool,
  intl,
}: Props): React$Node => {
  const { currentPool, suggestedPool } = poolTransition || {};

  return (
    <Dialog
      onClose={onClose}
      title={intl.formatMessage(messages.upgradeStakePool)}
      styleOverride={{ width: '648px', padding: 0 }}
      closeButton={<DialogCloseButton onClose={onClose} />}
    >
      <Typography variant="body1" mb={2}>
        {intl.formatMessage(messages.currentStakePool)}
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <StakePoolCard
          label={intl.formatMessage(messages.currentPool)}
          poolName={currentPool?.name}
          roa={currentPool?.roa}
          fee={currentPool?.share}
          deadlineMilliseconds={poolTransition?.deadlineMilliseconds}
          intl={intl}
        />
        <Typography variant="body1" fontWeight="500">
          →
        </Typography>
        <StakePoolCard
          label={intl.formatMessage(messages.newPool)}
          poolName={suggestedPool?.name}
          roa={suggestedPool?.roa}
          fee={suggestedPool?.share}
          suggestedPool
          intl={intl}
        />
      </Stack>
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        direction="column"
        style={{ marginTop: 20, gap: 24 }}
      >
        <CustomButton variant="text" onClick={onClose}>
          {intl.formatMessage(messages.skipAndStop)}
        </CustomButton>
        <CustomButton variant="contained" color="primary" width="100%" onClick={onUpdatePool}>
          {intl.formatMessage(messages.updateNow)}
        </CustomButton>
      </Grid>
    </Dialog>
  );
};

const CustomButton = styled(Button)(({ theme }) => ({
  width: '100%',
}));
