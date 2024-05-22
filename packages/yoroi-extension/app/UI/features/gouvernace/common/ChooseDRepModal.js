// @flow

import * as React from 'react';
import type { Node } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { CustomModal } from '../../../components/modals/CustomModal';
import { useGouvernance } from '../module/GouvernanceContextProvider';

type ChooseDRepModallProps = {|
  onClose: () => void,
  title: string,
  confirmDRep: () => void,
  setDrepId: (id: string) => void,
  drepId: string,
|};

export const ChooseDRepModal = ({ onClose, title }: ChooseDRepModallProps): Node => {
  const [drepId, setDrepId] = React.useState('');
  const { dRepIdChanged, gouvernanceStatusChanged } = useGouvernance();

  const confirmDRep = () => {
    // TODO add spcecific validation if needed
    dRepIdChanged(drepId);
  };

  return (
    <CustomModal
      onClose={onClose}
      title={title}
      confirmDRep={confirmDRep}
      content={
        <Stack gap="40px">
          <Typography variant="body1" textAlign="center">
            Identify your preferred DRep and enter their ID below to delegate your vote
          </Typography>
          <TextField
            id="setDrepId"
            label="DRep ID"
            variant="outlined"
            onChange={event => {
              console.log('event.target.value', event.target.value);
              setDrepId(event.target.value);
            }}
            value={drepId}
          />
        </Stack>
      }
      actions={
        <Button onClick={confirmDRep} fullWidth variant="primary">
          Confirm
        </Button>
      }
    />
  );
};
