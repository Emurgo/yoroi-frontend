import { Button, Stack, Typography } from '@mui/material';
import { useTxReviewModal } from '../../module/ReviewTxProvider';
import { OperationIlustration } from './Ilustration';
import { useStrings } from '../../common/hooks/useStrings';

export const Operations = () => {
  const strings = useStrings();
  const { changeModalView } = useTxReviewModal();
  return (
    <Stack height="100%" p="24px" direction="column" justifyContent="space-between">
      <Stack gap="54px" height="100%" direction="column" justifyContent="center" alignItems="center">
        <OperationIlustration />
        <Typography variant="body1" color="ds_text_gray_medium">
          {strings.interactWithOperations}
        </Typography>
      </Stack>
      <Button
        //  @ts-ignore
        variant="primary"
        sx={{ width: '100%' }}
        onClick={() => {
          changeModalView({ modalView: 'transactionReview' });
        }}
      >
        Ok
      </Button>
    </Stack>
  );
};
