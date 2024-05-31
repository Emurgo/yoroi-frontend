import { Typography, Stack, Box, Input, styled } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Tooltip, SearchInput } from '../../../../components';
import { useTheme } from '@mui/material/styles';
import { defineMessages } from 'react-intl';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import StatsTable from './StatsTable';
import mockData from '../../common/mockData';
import { ArrowIcon } from '../../common/assets/icons';
import illustrationPng from '../../common/assets/images/illustration.png';
import { Chip } from '../../common/components/Chip';
import { Skeleton } from '../../../../components/Skeleton';
import { useStrings } from '../../common/hooks/useStrings';

const PortfolioWallet = ({ data }) => {
  const theme = useTheme();
  const strings = useStrings();
  const { unitOfAccount, changeUnitOfAccount } = usePortfolio();
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState();
  const [tokenList, setTokenList] = useState([]);
  const [isUsdMainUnit, setIsUsdMainUnit] = useState(unitOfAccount === 'USD');

  const handleCurrencyChange = () => {
    if (isUsdMainUnit) {
      changeUnitOfAccount('ADA');
      setIsUsdMainUnit(false);
    } else {
      changeUnitOfAccount('USD');
      setIsUsdMainUnit(true);
    }
  };

  useEffect(() => {
    // FAKE FETCHING DATA TO SEE SKELETON
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!keyword) {
      setTokenList(data);
      return;
    }

    const lowercaseKeyword = keyword.toLowerCase();

    const temp = data.filter(item => {
      return item.name.toLowerCase().includes(lowercaseKeyword) || item.id.toLowerCase().includes(lowercaseKeyword);
    });
    if (temp && temp.length > 0) {
      setTokenList(temp);
    } else {
      setTokenList([]);
    }
  }, [keyword]);

  return (
    <Stack direction="column" spacing={theme.spacing(3)} sx={{ minHeight: 'calc(100vh - 220px)' }}>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="column">
          <Stack direction="row" spacing={theme.spacing(0.5)}>
            {isLoading ? (
              <Skeleton width="146px" height="24px" />
            ) : (
              <Typography variant="h2" fontWeight="500">
                {isUsdMainUnit ? mockData.common.walletBalance.ada : mockData.common.walletBalance.usd}
              </Typography>
            )}
            <Typography variant="body2" fontWeight="500" sx={{ marginTop: '5px' }}>
              {isUsdMainUnit ? 'ADA' : 'USD'}
              <Typography
                variant="body2"
                fontWeight="500"
                onClick={handleCurrencyChange}
                sx={{
                  cursor: 'pointer',
                  display: 'inline',
                  marginTop: '5px',
                  color: theme.palette.ds.text_gray_low,
                }}
              >
                {isUsdMainUnit ? '/USD' : '/ADA'}
              </Typography>
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {isLoading ? (
              <Skeleton width="129px" height="16px" />
            ) : (
              <Typography sx={{ color: theme.palette.ds.text_gray_medium }}>
                {isUsdMainUnit ? mockData.common.walletBalance.usd : mockData.common.walletBalance.ada} {isUsdMainUnit ? 'USD' : 'ADA'}
              </Typography>
            )}
            {isLoading ? (
              <Stack direction="row" alignItems="center" spacing={theme.spacing(1)} sx={{ marginLeft: theme.spacing(2) }}>
                <Skeleton width="47px" height="20px" />
                <Skeleton width="65px" height="20px" />
              </Stack>
            ) : (
              <Tooltip
                title={
                  <>
                    <Typography display={'block'}>% {strings.balancePerformance}</Typography>
                    <Typography display={'block'}>+/- {strings.balanceChange}</Typography>
                    <Typography display={'block'}>{strings.in24hours}</Typography>
                  </>
                }
                placement="right"
              >
                <Stack direction="row" alignItems="center" spacing={theme.spacing(1)} sx={{ marginLeft: theme.spacing(2) }}>
                  <Chip
                    active={mockData.common.walletBalance.percents > 0}
                    label={
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <ArrowIcon
                          fill={
                            mockData.common.walletBalance.percents > 0
                              ? theme.palette.ds.secondary_c800
                              : theme.palette.ds.sys_magenta_c700
                          }
                          style={{
                            marginRight: theme.spacing(0.5),
                            transform: mockData.common.walletBalance.percents > 0 ? '' : 'rotate(180deg)',
                          }}
                        />
                        <Typography variant="caption1">
                          {mockData.common.walletBalance.percents > 0
                            ? mockData.common.walletBalance.percents
                            : -1 * mockData.common.walletBalance.percents}
                          %
                        </Typography>
                      </Stack>
                    }
                  />
                  <Chip
                    active={mockData.common.walletBalance.amount > 0}
                    label={
                      <Typography variant="caption1">
                        {mockData.common.walletBalance.amount > 0 && '+'}
                        {mockData.common.walletBalance.amount} USD
                      </Typography>
                    }
                  />
                </Stack>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        <SearchInput onChange={e => setKeyword(e.target.value)} placeholder={strings.search} />
      </Stack>
      {tokenList.length > 0 ? (
        <StatsTable data={tokenList} isLoading={isLoading} />
      ) : (
        <Stack width="full" justifyContent="center" alignItems="center" sx={{ flex: 1 }}>
          <Stack direction="column" alignItems="center" spacing={theme.spacing(3)}>
            <Box component="img" src={illustrationPng}></Box>
            <Typography variant="h4" fontWeight="500" sx={{ color: theme.palette.ds.black_static }}>
              {strings.noResultsForThisSearch}
            </Typography>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};

export default PortfolioWallet;
