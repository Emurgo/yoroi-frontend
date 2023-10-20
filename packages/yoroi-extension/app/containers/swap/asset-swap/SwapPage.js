// @flow
import type { Node } from 'react';
import { useState } from 'react';
import { Box, Button } from '@mui/material';
import { poolList } from './mockData';
import SwapForm from './SwapForm';
import SwapConfirmationStep from './ConfirmationStep';
import TxSubmittedStep from './TxSubmittedStep';

export default function SwapPage(): Node {
  const [step, setStep] = useState(0);
  const [isSuccessful, setIsSuccessful] = useState(false);

  const handleNextStep = () => setStep(step => step + 1);
  const handlePrevStep = () => setStep(step => step - 1);

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box sx={{ flexGrow: '1', overflowY: 'auto' }}>
        {step === 0 && <SwapForm />}
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
  );
}
