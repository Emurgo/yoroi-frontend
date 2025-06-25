import { LoadingButton } from '@mui/lab';
import { Box, Button, Stack } from '@mui/material';
import { useTxReviewModal } from '../../module/ReviewTxProvider';
import { useStrings } from '../hooks/useStrings';

export const BottomActions = () => {
  const strings = useStrings();
  const {
    closeTxReviewModal,
    changeModalView,
    modalView,
    submitTx,
    passswordInput,
    isLoading,
    checkUserPassword,
    setInputError,
    walletType,
  } = useTxReviewModal();

  const handleSubmitText = () => {
    if (walletType === 'trezor') {
      return strings.trezorConfirm;
    }
    if (walletType === 'ledger') {
      return strings.ledgerConfirm;
    }
    return strings.submitLabel;
  };

  if (modalView === 'submitTx') {
    return (
      <Stack direction="row" justifyContent="space-between" p="24px">
        <LoadingButton
          //  @ts-ignore
          variant="primary"
          sx={{ width: '100%' }}
          onClick={async () => {
            const response = await checkUserPassword(passswordInput);
            // Do this for YOEXT-1950
            console.log(response);
            if (response?.name === 'WrongPassphraseError') {
              console.log('WrongPassphraseError', response);
              setInputError({ type: 'setInputError', inputError: true });
            } else {
              submitTx(passswordInput);
            }
          }}
          disabled={
            walletType === 'trezor' || walletType === 'ledger'
              ? false
              : passswordInput === undefined || passswordInput.length === 0
          }
          loading={isLoading}
          id="txReview-submit-button"
        >
          {handleSubmitText()}
        </LoadingButton>
      </Stack>
    );
  }

  if (modalView === 'transactionReview' || modalView === 'extraDetails') {
    return (
      <Box
        borderTop="1px solid"
        borderColor="ds.gray_200"
        position="absolute"
        bottom={0}
        width="100%"
        sx={{ backgroundColor: 'ds.bg_color_contrast_high' }}
      >
        <Stack direction="row" justifyContent="space-between" p="24px">
          <Button
            sx={{ width: '229px' }}
            //  @ts-ignore
            variant="secondary"
            onClick={() => {
              closeTxReviewModal();
            }}
            id="txReview-cancel-button"
          >
            {strings.cancelLabel}
          </Button>
          <Button
            sx={{ width: '229px' }}
            //  @ts-ignore
            variant="primary"
            onClick={() => {
              changeModalView({ modalView: 'submitTx', title: 'Submit Transaction' });
            }}
            id="txReview-confirm-button"
          >
            {strings.confirmLabel}
          </Button>
        </Stack>
      </Box>
    );
  }

  return <></>;
};
