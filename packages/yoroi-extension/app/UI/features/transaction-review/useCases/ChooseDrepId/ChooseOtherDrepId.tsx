import { LoadingButton } from '@mui/lab';
import { Box, Link, Stack, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { dRepToMaybeCredentialHex } from '../../../../../api/ada/lib/cardanoCrypto/utils';
import { TextInput } from '../../../../components';
import { useTxReviewModal } from '../../module/ReviewTxProvider';
import { useStrings } from '../../common/hooks/useStrings';
import { GOVERNANCE_STATUS, YOROI_DREP_ID, FIND_DREPS_LINK } from '../../../governace/common/constants';
import { GovernanceStatusRevampCard } from '../../../governace/useCases/GovernanceStatusRevamp/GovernanceStatusRevampCard';
import { useGovernanceDelegationToYoroiDrep } from '../../../governace/common/hooks/useGovernanceDelegationToYoroiDrep';

export const ChooseOtherDrepId = () => {
  const { drepId, isLoading, changeModalView, createUnsignedTx, setDrepId } = useTxReviewModal();
  const { delegateToDrep } = useGovernanceDelegationToYoroiDrep();
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
    <Stack direction={'column'} justifyContent={'space-between'} height={'100%'}>
      <Stack direction="column">
        <Stack sx={{ height: '100%', mt: '24px', p: '24px' }} direction="column">
          <Typography variant="body1" color="ds.text_gray_medium" mb="16px">
            {strings.findPreferredDrep}
          </Typography>
          <Box>
            <TextInput
              id="setDrepValueId"
              label="Drep ID"
              variant="outlined"
              onChange={event => {
                setDrepValueId(event.target.value);
              }}
              value={drepId}
              error={error}
              helperText={error ? 'Incorect Format' : ' '}
            />
          </Box>
        </Stack>
        <Stack direction={'column'} sx={{ justifyContent: 'center', alignItems: 'center' }}>
          <Stack direction={'row'} alignItems={'center'} gap={8}>
            <Typography variant="body1" color="ds.text_gray_medium">
              {strings.dontHaveId}
            </Typography>
            <Link href={FIND_DREPS_LINK} rel="noopener" target="_blank" underline="hover">
              {strings.findDrepHere}
            </Link>
          </Stack>
          <Typography variant="body1" color="ds.text_gray_medium">
            {strings.delegateToYoroi}
          </Typography>
        </Stack>
        <Stack p={24}>
          <GovernanceStatusRevampCard
            state={GOVERNANCE_STATUS.DELEGATED}
            governanceStatus={{ status: GOVERNANCE_STATUS.IDLE, drep: YOROI_DREP_ID }}
            forModal
            onDelegateClick={() => delegateToDrep(YOROI_DREP_ID)}
          />
        </Stack>
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
