import { Button, Stack, Typography } from '@mui/material';
import React from 'react';
import { useTxReviewModal } from '../../../../UI/features/transaction-review/module/ReviewTxProvider';

export const DelegateButton = ({ stores, isTestnet, label, isWalletWithNoFunds, poolID }) => {
  const { openTxReviewModal, startLoadingTxReview, stopLoadingTxReview } = useTxReviewModal();

  const onDelegate = async () => {
    const id = isTestnet ? '7facad662e180ce45e5c504957cd1341940c72a708728f7ecfc6e349' : poolID;
    const { signTxRequest } = await stores.delegation.createDelegationTransaction(id);
    const txBodyjson = await signTxRequest.unsignedTx.build_tx().to_json();
    const parsedUnsignedTx = JSON.parse(txBodyjson);

    openTxReviewModal({
      title: 'Transaction review',
      modalView: 'transactionReview',
      submitTx: passswordInput => submitTx(passswordInput),
      operationFee: {
        total: parsedUnsignedTx.body.fee / 1000000,
      },
      operations: {
        components: [{ component: <OperationsDetails />, duplicated: false }],
      },
      unsignedTx: parsedUnsignedTx, // Ensure it stays in sync with the store
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
      // ampli.stakingCenterDelegationSubmitted({
      //   ada_amount: delegationTx.totalAmountToDelegate.getDefault().shiftedBy(-numberOfDecimals).toNumber(),
      //   staking_pool: selectedPoolId,
      // });
      stopLoadingTxReview();
    } catch (error) {
      stopLoadingTxReview();
    }
  };

  return (
    <Button
      variant="primary"
      sx={{
        '&.MuiButton-sizeMedium': {
          padding: '9px 20px',
        },
      }}
      onClick={onDelegate}
      disabled={isWalletWithNoFunds}
    >
      {label}
    </Button>
  );
};

const OperationsDetails = () => {
  return (
    <Stack direction="column" spacing={2}>
      <Stack direction="row" justifyContent="space-between">
        <Typography color="ds.text_gray_low">Register Staking key deposit</Typography>
        <Typography color="ds.text_gray_medium">2.000000 ADA</Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography color="ds.text_gray_low">Stake entire wallet balance to</Typography>
        <Typography color="ds.text_gray_medium">Pool name mock</Typography>
      </Stack>
    </Stack>
  );
};
