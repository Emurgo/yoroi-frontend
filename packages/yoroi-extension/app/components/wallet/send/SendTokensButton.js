import { Button, styled } from '@mui/material';
import { TransactionResult } from '../../../UI/features/transaction-review/common/types';
import { useTxReviewModal } from '../../../UI/features/transaction-review/module/ReviewTxProvider';

export const SendTokensButton = ({ disabled, onSuccess, label, stores }) => {
  const { openTxReviewModal, startLoadingTxReview, showTxResultModal } = useTxReviewModal();

  const handleSubmit = async () => {
    const signTxRequest = stores.transactionBuilderStore.updateTentativeTx();

    openTxReviewModal({
      modalView: 'transactionReview',
      submitTx: passswordInput => submitTx(passswordInput, signTxRequest),
      operations: {
        kind: 'send',
      },
      unsignedTx: signTxRequest.unsignedTx,
    });
  };

  const submitTx = async (password, signRequest) => {
    try {
      startLoadingTxReview();
      stores.transactionProcessingStore.adaSendAndRefresh({
        wallet: stores.wallets.selected,
        signRequest,
        password,
        callback: async () => {
          onSuccess();
          showTxResultModal(TransactionResult.SUCCESS);
        },
      });
    } catch (error) {
      console.log('Send Sign Error', error);
      showTxResultModal(TransactionResult.FAIL);
    }
  };

  return (
    <ActionButton
      key="amount-next"
      variant="primary"
      size="medium"
      onClick={handleSubmit}
      disabled={disabled}
      id="wallet:send:addAssetsStep-nextToConfirmTransaction-button"
    >
      {label}
    </ActionButton>
  );
};

const ActionButton = styled(Button)(() => ({
  minWidth: '128px',
  '&.MuiButton-sizeMedium': {
    padding: '13px 24px',
  },
}));
