import { Button, styled } from '@mui/material';
import { TransactionResult } from '../../../UI/features/transaction-review/common/types';
import { useTxReviewModal } from '../../../UI/features/transaction-review/module/ReviewTxProvider';
import { useDomainResolver } from '../../../UI/common/hooks/useDomainResolver';
import CopyableText from '../../../UI/components/CopyableText';

export const SendTokensButton = ({ disabled, onSuccess, label, receiverHandler, stores }) => {
  const { openTxReviewModal, startLoadingTxReview, showTxResultModal, isHardwareWallet, walletType } = useTxReviewModal();
  const { resolvedAddress, resolvedNameServer } = useDomainResolver(receiverHandler);

  const handleSubmit = async () => {
    const signTxRequest = stores.transactionBuilderStore.updateTentativeTx();

    openTxReviewModal({
      modalView: 'transactionReview',
      submitTx: passswordInput => submitTx(passswordInput, signTxRequest),
      operations: {
        kind: 'send',
      },
      receiverCustomTitle: resolvedNameServer && {
        to: <CopyableText value={receiverHandler}>{receiverHandler}</CopyableText>,
        associatedAddress: resolvedAddress,
      },
      unsignedTx: signTxRequest.unsignedTx,
    });
  };

  const submitTx = async (passswordInput, signTxRequest) => {
    const selectedWallet = stores.wallets.selected;

    try {
      startLoadingTxReview();
      if (isHardwareWallet) {
        if (walletType === 'ledger') {
          const ledgerSendStore = stores.substores.ada.ledgerSend;
          await ledgerSendStore.sendUsingLedgerWallet({
            params: { signRequest: signTxRequest },
            onSuccess: () => {
              onSuccess();
              showTxResultModal(TransactionResult.SUCCESS);
            },
            onFail: () => {
              showTxResultModal(TransactionResult.FAIL);
            },
            wallet: selectedWallet,
          });
        }
        if (walletType === 'trezor') {
          const trezorSendStore = stores.substores.ada.trezorSend;
          await trezorSendStore.sendUsingTrezor({
            params: { signRequest: signTxRequest },
            onSuccess: () => {
              onSuccess();
              showTxResultModal(TransactionResult.SUCCESS);
            },
            onFail: () => {
              showTxResultModal(TransactionResult.FAIL);
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
