import { Box, Link, Stack, Typography } from '@mui/material';
import { useEffect } from 'react';
import { PasswordInput } from '../../../../components';
import { useTxReviewModal } from '../../module/ReviewTxProvider';
import { Ilustration } from './Ilustration';
import { useStrings } from '../../common/hooks/useStrings';
import { RESTORE_WALLET_HELP_URL } from '../../../../common/constants';
import { useTxBody } from '../../common/hooks/usetxBody';
import { useFormattedTx } from '../../common/hooks/useFormattedTx';
import { EventDefinitions } from '../../../../../../posthog/events';
import { captureEvent } from '../../../../../../posthog';

export const SubmitInput = () => {
  const { inputError, changePasswordInputValue, passswordInput, operations, setInputError, walletType, cborTx, unsignedTx } =
    useTxReviewModal();
  const strings = useStrings();

  const txBody: any = useTxBody({ cbor: cborTx, unsignedTx });
  const formattedTx = useFormattedTx(cborTx ? txBody : txBody?.body);

  useEffect(() => {
    const analyticsParams = getTransactionAnalyticsPropertiesFromRaw(formattedTx, operations?.kind, operations?.aggregator);
    captureEvent('Transaction Review Modal Viewed', analyticsParams);
  }, []);

  useEffect(() => {
    setInputError({ type: 'setInputError', inputError: false });
  }, [passswordInput]);

  if (walletType === 'trezor' || walletType === 'ledger') {
    return (
      <Stack direction="column" height="100%" justifyContent="center" alignItems="center" p="24px">
        <Ilustration />
        <Typography color="ds.text_gray_medium" fontSize="16px" mt="16px" mb="8px">
          {strings.confirmHardware}
        </Typography>
        <Typography color="ds.text_gray_low" variant="body1" textAlign="center">
          {strings.takeHardwareWallet}
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack sx={{ height: '100%', mt: '24px', p: '24px' }} direction="column">
      <Typography variant="body1" color="ds.text_gray_medium" mb="16px">
        {strings.enterPassword}
      </Typography>
      <Box>
        <PasswordInput
          label={strings.password}
          id="txReview:submitTransaction-password-input"
          onChange={e => {
            changePasswordInputValue({ type: 'changeInputValue', passswordInput: e.target.value });
          }}
          value={passswordInput} // Use local state to ensure reactivity
          error={inputError}
          helperText={inputError ? strings.wrongPassword : ' '}
        />
      </Box>
      <Stack sx={{ height: '100%' }} direction="column" alignItems="center" justifyContent="flex-end">
        <Typography variant="body1" textAlign={'center'}>
          {strings.forgotPassword}
          &nbsp;
          <Link href={RESTORE_WALLET_HELP_URL} target="_blank" rel="noopener noreferrer">
            {strings.learnMore}
          </Link>
          &nbsp;
          {strings.howToRestorePassword}
        </Typography>
      </Stack>
    </Stack>
  );
};

type TxAnalyticsPayload = EventDefinitions['Transaction Review Modal Viewed'][0];

/**
 * Builds analytics properties for a transaction using the
 * not owned - outputs (tokens leaving the wallet)
 */
export const getTransactionAnalyticsPropertiesFromRaw = (formattedTx, context?, aggregator?: string): TxAnalyticsPayload => {
  const notOwnedOutputs = formattedTx.outputs.filter(output => !output.ownAddress);

  const spentAssets = notOwnedOutputs.flatMap(output => output.assets ?? []);

  const uniqueAssets = new Map<
    string,
    {
      policy_id: string;
      asset_name: string;
      asset_ticker: string;
    }
  >();

  spentAssets.forEach(asset => {
    const ti = asset.tokenInfo;
    let rawId: string | undefined;

    if (ti.info?.id) {
      rawId = ti.info.id;
    } else if (ti.id && ti.id.includes('.')) {
      rawId = ti.id;
    }

    // Handle ADA or weird cases (no policy/asset).
    if (!rawId) {
      rawId = ti.id ?? '.';
    }

    const [policyId = '', assetNameHex = ''] = (rawId ?? '.').split('.');
    const key = `${policyId}.${assetNameHex}`;

    if (!uniqueAssets.has(key)) {
      const ticker = ti.ticker ?? ti.info?.name ?? ti.name ?? '';

      uniqueAssets.set(key, {
        policy_id: policyId,
        asset_name: assetNameHex,
        asset_ticker: ticker,
      });
    }
  });

  return {
    type: context ?? '',
    asset_count: uniqueAssets.size,
    asset_list: JSON.stringify(Array.from(uniqueAssets.values())),
    aggregator: aggregator ?? '',
  };
};
