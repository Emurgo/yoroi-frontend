import { Skeleton, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { HiddenAmount } from './HiddenAmount';

export const HeaderPrice = observer(({ isLoading = false, isHiddenAmount }) => {
  const { accountPair } = usePortfolio();

  if (isLoading) {
    return <Skeleton width="129px" height="16px" />;
  }

  return (
    <Typography color="ds.text_gray_low" mr="12px">
      <HiddenAmount isHidden={isHiddenAmount}>{accountPair?.to.value}</HiddenAmount>
      <span>&nbsp;{accountPair?.to.name}</span>
    </Typography>
  );
});
