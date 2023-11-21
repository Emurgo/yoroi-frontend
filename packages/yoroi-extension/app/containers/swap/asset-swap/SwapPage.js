// @flow
import type { Node } from 'react';
import { useState } from 'react';
import { Box, Button } from '@mui/material';
import SwapForm from './SwapForm';

export default function SwapPage(): Node {
  const [step, setStep] = useState(0);

  // <TODO:CHECK_LINT>
  // eslint-disable-next-line no-unused-vars
  const [isSuccessful, setIsSuccessful] = useState(false);

  const handleNextStep = () => setStep(s => s + 1);
  const handlePrevStep = () => setStep(s => s - 1);

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box sx={{ flexGrow: '1', overflowY: 'auto' }}>{step === 0 && <SwapForm />}</Box>
      {step < 2 && (
        <Box
          flexShrink={0}
          gap="24px"
          p="24px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {step === 1 && (
            <Button
              onClick={handlePrevStep}
              sx={{ minWidth: '128px', minHeight: '48px' }}
              variant="secondary"
            >
              Back
            </Button>
          )}
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
