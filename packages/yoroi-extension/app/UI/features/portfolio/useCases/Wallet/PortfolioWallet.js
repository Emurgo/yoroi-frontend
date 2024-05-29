import { Typography, Stack, Box, Input, InputAdornment, styled } from '@mui/material';
import { ReactComponent as Search } from '../../../../../assets/images/assets-page/search.inline.svg';
import React, { useEffect, useState } from 'react';
import { Tooltip, SearchInput } from '../../../../components';
import { useTheme } from '@mui/material/styles';
import { defineMessages } from 'react-intl';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import StatsTable from './StatsTable';
import mockData from '../../../../pages/portfolio/mockData';
import ArrowIcon from '../../common/assets/icons/Arrow';
import { Chip } from '../../common/components/Chip';
import { Skeleton } from '../../../../components/Skeleton';

const PortfolioWallet = ({ data }) => {
  const theme = useTheme();
  const { strings } = usePortfolio();
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState();
  const [tokenList, setTokenList] = useState([]);

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
      return (
        item.name.toLowerCase().includes(lowercaseKeyword) ||
        item.id.toLowerCase().includes(lowercaseKeyword)
      );
    });
    if (temp && temp.length > 0) {
      setTokenList(temp);
    } else {
      setTokenList([]);
    }
  }, [keyword]);

  return (
    <Stack direction="column" spacing={theme.spacing(3)}>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="column">
          <Stack direction="row" spacing={theme.spacing(0.5)}>
            {isLoading ? (
              <Skeleton width="146px" height="24px" />
            ) : (
              <Typography variant="h2" fontWeight="500">
                {mockData.PortfolioPage.balance.ada}
              </Typography>
            )}
            <Typography variant="body2" fontWeight="500" sx={{ marginTop: '5px' }}>
              ADA
              <Typography
                variant="body2"
                fontWeight="500"
                sx={{
                  display: 'inline',
                  marginTop: '5px',
                  color: theme.palette.ds.text_gray_low,
                }}
              >
                /USD
              </Typography>
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {isLoading ? (
              <Skeleton width="129px" height="16px" />
            ) : (
              <Typography sx={{ color: theme.palette.ds.text_gray_medium }}>
                {mockData.PortfolioPage.balance.usd} USD
              </Typography>
            )}
            {isLoading ? (
              <Stack
                direction="row"
                alignItems="center"
                spacing={theme.spacing(1)}
                sx={{ marginLeft: theme.spacing(2) }}
              >
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
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={theme.spacing(1)}
                  sx={{ marginLeft: theme.spacing(2) }}
                >
                  <Chip
                    active={mockData.PortfolioPage.balance.percents > 0}
                    label={
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <ArrowIcon
                          fill={
                            mockData.PortfolioPage.balance.percents > 0
                              ? theme.palette.ds.secondary_c800
                              : theme.palette.ds.sys_magenta_c700
                          }
                          style={{
                            marginRight: theme.spacing(0.5),
                            transform:
                              mockData.PortfolioPage.balance.percents > 0 ? '' : 'rotate(180deg)',
                          }}
                        />
                        <Typography variant="caption1">
                          {mockData.PortfolioPage.balance.percents > 0
                            ? mockData.PortfolioPage.balance.percents
                            : -1 * mockData.PortfolioPage.balance.percents}
                          %
                        </Typography>
                      </Stack>
                    }
                  />
                  <Chip
                    active={mockData.PortfolioPage.balance.amount > 0}
                    label={
                      <Typography variant="caption1">
                        {mockData.PortfolioPage.balance.amount > 0 ? '+' : ''}
                        {mockData.PortfolioPage.balance.amount} USD
                      </Typography>
                    }
                  />
                </Stack>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        <SearchInput
          disableUnderline
          onChange={e => setKeyword(e.target.value)}
          placeholder={strings.search}
          startAdornment={
            <InputAdornment
              sx={{
                '> svg > use': {
                  fill: '#242838',
                },
              }}
              position="start"
            >
              <Search />
            </InputAdornment>
          }
        />
      </Stack>
      <StatsTable data={tokenList} isLoading={isLoading} />
    </Stack>
  );
};

export default PortfolioWallet;
