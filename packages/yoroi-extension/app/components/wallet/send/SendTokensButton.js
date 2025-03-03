import { Button, styled } from '@mui/material';
import { TransactionResult } from '../../../UI/features/transaction-review/common/types';
import { useTxReviewModal } from '../../../UI/features/transaction-review/module/ReviewTxProvider';

export const SendTokensButton = ({ disabled, onSuccess, label, stores }) => {
  const {
    openTxReviewModal,
    startLoadingTxReview,
    stopLoadingTxReview,
    closeTxReviewModal,
    showTxResultModal,
    isHardwareWallet,
  } = useTxReviewModal();

  const handleSubmit = async () => {
    const signTxRequest = stores.transactionBuilderStore.updateTentativeTx();
    const txBodyjson = await signTxRequest.unsignedTx.build_tx().to_json();
    const parsedUnsignedTx = JSON.parse(txBodyjson);

    openTxReviewModal({
      modalView: 'transactionReview',
      submitTx: passswordInput => submitTx(passswordInput, signTxRequest),
      operations: {
        kind: 'send',
      },
      unsignedTx: parsedUnsignedTx,
    });
  };

  const submitTx = async (passswordInput, signTxRequest) => {
    const selectedWallet = stores.wallets.selected;

    try {
      startLoadingTxReview();
      if (isHardwareWallet) {
        if (walletType === 'ledger') {
          const ledgerSendStore = stores.substores.ada.ledgerSend;
          ledgerSendStore.sendUsingLedgerWallet({
            params: { signRequest: signTxRequest },
            onSuccess: () => {
              onSuccess();
              showTxResultModal(TransactionResult.SUCCESS);
            },
            wallet: selectedWallet,
          });
        }
        if (walletType === 'trezor') {
          const trezorSendStore = stores.substores.ada.trezorSend;
          trezorSendStore.sendUsingTrezor({
            params: { signRequest: signTxRequest },
            onSuccess: () => {
              onSuccess();
              showTxResultModal(TransactionResult.SUCCESS);
            },
            wallet: selectedWallet,
          });
        }
      } else {
        await stores.substores.ada.mnemonicSend.sendMoney({
          signRequest: signTxRequest,
          password: passswordInput,
          wallet: selectedWallet,
          onSuccess: () => {
            onSuccess();
            showTxResultModal(TransactionResult.SUCCESS);
          },
        });
      }
    } catch (error) {
      console.warn('Delegation error', error);
      showTxResultModal(TransactionResult.FAIL);
    } finally {
      stopLoadingTxReview();
      closeTxReviewModal();
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
