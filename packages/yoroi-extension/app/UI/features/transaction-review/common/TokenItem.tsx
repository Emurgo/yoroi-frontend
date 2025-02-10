import { Box, Typography } from '@mui/material';
import React from 'react';

interface TokenItemProps {
  isSent?: boolean;
  tokenInfo?: any; // Replace `any` with the appropriate type for tokenInfo
  quantity: any;
}

export const TokenItem: React.FC<TokenItemProps> = ({ isSent = true, tokenInfo, quantity }: any) => {
  const backgroundColor = isSent ? 'ds.primary_500' : 'ds.secondary_300';

  const textColor = isSent ? 'ds.white_static' : 'ds.text_gray_max';

  return (
    <Box
      component="button"
      sx={{
        // backgroundColor,
        borderRadius: '8px',
        padding: '4px 12px',
      }}
    >
      <Box sx={{ padding: '4px 12px', backgroundColor: backgroundColor, borderRadius: '8px', color: textColor }}>
        <Typography color="ds.white_static">{`${quantity} ${tokenInfo.name}`}</Typography>
      </Box>
    </Box>
  );
};
