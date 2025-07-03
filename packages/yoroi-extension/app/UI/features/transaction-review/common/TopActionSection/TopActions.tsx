import { IconButton, Stack, styled, Typography } from '@mui/material';
import { Icon } from '../../../../components';
import { useTxReviewModal } from '../../module/ReviewTxProvider';
import { useStrings } from '../hooks/useStrings';

const StyledStack = styled(Stack)(() => ({}));
const StyledButton = styled(IconButton)(({ theme }: any) => ({
  position: 'absolute',

  top: '20px',
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));

export const TopActions = ({ onBack }: { onBack?: () => void }) => {
  const { closeTxReviewModal, modalView, extraOverviewDetails } = useTxReviewModal();
  const strings = useStrings();
  const showOnBackIcon = modalView === 'walletInfo' || modalView === 'submitTx' || modalView === 'extraDetails';

  const getModalTitle = () => {
    if (modalView === 'transactionConfiramtion') {
      return strings.transactionReview;
    }
    if (modalView === 'walletInfo') {
      return strings.walletDetails;
    }
    if (modalView === 'submitTx') {
      return strings.submitTransaction;
    }
    if (modalView === 'chooseDrepId') {
      return strings.chooseDrep;
    }
    if (modalView === 'operations') {
      return strings.operations;
    }
    if (modalView === 'extraDetails') {
      return extraOverviewDetails.title;
    }
    return strings.transactionReview;
  };

  return (
    <StyledStack direction="row" justifyContent="center">
      {showOnBackIcon && (
        <StyledButton onClick={onBack} sx={{ left: '24px' }} id='txReview-back-button'>
          <Icon.Back />
        </StyledButton>
      )}
      <Typography variant="button" my="24px" textAlign="center" id='txReview-title-text'>
        {getModalTitle()}
      </Typography>
      <StyledButton onClick={() => closeTxReviewModal({ type: 'close' })} sx={{ right: '24px' }} id='txReview-close-button'>
        <Icon.CloseIcon />
      </StyledButton>
    </StyledStack>
  );
};
