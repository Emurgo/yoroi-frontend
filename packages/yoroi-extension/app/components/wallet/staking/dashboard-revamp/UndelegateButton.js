import { Box, Button, Stack, Typography, styled } from '@mui/material';
import BigNumber from 'bignumber.js';
import { toSvg } from 'jdenticon';
import globalMessages from '../../../../i18n/global-messages';
import { TransactionResult } from '../../../../UI/features/transaction-review/common/types';
import { useTxReviewModal } from '../../../../UI/features/transaction-review/module/ReviewTxProvider';

export const UndelegateButton = ({ poolTransition, intl, delegateToSpecificPool, poolId, poolName, stores }) => {
  const {
    openTxReviewModal,
    startLoadingTxReview,
    walletType,
    isHardwareWallet,
    stakeKeyDeposit,
    primaryTokenInfo,
    showTxResultModal,
  } = useTxReviewModal();
  const avatarSource = toSvg(poolId, 36, { padding: 0 });
  const avatarGenerated = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSource)}`;

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

    openTxReviewModal({
      modalView: 'transactionReview',
      submitTx: passswordInput => submitTx(passswordInput),
      operations: {
        components: [
          {
            component: (
              <OperationsDetails
                avatarGenerated={avatarGenerated}
                poolName={poolName}
                stakeKeyDeposit={`${new BigNumber(stakeKeyDeposit).shiftedBy(-primaryTokenInfo.decimals).toString()} ${primaryTokenInfo.name
                  }`}
              />
            ),
            duplicated: false,
          },
        ],
        kind: 'undelegate',
      },
      unsignedTx: unsignedTx.unsignedTx,
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
            onFail: () => {
              showTxResultModal(TransactionResult.FAIL);
            },
          });

        }
        if (walletType === 'ledger') {
          await stores.substores.ada.ledgerSend.sendUsingLedgerWallet({
            params: { signRequest },
            wallet: selected,
            onFail: () => {
              showTxResultModal(TransactionResult.FAIL);
            },
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

const OperationsDetails = ({ stakeKeyDeposit, avatarGenerated, poolName }) => {
  return (
    <Stack gap="8px">
      <Stack direction="row" justifyContent="space-between">
        <Typography color="ds.text_gray_low">TBD</Typography>
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
