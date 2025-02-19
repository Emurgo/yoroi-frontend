import { Button, Stack, Typography, styled } from '@mui/material';
import React from 'react';
import globalMessages from '../../../../i18n/global-messages';
import { useTxReviewModal } from '../../../../UI/features/transaction-review/module/ReviewTxProvider';

export const UndelegateButton = ({ poolTransition, intl, delegateToSpecificPool, stores }) => {
  const { openTxReviewModal, startLoadingTxReview, stopLoadingTxReview, walletType, isHardwareWallet } = useTxReviewModal();

  if (poolTransition?.shouldShowTransitionFunnel) {
    return (
      <UpdatePoolButton variant="danger" onClick={() => delegateToSpecificPool(poolTransition.suggestedPool?.hash ?? '')}>
        {intl.formatMessage(globalMessages.updatePool)}
      </UpdatePoolButton>
    );
  }

  const handleUndelegate = async () => {
    const walletSelect = stores.wallets.selectedOrFail;
    stores.substores.ada.delegationTransaction.setShouldDeregister(true);
    const unsignedTx = await stores.substores.ada.delegationTransaction.createWithdrawalTxForWallet({ wallet: walletSelect });

    const txBodyjson = await unsignedTx.unsignedTx.build_tx().to_json();
    const parsedUnsignedTx = JSON.parse(txBodyjson);
    console.log('parsedUnsignedTx', parsedUnsignedTx);

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
    const selected = stores.wallets.selected;
    const signRequest = stores.substores.ada.delegationTransaction.createWithdrawalTx.result;
    if (signRequest == null) return;

    try {
      startLoadingTxReview();
      if (isHardwareWallet) {
        if (walletType === 'trezor') {
          await stores.substores.ada.trezorSend.sendUsingTrezor({
            params: { signRequest },
            wallet: selected,
          });
        }
        if (walletType === 'ledger') {
          await stores.substores.ada.ledgerSend.sendUsingLedgerWallet({
            params: { signRequest },
            wallet: selected,
          });
        }
      } else {
        await stores.substores.ada.mnemonicSend.sendMoney({
          signRequest,
          password: passswordInput,
          wallet: selected,
        });
      }
      stopLoadingTxReview();
      // ampli.claimAdaTransactionSubmitted({
      //   reward_amount: signRequest.withdrawals()[0]?.amount.getDefaultEntry().amount.toNumber(),
      // });
    } catch (error) {
      console.log('error', error);
      stopLoadingTxReview();
    }
  };

  return (
    <UndelegateBtn
      variant="tertiary"
      color="primary"
      onClick={handleUndelegate}
      disabled={!handleUndelegate}
      sx={{
        lineHeight: '21px',
        '&.MuiButton-sizeMedium': {
          height: 'unset',
          p: '9px 15px',
        },
      }}
    >
      {intl.formatMessage(globalMessages.undelegateLabel)}
    </UndelegateBtn>
  );
};

const OperationsDetails = () => {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography color="ds.text_gray_low">Staking</Typography>
      <Typography color="ds.text_gray_medium">Undelagate</Typography>
    </Stack>
  );
};

const UpdatePoolButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  // width: 'unset',
  width: '140px',
  marginLeft: 'auto',
  background: theme.palette.ds.sys_magenta_500,
  color: 'white',
  height: '40px',
  padding: '0px !important',
  fontSize: '14px',
  '&:hover': {
    backgroundColor: theme.palette.ds.sys_magenta_500,
    color: 'white',
  },
}));

const UndelegateBtn = styled(Button)({
  minWidth: 'auto',
  width: 'unset',
  marginLeft: 'auto',
});
