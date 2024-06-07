// @flow

import * as React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { TextInput } from '../../../components/index';
import { parseDrepId, useIsValidDRepID } from '@yoroi/staking';
import { RustModule } from '../../../../api/ada/lib/cardanoCrypto/rustLoader';
import { useGovernance } from '../module/GovernanceContextProvider';
import { useStrings } from './useStrings';

type ChooseDRepModallProps = {|
  onSubmit?: (drepId: string) => void,
|};

export const ChooseDRepModal = ({ onSubmit }: ChooseDRepModallProps) => {
  const [drepId, setDrepId] = React.useState('');
  const [error, setError] = React.useState(false);

  const { dRepIdChanged, governanceVoteChanged } = useGovernance();
  const strings = useStrings();

  // TODO hook endpoint not working well
  // const { error, isFetched, isFetching } = useIsValidDRepID(drepId, {
  //   retry: false,
  //   enabled: drepId.length > 0,
  // });

  React.useEffect(() => {
    setError(false);
  }, [drepId]);

  const confirmDRep = () => {
    parseDrepId(drepId, RustModule.CrossCsl.init('any'))
      .then(parsedId => {
        onSubmit?.(drepId);
      })
      .catch(err => {
        setError(true);
      });
  };

  const idInvalid = drepId.match(/\d+/g);

  return (
    <Stack justifyContent="flex-between">
      <Stack pb="50px">
        <Typography variant="body1" textAlign="center" mb="34px">
          {strings.identifyDrep}
        </Typography>
        <TextInput
          id="setDrepId"
          label={strings.drepId}
          variant="outlined"
          onChange={event => {
            dRepIdChanged(event.target.value);
            governanceVoteChanged({ kind: 'delegate', drepID: event.target.value });
            setDrepId(event.target.value);
          }}
          value={drepId}
          error={error}
          helperText={error ? strings.incorectFormat : ' '}
          defaultValue="drep1wn0dklu87w8d9pkuyr7jalulgvl9w2he0hn0fne9k5a6y4d55mt"
        />
      </Stack>

      <Button onClick={confirmDRep} fullWidth variant="primary" disabled={error || drepId.length === 0}>
        {strings.confirm}
      </Button>
    </Stack>
  );
};
