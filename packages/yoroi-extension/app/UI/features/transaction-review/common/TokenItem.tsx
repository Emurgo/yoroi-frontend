import { Box, Typography } from '@mui/material';
import React from 'react';

interface TokenItemProps {
  label: string;
  isSent?: boolean;
  tokenInfo?: any; // Replace `any` with the appropriate type for tokenInfo
  isPrimaryToken: boolean;
}

export const TokenItem: React.FC<TokenItemProps> = ({ label, isSent = true, tokenInfo, isPrimaryToken }) => {
  const backgroundColor = isSent
    ? isPrimaryToken
      ? 'ds.primary_500'
      : 'ds.primary_100'
    : isPrimaryToken
    ? 'ds.secondary_300'
    : 'ds.secondary_100';

  const textColor = isSent
    ? isPrimaryToken
      ? 'ds.white_static'
      : 'ds.text_primary_medium'
    : isPrimaryToken
    ? 'ds.gray_max'
    : 'ds.secondary_700';

  return (
    <Box
      component="button"
      sx={{
        backgroundColor,
        borderRadius: '8px',
        padding: '4px 12px',
      }}
    >
      <Typography color={textColor}>{label}</Typography>
    </Box>
  );
};
