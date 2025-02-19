import { Box, Button, Stack, Typography } from '@mui/material';
import { toSvg } from 'jdenticon';
import { useTxReviewModal } from '../../../../UI/features/transaction-review/module/ReviewTxProvider';

export const DelegateButton = ({ stores, isTestnet, label, isWalletWithNoFunds, poolID }) => {
  const { openTxReviewModal, startLoadingTxReview, stopLoadingTxReview, networkId, closeTxReviewModal } = useTxReviewModal();

  const avatarSource = toSvg(poolID, 36, { padding: 0 });
  const avatarGenerated = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSource)}`;
  const selectedPool = stores.delegation.getLocalPoolInfo(networkId, poolID);
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
        total: parsedUnsignedTx.body.fee / 1000000 + 2, // TODO refactor - add proper calculation
      },
      operations: {
        components: [
          {
            component: <OperationsDetails avatarGenerated={avatarGenerated} poolName={selectedPool?.info.name} />,
            duplicated: false,
          },
        ],
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
    } catch (error) {
      console.warn('Delegation error', error);
    } finally {
      stopLoadingTxReview();
      closeTxReviewModal();
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

const OperationsDetails = ({ avatarGenerated, poolName }) => {
  return (
    <Stack direction="column" spacing={2}>
      <Stack direction="row" justifyContent="space-between">
        <Typography color="ds.text_gray_low">Register Staking key deposit</Typography>
        <Typography color="ds.text_gray_medium">2.000000 ADA</Typography>
      </Stack>
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
