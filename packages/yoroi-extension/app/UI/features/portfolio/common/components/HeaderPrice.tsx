import { Skeleton, Typography } from '@mui/material';
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
