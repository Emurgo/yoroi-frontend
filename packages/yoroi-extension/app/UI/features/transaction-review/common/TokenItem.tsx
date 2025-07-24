import { Box, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import React from 'react';

interface TokenItemProps {
  isSent?: boolean;
  tokenInfo?: any; // Replace `any` with the appropriate type for tokenInfo
  quantity: any;
  isPrimary: boolean;
}

const getDecimals = (tokenInfo: any) => {
  if (!tokenInfo) return 0;

  if (typeof tokenInfo.decimals === 'number') {
    return tokenInfo.decimals;
  }
  if (typeof tokenInfo.numberOfDecimals === 'number') {
    return tokenInfo.numberOfDecimals;
  }
  if (tokenInfo.info && typeof tokenInfo.info.numberOfDecimals === 'number') {
    return tokenInfo.info.numberOfDecimals;
  }
  return 0;
};

const getTokenName = (tokenInfo: any): string => {
  if (!tokenInfo) return '';
  
  if (typeof tokenInfo.name === 'string') return tokenInfo.name;

  if (tokenInfo.info && typeof tokenInfo.info.name === 'string') {
    return tokenInfo.info.name;
  }
  
  return '';
};

export const TokenItem: React.FC<TokenItemProps> = ({ isSent = true, isPrimary, tokenInfo, quantity }: TokenItemProps) => {
  const decimals = getDecimals(tokenInfo);
  const tokenName = getTokenName(tokenInfo);

  const value = new BigNumber(quantity).shiftedBy(-decimals).toString();
  if (isSent) {
    const primaryColor = isPrimary ? 'ds.white_static' : 'ds.text_primary_medium';
    const primaryBackground = isPrimary ? 'ds.primary_500' : 'ds.primary_100';
    return (
      <Box sx={{ padding: '4px 12px', backgroundColor: primaryBackground, borderRadius: '8px', flexWrap: 'nowrap' }}>
        <Typography variant="body1" color={primaryColor}>
          {value} {tokenName}
        </Typography>
      </Box>
    );
  }

  const primaryColor = isPrimary ? 'ds.text_gray_max' : 'ds.secondary_700';
  const primaryBackground = isPrimary ? 'ds.secondary_300' : 'ds.secondary_100';
  return (
    <Box sx={{ padding: '4px 12px', backgroundColor: primaryBackground, borderRadius: '8px', flexWrap: 'nowrap' }}>
      <Typography variant="body1" color={primaryColor}>
        {value} {tokenName}
      </Typography>
    </Box>
  );
};
