import { Box, Stack, Typography } from '@mui/material';
import { toSvg } from 'jdenticon';
import React from 'react';
import { useTxReviewModal } from '../../../UI/features/transaction-review/module/ReviewTxProvider';
import SeizaFetcher from './SeizaFetcher';

export const SeizaFetcherSection = ({ urlTemplate, locale, bias, totalAda, poolList, setFirstPool, stores }) => {
  const { openTxReviewModal, startLoadingTxReview, stopLoadingTxReview, networkId, closeTxReviewModal } = useTxReviewModal();

  const onDelegate = async poolID => {
    const avatarSource = toSvg(poolID, 36, { padding: 0 });
    const avatarGenerated = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSource)}`;
    const { signTxRequest } = await stores.delegation.createDelegationTransaction(poolID);
    const selectedPool = await stores.delegation.getLocalPoolInfo(networkId, poolID);
    const txBodyjson = await signTxRequest.unsignedTx.build_tx().to_json();
    const parsedUnsignedTx = JSON.parse(txBodyjson);

    openTxReviewModal({
      title: 'Transaction review',
      modalView: 'transactionReview',
      submitTx: passswordInput => submitTx(passswordInput),
      operations: {
        components: [
          {
            component: <OperationsDetails avatarGenerated={avatarGenerated} poolName={selectedPool?.info.name} />,
            duplicated: false,
          },
        ],
        kind: 'delegate',
      },
      unsignedTx: parsedUnsignedTx,
    });
  };

  const submitTx = async passswordInput => {
    const selectedWallet = stores.wallets.selected;
    try {
      startLoadingTxReview();
      await stores.substores.ada.delegationTransaction.signTransaction({
        password: passswordInput,
        wallet: selectedWallet,
        dialog: null,
      });
      // ampli.stakingCenterDelegationInitiated();
    } catch (error) {
      console.warn('Failed to sign transaction', error);
    } finally {
      stopLoadingTxReview();
      closeTxReviewModal();
    }
  };

  return (
    <Box sx={{ iframe: { minHeight: '60vh' } }}>
      {/* {this.getDialog()} */}
      <SeizaFetcher
        urlTemplate={urlTemplate}
        locale={locale}
        bias={bias}
        totalAda={totalAda}
        poolList={poolList}
        setFirstPool={setFirstPool}
        stakepoolSelectedAction={async poolId => {
          onDelegate(poolId);
        }}
      />
    </Box>
  );
};

const OperationsDetails = ({ avatarGenerated, poolName }) => {
  const { isStakeRegistered, stakeKeyDeposit, primaryTokenInfo } = useTxReviewModal();
  console.log('isStakeRegistered', isStakeRegistered);
  return (
    <Stack direction="column" spacing={2}>
      {!isStakeRegistered && (
        <Stack direction="row" justifyContent="space-between">
          <Typography color="ds.text_gray_low">Register Staking key deposit</Typography>
          <Typography color="ds.text_gray_medium">
            {stakeKeyDeposit} {primaryTokenInfo.name}
          </Typography>
        </Stack>
      )}
      <Stack direction="row" justifyContent="space-between">
        <Typography color="ds.text_gray_low">Stake entire wallet balance to</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'inline-block',
            }}
            component="img"
            src={avatarGenerated}
          />
          <Typography color="ds.text_gray_medium">{poolName}</Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};
