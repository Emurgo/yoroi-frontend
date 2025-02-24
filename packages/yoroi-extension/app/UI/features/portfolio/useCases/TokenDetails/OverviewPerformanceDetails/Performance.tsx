import { Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { useStrings } from '../../../common/hooks/useStrings';

// const PerformanceItemType = {
//   FIAT: 'fiat',
//   TOKEN: 'token',
//   RANK: 'rank',
// };

interface Props {
  tokenInfo: TokenInfoType;
  isLoading?: boolean;
}

const Performance = ({ tokenInfo, isLoading }: Props): JSX.Element => {
  console.log({ tokenInfo, isLoading });
  const theme = useTheme();
  const strings = useStrings();
  // const { unitOfAccount } = usePortfolio();

  // const firstPerformanceItemList = [
  //   { id: 'tokenPriceChange', type: PerformanceItemType.FIAT, label: strings.tokenPriceChange },
  //   { id: 'tokenPrice', type: PerformanceItemType.FIAT, label: strings.tokenPrice },
  //   { id: 'marketCap', type: PerformanceItemType.FIAT, label: strings.marketCap },
  //   { id: 'volumn', type: PerformanceItemType.FIAT, label: strings['24hVolumn'] },
  //   { id: 'rank', type: PerformanceItemType.RANK, label: strings.rank },
  // ];

  // const secondPerformanceItemList = [
  //   { id: 'circulating', type: PerformanceItemType.TOKEN, label: strings.circulating },
  //   { id: 'totalSupply', type: PerformanceItemType.TOKEN, label: strings.totalSupply },
  //   { id: 'maxSupply', type: PerformanceItemType.TOKEN, label: strings.maxSupply },
  //   { id: 'allTimeHigh', type: PerformanceItemType.FIAT, label: strings.allTimeHigh },
  //   { id: 'allTimeLow', type: PerformanceItemType.FIAT, label: strings.allTimeLow },
  // ];

  return (
    <Stack direction="column">
      <Typography fontWeight="500" color="ds.gray_max" sx={{ marginBottom: theme.spacing(2) }}>
        {strings.marketData}
      </Typography>
      <Stack direction="column" spacing={1}>
        {/* {firstPerformanceItemList.map((item, index) => (
          <Stack
            key={item.id}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ paddingBottom: item.type === PerformanceItemType.RANK ? theme.spacing(1) : '' }}
          >
            <Typography color="ds.gray_600">{item.label}</Typography>
            {isLoading ? (
              <Skeleton width="84px" height="20px" />
            ) : (
              <Typography color="ds.gray_max">
                {tokenInfo?.performance[index]?.value ? (
                  <>
                    {item.type === PerformanceItemType.RANK && '#'}
                    {formatNumber(tokenInfo?.performance[index]?.value as number)}{' '}
                    {item.type === PerformanceItemType.FIAT && unitOfAccount}
                    {item.type === PerformanceItemType.TOKEN && tokenInfo?.name}
                  </>
                ) : (
                  '--'
                )}
              </Typography>
            )}
          </Stack>
        ))} */}
      </Stack>
      <Stack direction="column" spacing={'0.375rem'} sx={{ marginTop: theme.spacing(1) }}>
        {/* {secondPerformanceItemList.map((item, index) => (
          <Stack key={item.id} direction="row" justifyContent="space-between" alignItems="center">
            <Typography color="ds.gray_600">{item.label}</Typography>
            {isLoading ? (
              <Skeleton width="84px" height="20px" />
            ) : (
              <Typography color="ds.gray_max">
                {tokenInfo?.performance[index]?.value ? (
                  <>
                    {item.type === PerformanceItemType.RANK && '#'}
                    {formatNumber(tokenInfo?.performance[index]?.value as number)}{' '}
                    {item.type === PerformanceItemType.FIAT && unitOfAccount}
                    {item.type === PerformanceItemType.TOKEN && tokenInfo?.name}
                  </>
                ) : (
                  '--'
                )}
              </Typography>
            )}
          </Stack>
        ))} */}
      </Stack>
    </Stack>
  );
};

export default Performance;
