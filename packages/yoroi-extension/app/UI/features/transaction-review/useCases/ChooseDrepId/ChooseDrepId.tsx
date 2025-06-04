import { LoadingButton } from '@mui/lab';
import { Box, Stack, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { dRepToMaybeCredentialHex } from '../../../../../api/ada/lib/cardanoCrypto/utils';
import { TextInput } from '../../../../components';
import { useTxReviewModal } from '../../module/ReviewTxProvider';
import { useStrings } from '../../common/hooks/useStrings';

export const ChooseDrepId = () => {
  const { drepId, isLoading, changeModalView, createUnsignedTx, setDrepId } = useTxReviewModal();
  const strings = useStrings();
  const [error, setError] = React.useState(false);
  const [drepIdInput, setDrepValueId] = React.useState('');

  useEffect(() => {
    setError(false);
  }, [drepIdInput]);

  const confirmDRep = async () => {
    const dRepCredentialHex: string | null = dRepToMaybeCredentialHex(drepIdInput);

    if (dRepCredentialHex == null) {
      setError(true);
    } else {
      setDrepId({ drepID: drepIdInput });
      await createUnsignedTx(dRepCredentialHex);
      changeModalView({ modalView: 'operations', title: 'Operations' });
    }
  };

  return (
    <Stack direction="column" justifyContent="space-between" sx={{ height: '100%' }}>
      <Stack sx={{ height: '100%', mt: '24px', p: '24px' }} direction="column">
        <Typography variant="body1" color="ds.text_gray_medium" mb="16px">
          {strings.identifyDrep}
        </Typography>
        <Box>
          <TextInput
            id="setDrepValueId"
            label="Drep ID"
            variant="outlined"
            onChange={event => {
              //   dRepIdChanged(event.target.value);
              //   governanceVoteChanged({ kind: 'delegate', drepID: event.target.value });
              setDrepValueId(event.target.value);
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
          {strings.confirmLabel}
        </LoadingButton>
      </Stack>
    </Stack>
  );
};
