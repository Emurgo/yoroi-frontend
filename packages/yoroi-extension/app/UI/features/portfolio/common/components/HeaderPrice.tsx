import { Skeleton, Typography } from '@mui/material';
import React from 'react';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { HiddenAmount } from './HiddenAmount';

export const HeaderPrice = ({ isLoading = false }) => {
  const { accountPair, isHiddenAmount } = usePortfolio();

  if (isLoading) {
    return <Skeleton width="129px" height="16px" />;
  }

  return (
    <Typography color="ds.text_gray_low" mr="12px">
      <HiddenAmount isHidden={isHiddenAmount}>
        {accountPair?.to.value}
      </HiddenAmount>
      {accountPair?.to.name}
    </Typography>
  );
};
