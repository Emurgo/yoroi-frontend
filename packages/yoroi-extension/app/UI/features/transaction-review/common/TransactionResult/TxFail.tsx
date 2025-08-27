import { Button, Stack, Typography } from '@mui/material';
import { FailedIlustration } from './FailedIlustration';
import { useModal } from '../../../../components/modals/ModalContext';
import { TransactionResult, TransactionResultType } from '../types';
import { useStrings } from '../hooks/useStrings';

export const TxFail = ({ result }: { result: TransactionResultType }) => {
  const { closeModal } = useModal();
  const strings = useStrings();

  return (
    <Stack width="100%" alignItems="center">
      <FailedIlustration />
      <Typography variant="h5" fontWeight="500" mt="42px">
        {strings.failTitle}
      </Typography>
      <Typography variant="body1" mt="8px" color="ds.text_gray_low" textAlign="center" mb="24px">
        {result === TransactionResult.CANCEL ? strings.failCancelByUser : strings.failError}
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
