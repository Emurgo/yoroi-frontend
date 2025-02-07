import { LoadingButton } from '@mui/lab';
import { Box, Stack, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { dRepToMaybeCredentialHex } from '../../../../../api/ada/lib/cardanoCrypto/utils';
import { TextInput } from '../../../../components';
import { useTxReviewModal } from '../../module/ReviewTxProvider';

export const ChooseDrepId = () => {
  const { chooseDrepId, drepId, isLoading, changeModalView, createUnsignedTx } = useTxReviewModal();
  const [error, setError] = React.useState(false);
  const [drepIdInput, setDrepId] = React.useState('');

  useEffect(() => {
    setError(false);
  }, [drepId]);

  const confirmDRep = async () => {
    const dRepCredentialHex: string | null = dRepToMaybeCredentialHex(drepIdInput);

    if (dRepCredentialHex == null) {
      setError(true);
    } else {
      await createUnsignedTx(dRepCredentialHex);
      changeModalView({ modalView: 'operations', title: 'Operations' });
    }
  };

  return (
    <Stack direction="column" justifyContent="space-between" sx={{ height: '100%' }}>
      <Stack sx={{ height: '100%', mt: '24px', p: '24px' }} direction="column">
        <Typography variant="body1" color="ds.text_gray_medium" mb="16px">
          Identify your preferred DRep and enter their ID below to delegate your vote:
        </Typography>
        <Box>
          <TextInput
            id="setDrepId"
            label="Drep ID"
            variant="outlined"
            onChange={event => {
              //   dRepIdChanged(event.target.value);
              //   governanceVoteChanged({ kind: 'delegate', drepID: event.target.value });
              setDrepId(event.target.value);
            }}
            value={drepId}
            error={error}
            helperText={error ? 'Incorect Format' : ' '}
          />
        </Box>
      </Stack>
      <Stack direction="row" justifyContent="space-between" p="24px">
        <LoadingButton
          //  @ts-ignore
          variant="primary"
          sx={{ width: '100%' }}
          onClick={() => {
            confirmDRep();
          }}
          disabled={drepIdInput === undefined || drepIdInput.length === 0}
          loading={isLoading}
        >
          Confirm
        </LoadingButton>
      </Stack>
    </Stack>
  );
};
