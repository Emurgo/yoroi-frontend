import { IconButton, Stack, styled, Typography } from '@mui/material';
import React from 'react';
import { Icon } from '../../../../components';
import { useTxReviewModal } from '../../module/ReviewTxProvider';

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
  const { closeTxReviewModal, title, modalView } = useTxReviewModal();
  console.log('title', title, modalView);
  const showOnBackIcon = modalView === 'walletInfo';

  const getModalTitle = () => {
    if (modalView === 'transactionConfiramtion') {
      return 'Transaction Review';
    }
    if (modalView === 'walletInfo') {
      return 'Wallet Details';
    }
    return 'Transaction Review';
  };
  return (
    <StyledStack direction="row" justifyContent="center">
      {showOnBackIcon && (
        <StyledButton onClick={onBack} sx={{ left: '24px' }}>
          <Icon.Back />
        </StyledButton>
      )}
      <Typography variant="h4" my="24px" fontWeight="500" textAlign="center">
        {getModalTitle()}
      </Typography>
      <StyledButton onClick={() => closeTxReviewModal({ type: 'close' })} sx={{ right: '24px' }}>
        <Icon.CloseIcon />
      </StyledButton>
    </StyledStack>
  );
};
