import { LoadingButton } from '@mui/lab';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { dRepToMaybeCredentialHex } from '../../../../api/ada/lib/cardanoCrypto/utils';
import { TextInput } from '../../../components/Input/TextInput';
import { useModal } from '../../../components/modals/ModalContext';
import { useGovernance } from '../module/GovernanceContextProvider';
import { useStrings } from './useStrings';

type ChooseDRepModallProps = {
  onSubmit?: (drepId: string, drepCredential: string) => void;
};

export const ChooseDRepModal = ({ onSubmit }: ChooseDRepModallProps) => {
  const [drepId, setDrepId] = React.useState('');
  const [error, setError] = React.useState(false);
  const { dRepIdChanged, governanceVoteChanged } = useGovernance();
  const { isLoading } = useModal();
  const strings = useStrings();

  React.useEffect(() => {
    setError(false);
  }, [drepId]);

  const confirmDRep = () => {
    const dRepCredentialHex: string | null = dRepToMaybeCredentialHex(drepId);
    if (dRepCredentialHex == null) {
      setError(true);
    } else {
      onSubmit?.(drepId, dRepCredentialHex);
    }
  };

  return (
    <Stack justifyContent="flex-between">
      <Stack pb="34px" pt="8px">
        <Typography variant="body1" textAlign="left" mb="24px" color="ds.text_gray_medium">
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
        />
      </Stack>
      <LoadingButton
        loading={isLoading}
        onClick={confirmDRep}
        fullWidth
        // @ts-ignore
        variant="primary"
        disabled={error || drepId.length === 0}
      >
        {strings.confirm}
      </LoadingButton>
    </Stack>
  );
};
