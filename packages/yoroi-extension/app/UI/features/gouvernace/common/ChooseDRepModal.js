// @flow

import * as React from 'react';
import type { Node } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { CustomModal } from '../../../components/modals/CustomModal';
import { TextInput } from '../../../components';
import { parseDrepId, useIsValidDRepID } from '@yoroi/staking';
import { isNonNullable } from '@yoroi/common';
import { RustModule } from '../../../../api/ada/lib/cardanoCrypto/rustLoader';

type ChooseDRepModallProps = {|
  onSubmit?: (drepId: string) => void,
|};

export const ChooseDRepModal = ({ onSubmit }: ChooseDRepModallProps): Node => {
  const [drepId, setDrepId] = React.useState('');

  // TODO hook endpoint not working well
  const { error, isFetched, isFetching } = useIsValidDRepID(drepId, {
    retry: false,
    enabled: drepId.length > 0,
  });

  const confirmDRep = () => {
    // TODO add spcecific validation if needed
    onSubmit?.(drepId);
    // TODO hook endpoint not working well
    // parseDrepId(drepId, RustModule.CrossCsl.init)
    //   .then(parsedId => {
    //     console.log('parsedId', parsedId);
    //   })
    //   .catch(err => {
    //     console.log('err', err);
    //   });
  };

  const idInvalid = drepId.match(/\d+/g);

  return (
    <Stack>
      <Stack gap="24px" mb="48px">
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

      <Button
        onClick={confirmDRep}
        fullWidth
        variant="primary"
        // disabled={isNonNullable(error) || drepId.length === 0 || !isFetched || isFetching}
        disabled={drepId.length === 0 || idInvalid}
      >
        Confirm
      </Button>
    </Stack>
  );
};
