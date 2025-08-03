import { Box, Stack } from '@mui/material';
import React, { ReactNode } from 'react';
import { CopyButton } from './buttons/CopyButton';

type Props = {
  children: ReactNode;
  value: string;
  copyButtonFollowText?: boolean;
};

const CopyableText: React.FC<Props> = ({ children, value, copyButtonFollowText = false }) => {
  return (
    <Stack direction="row" {...(copyButtonFollowText ? {} : { justifyContent: 'space-between' })}>
      <Box mr="4px">{children}</Box>
      <CopyButton textToCopy={value} />
    </Stack>
  );
};

export default CopyableText;
