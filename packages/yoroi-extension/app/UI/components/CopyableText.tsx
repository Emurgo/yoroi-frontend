import { Box, Stack } from '@mui/material';
import React, { ReactNode } from 'react';
import { CopyButton } from './buttons/CopyButton';

type Props = {
  children: ReactNode;
  value: string;
  copyButtonFollowText?: boolean;
  pathTestId?: string;
};

const CopyableText: React.FC<Props> = ({ children, value, copyButtonFollowText = false, pathTestId = '' }) => {
  return (
    <Stack direction="row" {...(copyButtonFollowText ? {} : { justifyContent: 'space-between' })}>
      <Box mr="4px" id={`${pathTestId}-info-text`}>
        {children}
      </Box>
      <CopyButton textToCopy={value} pathTestId={pathTestId} />
    </Stack>
  );
};

export default CopyableText;
