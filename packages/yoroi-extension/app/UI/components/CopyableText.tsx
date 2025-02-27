import { Box, Stack } from '@mui/material';
import React, { ReactNode } from 'react';
import { CopyButton } from './buttons/CopyButton';

type Props = {
  children: ReactNode;
  value: string;
};

const CopyableText: React.FC<Props> = ({ children, value }) => {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Box mr="4px">{children}</Box>
      <CopyButton textToCopy={value} />
    </Stack>
  );
};

export default CopyableText;
