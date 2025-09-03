import { Button, Stack, Typography } from '@mui/material';
import { useNavigateTo } from '../hooks/useNavigateTo';
import { SuccessIlustration } from './SuccessIlustration';
import { useModal } from '../../../../components/modals/ModalContext';
import { useStrings } from '../hooks/useStrings';

export const TxSuccess = () => {
  const navigate = useNavigateTo();
  const { closeModal } = useModal();
  const strings = useStrings();

  return (
    <Stack width="100%" alignItems="center">
      <SuccessIlustration />
      <Typography variant="h5" fontWeight="500" mt="42px">
        {strings.successTitle}
      </Typography>
      <Typography variant="body1" mt="8px" color="ds.text_gray_low" textAlign="center" mb="24px">
        {strings.successDescription}
      </Typography>
      <Button
        //  @ts-ignore
        variant="primary"
        fullWidth
        onClick={() => {
          navigate.walletTransactions();
          closeModal();
        }}
        id="txSuccess-close-button"
      >
        {strings.successClose}
      </Button>
    </Stack>
  );
};
