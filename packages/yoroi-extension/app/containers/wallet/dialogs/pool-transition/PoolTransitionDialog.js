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
import type { Node } from 'react';
import { StakePoolCard } from './StakePoolCard';
import { Stack } from '@mui/material';

type Props = {|
  onClose: () => void,
  poolTransition?: any,
|};

export const PoolTransitionDialog = ({ onClose, poolTransition }: Props): React$Node => {
  const { currentPool, suggestedPool } = poolTransition || {};

  return (
    <Dialog
      onClose={onClose}
      title="UPGRADE YOUR STAKE POOL"
      styleOverride={{ width: '648px', padding: 0 }}
      closeButton={<DialogCloseButton onClose={onClose} />}
    >
      <Typography variant="body1" mb={2}>
        The current stake pool you're using will soon close. Migrate to the new EMURGO pool to
        sustain reward generation.
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <StakePoolCard
          label="Current Pool"
          poolName={currentPool?.name}
          roa={currentPool?.roa}
          fee={currentPool?.share}
          deadlineMilliseconds={poolTransition?.deadlineMilliseconds}
        />
        <Typography variant="body1" fontWeight="500">
          →
        </Typography>
        <StakePoolCard
          label="New Pool"
          poolName={suggestedPool?.name}
          roa={suggestedPool?.roa}
          fee={suggestedPool?.share}
          suggestedPool
        />
      </Stack>
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        direction="column"
        style={{ marginTop: 20, gap: 24 }}
      >
        <CustomButton variant="text">SKIP AND STOP RECEIVING REWARDS</CustomButton>
        <CustomButton variant="contained" color="primary" width="100%">
          UPDATE NOW AND KEEP EARNING
        </CustomButton>
      </Grid>
    </Dialog>
  );
};

const CustomButton = styled(Button)(({ theme }) => ({
  width: '100%',
}));
