// @flow
import React from 'react';
import Dialog from '../../../../components/widgets/Dialog';
import {
  DialogContent,
  DialogsActions,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import DialogCloseButton from '../../../../components/widgets/DialogCloseButton';
import type { Node } from 'react';
import { StakePoolCard } from './StakePoolCard';

type Props = {|
  onClose: () => void,
|};

export const PoolTransitionDialog = ({ onClose }: Props): React$Node => {
  return (
    <Dialog onClose={onClose} title="UPGRADE YOUR STAKE POOL" styleOverride={{ maxWidth: '648px' }}>
      <DialogContent>
        <Typography gutterBottom>
          The current stake pool you're using will soon close. Migrate to the new EMURGO pool to
          sustain reward generation.
        </Typography>
        <Grid container justifyContent="space-between" alignItems="center">
          <StakePoolCard
            label="Card1"
            poolName="[EMUR1] Emurgo #1"
            roa="0%"
            fee="3.5%"
            deadline="This pool will stop generating staking rewards in 2d : 1h : 04m"
          />
          <Typography variant="h5" style={{ margin: '0 20px' }}>
            →
          </Typography>
          <StakePoolCard
            label="Card2"
            poolName="[EMURNEW] Emurgo #2"
            roa="5.1%"
            fee="3.2%"
            deadline="This pool continues to generate staking rewards"
          />
        </Grid>
      </DialogContent>
      <DialogsActions>
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          style={{ marginTop: 20 }}
        >
          <CustomButton variant="outlined">SKIP AND STOP RECEIVING REWARDS</CustomButton>
          <CustomButton variant="contained" color="primary">
            UPDATE NOW AND KEEP EARNING
          </CustomButton>
        </Grid>
      </DialogsActions>
    </Dialog>
  );
};

const CustomButton = styled(Button)(({ theme }) => ({
  // Custom styles for the button
}));
