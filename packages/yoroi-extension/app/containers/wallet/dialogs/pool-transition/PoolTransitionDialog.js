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
import Separator from '../../../../components/common/separator/Separator';
import { ReactComponent as ArrowRightSvg } from '../../../../assets/images/revamp/icons/arrow-right.inline.svg';

type Props = {|
  onClose: () => void,
  poolTransition?: PoolTransition | null,
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
  console.log('poolTransition', poolTransition);
  const { currentPool, suggestedPool } = poolTransition || {};

  return (
    <Dialog
      onClose={onClose}
      title={intl.formatMessage(messages.upgradeStakePool)}
      styleOverride={{ width: '648px', height: '552px', padding: 0 }}
      styleContentOverride={{ padding: 0 }}
      closeOnOverlayClick
    >
      <Typography variant="body1" mb={2} mx="24px">
        {intl.formatMessage(messages.currentStakePool)}
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center" px="24px">
        <StakePoolCard
          label={intl.formatMessage(messages.currentPool)}
          poolName={currentPool?.name}
          roa={currentPool?.roa}
          fee={currentPool?.share}
          deadlineMilliseconds={poolTransition?.deadlineMilliseconds}
          poolHash={currentPoolId}
          intl={intl}
        />

        <ArrowRightSvg />

        <StakePoolCard
          label={intl.formatMessage(messages.newPool)}
          poolName={suggestedPool?.name}
          roa={suggestedPool?.roa}
          fee={suggestedPool?.share}
          poolHash={suggestedPool?.id}
          suggestedPool
          intl={intl}
        />
      </Stack>
      <Grid
        container
        justifyContent="space-between"
        direction="column"
        style={{ marginTop: 30, marginBottom: 24 }}
      >
        <CustomButton variant="text" onClick={onClose} sx={{ color: '#242838' }}>
          {intl.formatMessage(messages.skipAndStop)}
        </CustomButton>

        <Separator />

        <CustomButton
          variant="contained"
          color="primary"
          width="100%"
          onClick={onUpdatePool}
          sx={{ marginTop: '24px' }}
        >
          {intl.formatMessage(messages.updateNow)}
        </CustomButton>
      </Grid>
    </Dialog>
  );
};

const CustomButton = styled(Button)(({ theme, color }) => ({
  width: '100%',
  fontSize: '14px',
  marginLeft: '24px',
  marginRight: '24px',
  maxWidth: '600px',
}));
