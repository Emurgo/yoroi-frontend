import { Skeleton, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import React from 'react';
import { usePortfolio } from '../../module/PortfolioContextProvider';

export const HeaderPrice = ({ isLoading = false }) => {
  const { accountPair } = usePortfolio();

  if (isLoading) {
    return <Skeleton width="129px" height="16px" />;
  }

  return (
    <Typography color="ds.text_gray_medium">
      {accountPair?.to.value} {accountPair?.to.name}
    </Typography>
  );
};

export function formatValue(value: BigNumber): string {
  if (value.isZero()) {
    return '0';
  }
  if (value.abs().lt(1)) {
    return value.toFormat(6);
  }
  return value.toFixed(2);
}
