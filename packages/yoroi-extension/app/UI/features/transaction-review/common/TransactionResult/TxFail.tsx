import { Button, Stack, Typography } from '@mui/material';
import { FailedIlustration } from './FailedIlustration';
import { useModal } from '../../../../components/modals/ModalContext';
import { TransactionResult, TransactionResultType } from '../types';
import { useStrings } from '../hooks/useStrings';

export const TxFail = ({ result }: { result: TransactionResultType }) => {
  const { closeModal } = useModal();
  const strings = useStrings();

  const failMessage = (result: TransactionResultType) => {
    if (result === TransactionResult.CANCEL) return strings.failCancelByUser;
    if (result === TransactionResult.NO_CARDANO_RUNNING) return strings.failLedgerAppNotRunning;
    return strings.failError;
  };

  return (
    <Stack width="100%" alignItems="center">
      <FailedIlustration />
      <Typography variant="h5" fontWeight="500" mt="42px">
        {strings.failTitle}
      </Typography>
      <Typography variant="body1" mt="8px" color="ds.text_gray_low" textAlign="center" mb="24px">
        {failMessage(result)}
      </Typography>
      <Button
        //  @ts-ignore
        variant="primary"
        fullWidth
        onClick={() => {
          closeModal();
        }}
        id="txFail-close-button"
      >
        {strings.failClose}
      </Button>
    </Stack>
  );
};
