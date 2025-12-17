import { Button, Stack, Typography } from '@mui/material';
import { GovernanceParticipateDialog } from '../../../../../containers/wallet/dialogs/GovernanceParticipateDialog';
import { useTxReviewModal } from '../../../transaction-review/module/ReviewTxProvider';
import { TransactionResult } from '../../../transaction-review/common/types';
import { useStrings } from '../../common/hooks/useStrings';
import { useStaking } from '../../module/StakingContextProvider';

export const WithdrawButton = ({ govStatusFetched, isDisabled }) => {
  const { openTxReviewModal, stopLoadingTxReview, startLoadingTxReview, showTxResultModal } = useTxReviewModal();
  const strings = useStrings();
  const { stores } = useStaking();

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
    return createWithdrawalTx();
  };

  const createWithdrawalTx = async () => {
    const walletSelect = stores.wallets.selectedOrFail;
    stores.substores.ada.delegationTransaction.setShouldDeregister(false);
    const { unsignedTx } = await stores.substores.ada.delegationTransaction.createWithdrawalTxForWallet({ wallet: walletSelect });

    openTxReviewModal({
      modalView: 'transactionReview',
      submitTx: passswordInput => submitTx(passswordInput),
      operations: {
        components: [
          {
            component: <OperationsDetails />,
            duplicated: false,
          },
        ],
        kind: 'withdraw rewards',
      },
      unsignedTx,
    });
  };

  const submitTx = async password => {
    const signRequest = stores.substores.ada.delegationTransaction.createWithdrawalTx.result;
    if (signRequest == null) return;
    try {
      startLoadingTxReview();

      await stores.transactionProcessingStore.adaSendAndRefresh({
        wallet: stores.wallets.selected,
        signRequest,
        password,
        callback: async () => {},
      });

      stopLoadingTxReview();
      showTxResultModal(TransactionResult.SUCCESS);
    } catch (_error) {
      stopLoadingTxReview();
      showTxResultModal(TransactionResult.FAIL);
    }
  };

  return (
    <Button
      // @ts-ignore
      variant="primary"
      sx={{
        lineHeight: '22px',
        '&.MuiButton-sizeMedium': {
          fontSize: '14px',
          height: 'unset',
          p: '9px 20px',
        },
      }}
      onClick={isStakeRegistered && govStatusFetched ? handleRewardsWithdrawal : undefined}
      disabled={isDisabled}
    >
      {strings.withdrawLabel}
    </Button>
  );
};

const OperationsDetails = () => {
  return (
    <Stack direction="column" spacing={16}>
      <Stack direction="row" justifyContent="space-between">
        <Typography color="ds.text_gray_low">Staking</Typography>
        <Typography color="ds.text_gray_medium">Rewards withdrawal</Typography>
      </Stack>
    </Stack>
  );
};
