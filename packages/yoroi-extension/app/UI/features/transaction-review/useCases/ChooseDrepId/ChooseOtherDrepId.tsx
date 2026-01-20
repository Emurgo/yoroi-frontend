import { LoadingButton } from '@mui/lab';
import { Box, Link, Stack, Typography } from '@mui/material';
import React from 'react';
import { dRepToMaybeCredentialHex } from '../../../../../api/ada/lib/cardanoCrypto/utils';
import { TextInput } from '../../../../components';
import { useTxReviewModal } from '../../module/ReviewTxProvider';
import { useStrings } from '../../common/hooks/useStrings';
import {
  GOVERNANCE_STATUS,
  YOROI_DREP_ID,
  FIND_DREPS_LINK,
  FIND_DREPS_LINK_TESTNET,
  YOROI_DREP_ID_TESTNET,
} from '../../../governace/common/constants';
import { GovernanceStatusCard } from '../../../governace/useCases/GovernanceStatus/GovernanceStatusCard';
import { useGovernanceDelegationToYoroiDrep } from '../../../governace/common/hooks/useGovernanceDelegationToYoroiDrep';
import { useGovernance } from '../../../governace/module/GovernanceContextProvider';

const HANDLE_API = 'https://api.handle.me/handles';

type DrepError = null | 'INVALID_FORMAT' | 'HANDLE_NO_DREP' | 'HANDLE_NOT_FOUND' | 'HANDLE_LOOKUP_FAILED';

const sanitizeHandle = (raw: string) => raw.trim().replace(/^\$/, '');

const looksLikeHandle = (raw: string) => {
  const v = raw.trim();
  return v.startsWith('$') || v.includes('@');
};

const resolveDrepIdFromHandle = async (raw: string): Promise<{ drepId: string | null; error: DrepError }> => {
  const handle = sanitizeHandle(raw);
  if (!handle) return { drepId: null, error: 'INVALID_FORMAT' };

  try {
    const res = await fetch(`${HANDLE_API}/${encodeURIComponent(handle)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (res.status === 404) {
      return { drepId: null, error: 'HANDLE_NOT_FOUND' };
    }

    if (!res.ok) {
      return { drepId: null, error: 'HANDLE_LOOKUP_FAILED' };
    }

    const data: any = await res.json();

    if (!data?.drep) {
      return { drepId: null, error: 'HANDLE_NO_DREP' };
    }

    const drepId = data.drep.cip_105 ?? data.drep.cip_129 ?? null;
    if (!drepId) return { drepId: null, error: 'HANDLE_NO_DREP' };

    return { drepId, error: null };
  } catch {
    return { drepId: null, error: 'HANDLE_LOOKUP_FAILED' };
  }
};

export const ChooseOtherDrepId = () => {
  const { isLoading, changeModalView, createUnsignedTx, setDrepId } = useTxReviewModal();
  const { delegateToDrep } = useGovernanceDelegationToYoroiDrep();
  const { isTestnet } = useGovernance();
  const strings = useStrings();

  const findDrepLink = isTestnet ? FIND_DREPS_LINK_TESTNET : FIND_DREPS_LINK;
  const yoroiDrepId = isTestnet ? YOROI_DREP_ID_TESTNET : YOROI_DREP_ID;

  const [drepIdInput, setDrepIdInput] = React.useState('');
  const [error, setError] = React.useState<DrepError>(null);

  const getHelperText = (error: DrepError) => {
    switch (error) {
      case 'HANDLE_NO_DREP':
        return strings.handleNoDrep;
      case 'HANDLE_NOT_FOUND':
        return strings.adaHandleNotFound;
      case 'HANDLE_LOOKUP_FAILED':
        return strings.handleLookupFailed;
      case 'INVALID_FORMAT':
        return strings.invalidFormat;
      default:
        return ' ';
    }
  };

  const confirmDRep = async () => {
    const raw = drepIdInput.trim();
    if (!raw) return;

    setError(null);

    let resolvedDrepId = raw;

    if (looksLikeHandle(raw)) {
      const { drepId, error } = await resolveDrepIdFromHandle(raw);

      if (error || !drepId) {
        setError(error ?? 'HANDLE_LOOKUP_FAILED');
        return;
      }

      resolvedDrepId = drepId;
    }

    const dRepCredentialHex: string | null = dRepToMaybeCredentialHex(resolvedDrepId);
    if (dRepCredentialHex == null) {
      setError('INVALID_FORMAT');
      return;
    }

    setDrepId({ drepID: resolvedDrepId });
    await createUnsignedTx(dRepCredentialHex);
    changeModalView({ modalView: 'operations', title: 'Operations' });
  };

  return (
    <Stack direction="column" justifyContent="space-between" height="100%">
      <Stack direction="column">
        <Stack sx={{ height: '100%', mt: '24px', p: '24px' }} direction="column">
          <Typography variant="body1" color="ds.text_gray_medium" mb="16px">
            {strings.findPreferredDrep}
          </Typography>

          <Box>
            <TextInput
              id="setDrepValueId"
              label={strings.drepOrAdaHandle}
              variant="outlined"
              onChange={event => {
                setDrepIdInput(event.target.value);
                if (error) setError(null);
              }}
              value={drepIdInput}
              error={Boolean(error)}
              helperText={getHelperText(error)}
            />
          </Box>
        </Stack>

        <Stack direction="column" sx={{ justifyContent: 'center', alignItems: 'center' }}>
          <Stack direction="row" alignItems="center" gap={8}>
            <Typography variant="body1" color="ds.text_gray_medium">
              {strings.dontHaveId}
            </Typography>

            <Link href={findDrepLink} rel="noopener" target="_blank" underline="hover">
              {strings.findDrepHere}
            </Link>
          </Stack>

          <Typography variant="body1" color="ds.text_gray_medium">
            {strings.delegateToYoroi}
          </Typography>
        </Stack>

        <Stack p={24}>
          <GovernanceStatusCard
            state={GOVERNANCE_STATUS.DELEGATED}
            governanceStatus={{ status: GOVERNANCE_STATUS.IDLE, drep: yoroiDrepId }}
            forModal
            onDelegateClick={() => delegateToDrep(yoroiDrepId)}
          />
        </Stack>
      </Stack>

      <Stack direction="row" justifyContent="space-between" p="24px">
        <LoadingButton
          // @ts-ignore
          variant="primary"
          sx={{ width: '100%' }}
          onClick={confirmDRep}
          disabled={!drepIdInput.trim()}
          loading={isLoading}
        >
          {strings.confirmLabel}
        </LoadingButton>
      </Stack>
    </Stack>
  );
};
