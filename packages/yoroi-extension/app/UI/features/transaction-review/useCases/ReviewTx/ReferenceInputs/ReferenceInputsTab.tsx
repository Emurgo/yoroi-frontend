import { Stack } from '@mui/material';
import React from 'react';
import { Inputs } from '../UTxOs/UTxOsTab';

export const ReferenceInputsTab = ({ referenceInputs }) => {
  console.log('referenceInputs', referenceInputs);
  return (
    <Stack p="24px">
      <Inputs key={`${referenceInputs.address}-${referenceInputs.txHash}-${referenceInputs.txIndex}`} inputs={referenceInputs} />
    </Stack>
  );
};
