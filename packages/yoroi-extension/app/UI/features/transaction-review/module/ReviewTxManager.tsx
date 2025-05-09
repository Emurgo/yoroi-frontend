import * as React from 'react';

import { Drawer, styled } from '@mui/material';
import { BottomActions } from '../common/BottomActions/BottomActions';
import { TopActions } from '../common/TopActionSection/TopActions';
import { ChooseDrepId } from '../useCases/ChooseDrepId/ChooseDrepId';
import { CollateralCreation } from '../useCases/CollateralCreation/CollateralCreation';
import { ExtraDetails } from '../useCases/ExtraDetails/ExtraDetails';
import { Operations } from '../useCases/Operations/Operations';
import { ReviewTxSection } from '../useCases/ReviewTx/ReviewTxSection';
import { SubmitInput } from '../useCases/SubmitTx/SubmitInput';
import { WalletInfoSection } from '../useCases/WalletInfo/WalletInfoSection';
import { useTxReviewModal } from './ReviewTxProvider';
import { useStrings } from '../common/hooks/useStrings';

const StyledDrawer = styled(Drawer)(({ theme }: any) => ({
  '& .MuiDrawer-paper': {
    width: '530px',
    background: theme.palette.ds.bg_color_contrast_high,
  },
  zIndex: '9999',
}));

export const ReviewTxManager = () => {
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });
  const strings = useStrings();
  const { isOpen, closeTxReviewModal, modalView, changeModalView, setInputError, changePasswordInputValue } = useTxReviewModal();

  const toggleDrawer = (anchor: string, open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
    closeTxReviewModal();
  };

  const handleOnBack = () => {
    if (modalView === 'walletInfo') {
      return changeModalView({ modalView: 'transactionReview', title: strings.transactionReview });
    }
    if (modalView === 'extraDetails') {
      return changeModalView({ modalView: 'transactionReview', title: strings.transactionReview });
    }
    if (modalView === 'submitTx') {
      setInputError({ type: 'setInputError', inputError: false });
      changePasswordInputValue({ type: 'passswordInput', passswordInput: '' });
      return changeModalView({ modalView: 'transactionReview', title: strings.transactionReview });
    }
    return undefined;
  };

  return (
    <StyledDrawer open={isOpen} onClose={toggleDrawer('right', false)} anchor={'right'} id="transactionReview-panel-component">
      <TopActions onBack={handleOnBack} />
      {modalView === 'transactionReview' && <ReviewTxSection />}
      {modalView === 'walletInfo' && <WalletInfoSection />}
      {modalView === 'submitTx' && <SubmitInput />}
      {modalView === 'chooseDrepId' && <ChooseDrepId />}
      {modalView === 'operations' && <Operations />}
      {modalView === 'extraDetails' && <ExtraDetails />}
      {modalView === 'collateralCreation' && <CollateralCreation />}
      <BottomActions />
    </StyledDrawer>
  );
};
