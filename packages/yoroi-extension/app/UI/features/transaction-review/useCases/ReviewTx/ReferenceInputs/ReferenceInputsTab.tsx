import { Stack } from '@mui/material';
import { Inputs } from '../UTxOs/UTxOsTab';

export const ReferenceInputsTab = ({ referenceInputs }) => {
  return (
    <Stack p="24px">
      <Inputs
        key={`${referenceInputs.address}-${referenceInputs.tx_hash}-${referenceInputs.tx_index}`}
        inputs={referenceInputs}
      />
    </Stack>
  );
};
