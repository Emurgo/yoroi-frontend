import { Button, Stack, Typography, styled } from '@mui/material';
import BigNumber from 'bignumber.js';
import globalMessages from '../../../../i18n/global-messages';
import { TransactionResult } from '../../../../UI/features/transaction-review/common/types';
import { useTxReviewModal } from '../../../../UI/features/transaction-review/module/ReviewTxProvider';

export const UndelegateButton = ({ poolTransition, intl, delegateToSpecificPool, stores }) => {
  const {
    openTxReviewModal,
    startLoadingTxReview,
    stopLoadingTxReview,
    walletType,
    isHardwareWallet,
    stakeKeyDeposit,
    primaryTokenInfo,
    showTxResultModal,
  } = useTxReviewModal();

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

    openTxReviewModal({
      modalView: 'transactionReview',
      submitTx: passswordInput => submitTx(passswordInput),
      operations: {
        components: [
          {
            component: (
              <OperationsDetails
                stakeKeyDeposit={`${new BigNumber(stakeKeyDeposit).shiftedBy(-primaryTokenInfo.decimals).toString()} ${
                  primaryTokenInfo.name
                }`}
              />
            ),
            duplicated: false,
          },
        ],
        kind: 'undelegate',
      },
      unsignedTx: parsedUnsignedTx,
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
      showTxResultModal(TransactionResult.SUCCESS);
      // ampli.claimAdaTransactionSubmitted({
      //   reward_amount: signRequest.withdrawals()[0]?.amount.getDefaultEntry().amount.toNumber(),
      // });
    } catch (error) {
      showTxResultModal(TransactionResult.FAIL);
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

const OperationsDetails = ({ stakeKeyDeposit }) => {
  return (
    <Stack gap="8px">
      <Stack direction="row" justifyContent="space-between">
        <Typography color="ds.text_gray_low">Staking</Typography>
        <Typography color="ds.text_gray_medium">Undelegation</Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography color="ds.text_gray_low">Unregister Staking key deposit</Typography>
        <Typography color="ds.text_gray_medium">{stakeKeyDeposit}</Typography>
      </Stack>
    </Stack>
  );
};

const UpdatePoolButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
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
