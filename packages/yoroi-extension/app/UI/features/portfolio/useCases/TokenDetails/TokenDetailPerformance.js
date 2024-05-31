import React from 'react';
import { Box, Stack, Typography, Link } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useStrings } from '../../common/hooks/useStrings';
import { usePortfolio } from '../../module/PortfolioContextProvider';

const PerformanceItemType = {
  FIAT: 'fiat',
  TOKEN: 'token',
  RANK: 'rank',
};

const TokenDetailPerformance = ({ tokenInfo }) => {
  const theme = useTheme();
  const strings = useStrings();
  const { unitOfAccount } = usePortfolio();

  const performanceItemList = [
    { id: 'tokenPriceChange', type: PerformanceItemType.FIAT, label: strings.tokenPriceChange },
    { id: 'tokenPrice', type: PerformanceItemType.FIAT, label: strings.tokenPrice },
    { id: 'marketCap', type: PerformanceItemType.FIAT, label: strings.marketCap },
    { id: 'volumn', type: PerformanceItemType.FIAT, label: strings['24hVolumn'] },
    { id: 'rank', type: PerformanceItemType.RANK, label: strings.rank },
    { id: 'circulating', type: PerformanceItemType.TOKEN, label: strings.circulating },
    { id: 'totalSupply', type: PerformanceItemType.TOKEN, label: strings.totalSupply },
    { id: 'maxSupply', type: PerformanceItemType.TOKEN, label: strings.maxSupply },
    { id: 'allTimeHigh', type: PerformanceItemType.FIAT, label: strings.allTimeHigh },
    { id: 'allTimeLow', type: PerformanceItemType.FIAT, label: strings.allTimeLow },
  ];

  return (
    <Box>
      <Typography fontWeight="500" sx={{ marginBottom: theme.spacing(2) }}>
        {strings.marketData}
      </Typography>
      <Stack direction="column" spacing={1}>
        {performanceItemList.map((item, index) => (
          <Stack
            key={item.id}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ paddingBottom: item.type === PerformanceItemType.RANK ? theme.spacing(1) : '' }}
          >
            <Typography sx={{ color: theme.palette.ds.text_gray_medium }}>{item.label}</Typography>
            <Typography sx={{ color: theme.palette.ds.black_static }}>
              {item.type === PerformanceItemType.RANK && '#'}
              {tokenInfo.performance[index].value} {item.type === PerformanceItemType.FIAT && unitOfAccount}
              {item.type === PerformanceItemType.TOKEN && tokenInfo.name}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default TokenDetailPerformance;
