import React from 'react';
import { Box, Stack, Typography, Link } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { usePortfolio } from '../../module/PortfolioContextProvider';

const PerformanceItemType = {
  USD: 'usd',
  TOKEN: 'token',
  RANK: 'rank',
};

const TokenDetailPerformance = ({ tokenInfo }) => {
  const theme = useTheme();
  const { strings } = usePortfolio();

  const performanceItemList = [
    { id: 'tokenPriceChange', type: PerformanceItemType.USD, label: strings.tokenPriceChange },
    { id: 'tokenPrice', type: PerformanceItemType.USD, label: strings.tokenPrice },
    { id: 'marketCap', type: PerformanceItemType.USD, label: strings.marketCap },
    { id: 'volumn', type: PerformanceItemType.USD, label: strings['24hVolumn'] },
    { id: 'rank', type: PerformanceItemType.RANK, label: strings.rank },
    { id: 'circulating', type: PerformanceItemType.TOKEN, label: strings.circulating },
    { id: 'totalSupply', type: PerformanceItemType.TOKEN, label: strings.totalSupply },
    { id: 'maxSupply', type: PerformanceItemType.TOKEN, label: strings.maxSupply },
    { id: 'allTimeHigh', type: PerformanceItemType.USD, label: strings.allTimeHigh },
    { id: 'allTimeLow', type: PerformanceItemType.USD, label: strings.allTimeLow },
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
              {tokenInfo.performance[index].value} {item.type === PerformanceItemType.USD && 'USD'}
              {item.type === PerformanceItemType.TOKEN && tokenInfo.overview.tokenName}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default TokenDetailPerformance;
