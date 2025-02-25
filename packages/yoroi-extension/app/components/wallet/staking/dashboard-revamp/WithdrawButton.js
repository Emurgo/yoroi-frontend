import { Button, Stack, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { GovernanceParticipateDialog } from '../../../../containers/wallet/dialogs/GovernanceParticipateDialog';
import { useNavigateTo } from '../../../../UI/features/transaction-review/common/hooks/useNavigateTo';
import { useTxReviewModal } from '../../../../UI/features/transaction-review/module/ReviewTxProvider';

export const WithdrawButton = observer(({ label, govStatusFetched, stores, isDisabled }) => {
  const { openTxReviewModal, walletType, isHardwareWallet, stopLoadingTxReview, startLoadingTxReview } = useTxReviewModal();
  const navigateTo = useNavigateTo();

  const isParticipatingToGovernance = stores.delegation.governanceStatus?.drepDelegation !== null;
  const wallet = stores.wallets.selected;
  const isStakeRegistered = stores.delegation.isStakeRegistered(wallet.publicDeriverId);

  const handleRewardsWithdrawal = async () => {
    if (!isParticipatingToGovernance) {
      stores.uiDialogs.open({
        dialog: GovernanceParticipateDialog,
      });
      return;
    }
    createWithdrawalTx();
    // ampli.claimAdaPageViewed();
  };

  const createWithdrawalTx = async () => {
    const walletSelect = stores.wallets.selectedOrFail;
    stores.substores.ada.delegationTransaction.setShouldDeregister(false);
    const unsignedTx = await stores.substores.ada.delegationTransaction.createWithdrawalTxForWallet({ wallet: walletSelect });

    const txBodyjson = await unsignedTx.unsignedTx.build_tx().to_json();
    const parsedUnsignedTx = JSON.parse(txBodyjson);

    openTxReviewModal({
      title: 'Transaction review',
      modalView: 'transactionReview',
      submitTx: passswordInput => submitTx(passswordInput),
      operations: {
        components: [
          {
            component: <OperationsDetails />,
            duplicated: false,
          },
        ],
        kind: 'withdraw',
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
      //   reward_amount: signRequest.withdrawals()[0]?.amount.getDefaultEntry().amount.shiftedBy(-numberOfDecimals).toNumber(),
      // });
    } catch (error) {
      stopLoadingTxReview();
      navigateTo.transactionFail();
    }
  };

  return (
    <Button
      variant="primary"
      sx={{
        '&.MuiButton-sizeMedium': {
          height: 'unset',
          p: '9px 20px',
        },
      }}
      onClick={isStakeRegistered && govStatusFetched ? handleRewardsWithdrawal : undefined}
      disabled={isDisabled || !handleRewardsWithdrawal}
    >
      {label}
    </Button>
  );
});

const OperationsDetails = () => {
  return (
    <Stack direction="column" spacing={2}>
      <Stack direction="row" justifyContent="space-between">
        <Typography color="ds.text_gray_low">Staking</Typography>
        <Typography color="ds.text_gray_medium">Rewards withdrawal</Typography>
      </Stack>
    </Stack>
  );
};
