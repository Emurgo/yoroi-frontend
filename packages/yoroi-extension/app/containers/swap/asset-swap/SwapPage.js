// @flow
import type { Node } from 'react';
import { useState } from 'react';
import { Box, Button } from '@mui/material';
import { poolList } from './mockData';
import SwapForm from './SwapForm';
import SwapConfirmationStep from './ConfirmationStep';
import TxSubmittedStep from './TxSubmittedStep';
import LimitOrderDialog from '../../../components/swap/LimitOrderDialog';

export default function SwapPage(): Node {
  const [step, setStep] = useState(0);
  const [openedDialog, setOpenedDialog] = useState('');

  // <TODO:CHECK_LINT>
  // eslint-disable-next-line no-unused-vars
  const [isSuccessful, setIsSuccessful] = useState(false);

  const handleNextStep = () => setStep(s => s + 1);

  // <TODO:CHECK_LINT>
  // eslint-disable-next-line no-unused-vars
  const handlePrevStep = () => setStep(s => s - 1);

  const handleOpenedDialog = dialog => setOpenedDialog(dialog);

  return (
    <>
      <Box display="flex" flexDirection="column" height="100%">
        <Box sx={{ flexGrow: '1', overflowY: 'auto' }}>
          {step === 0 && <SwapForm onLimitSwap={() => handleOpenedDialog('limitOrder')} />}
          {step === 1 && <SwapConfirmationStep poolInfo={poolList[0]} />}
          {step === 2 && (
            <TxSubmittedStep
              isSuccessful={isSuccessful}
              onTryAgain={() => {
                setStep(0);
                setIsSuccessful(true);
              }}
            />
          )}
        </Box>
        {step < 2 && (
          <Box
            flexShrink={0}
            gap="24px"
            p="24px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Button
              onClick={handleNextStep}
              sx={{ minWidth: '128px', minHeight: '48px' }}
              variant="primary"
            >
              {step === 0 ? 'Swap' : 'Confirm'}
            </Button>
          </Box>
        )}
      </Box>

      {openedDialog === 'limitOrder' && (
        <LimitOrderDialog
          limitPrice={9}
          marketPrice={4}
          exchangePair="ADA/USDA"
          onConfirm={() => handleOpenedDialog('')}
          onClose={() => handleOpenedDialog('')}
        />
      )}
    </>
  );
}
