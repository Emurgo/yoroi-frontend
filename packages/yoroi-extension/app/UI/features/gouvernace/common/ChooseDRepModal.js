// @flow

import * as React from 'react';
import type { Node } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { CustomModal } from '../../../components/modals/CustomModal';
import { useGouvernance } from '../module/GouvernanceContextProvider';
import { useNavigateTo } from './useNavigateTo';
import { TextInput } from '../../../components';

type ChooseDRepModallProps = {|
  onClose: () => void,
  title: string,
  confirmDRep: () => void,
  setDrepId: (id: string) => void,
  drepId: string,
|};

export const ChooseDRepModal = ({ onClose, title }: ChooseDRepModallProps): Node => {
  const [drepId, setDrepId] = React.useState('');
  const navigateTo = useNavigateTo();
  const { dRepIdChanged, gouvernanceStatusChanged } = useGouvernance();

  const confirmDRep = () => {
    // TODO add spcecific validation if needed
    dRepIdChanged(drepId);
    navigateTo.delegationForm();
  };

  const idInvalid = drepId.match(/\d+/g);

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
          <TextInput
            id="setDrepId"
            label="DRep ID"
            variant="outlined"
            onChange={event => {
              setDrepId(event.target.value);
            }}
            value={drepId}
            error={!!idInvalid}
            helperText={idInvalid ? 'Incorrect format' : ' '}
          />
        </Stack>
      }
      actions={
        <Button onClick={confirmDRep} fullWidth variant="primary" disabled={idInvalid}>
          Confirm
        </Button>
      }
    />
  );
};
