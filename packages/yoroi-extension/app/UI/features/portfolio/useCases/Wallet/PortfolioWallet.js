// @flow
import { Typography, Stack, Box, Input, styled } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Tooltip, SearchInput } from '../../../../components';
import { useTheme } from '@mui/material/styles';
import { defineMessages } from 'react-intl';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import StatsTable from './StatsTable';
import mockData from '../../common/mockData';
import { Chip } from '../../../../components/chip';
import { Skeleton } from '../../../../components/Skeleton';
import { useStrings } from '../../common/useStrings';
import { Icon } from '../../../../components/icons/index';

const PortfolioWallet = ({ data }) => {
  const theme = useTheme();
  const strings = useStrings();
  const { unitOfAccount, changeUnitOfAccount, settingFiatPairUnit } = usePortfolio();
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState();
  const [tokenList, setTokenList] = useState([]);
  const [isAdaMainUnit, setIsAdaMainUnit] = useState(unitOfAccount === 'ADA');

  const handleCurrencyChange = () => {
    if (isAdaMainUnit) {
      changeUnitOfAccount(settingFiatPairUnit.currency || 'USD');
      setIsAdaMainUnit(false);
    } else {
      changeUnitOfAccount('ADA');
      setIsAdaMainUnit(true);
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
      return (
        item.name.toLowerCase().includes(lowercaseKeyword) ||
        item.id.toLowerCase().includes(lowercaseKeyword) ||
        item.overview.fingerprint.toLowerCase().includes(lowercaseKeyword)
      );
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
          <Stack direction="row" spacing={theme.spacing(0.5)} alignItems="flex-end">
            {isLoading ? (
              <Skeleton width="146px" height="24px" />
            ) : (
              <Typography variant="h2" fontWeight="500" color="ds.gray_cmax">
                {isAdaMainUnit ? mockData.common.walletBalance.ada : mockData.common.walletBalance.usd}
              </Typography>
            )}
            <Typography variant="body2" fontWeight="500" color="ds.black_static">
              {isAdaMainUnit ? settingFiatPairUnit.currency || 'USD' : 'ADA'}
              <Typography
                component="span"
                variant="body2"
                fontWeight="500"
                color="ds.text_gray_low"
                onClick={handleCurrencyChange}
                sx={{
                  cursor: 'pointer',
                  display: 'inline',
                  marginTop: '5px',
                }}
              >
                {isAdaMainUnit ? '/ADA' : `/${unitOfAccount}`}
              </Typography>
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {isLoading ? (
              <Skeleton width="129px" height="16px" />
            ) : (
              <Typography color="ds.gray_c600">
                {isAdaMainUnit ? mockData.common.walletBalance.usd : mockData.common.walletBalance.ada}{' '}
                {isAdaMainUnit ? 'ADA' : unitOfAccount}
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
                    active={mockData.common.walletBalance.percents >= 0}
                    label={
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        {mockData.common.walletBalance.percents >= 0 ? (
                          <Icon.ChipArrowUp fill={theme.palette.ds.secondary_c800} />
                        ) : (
                          <Icon.ChipArrowDown fill={theme.palette.ds.sys_magenta_c700} />
                        )}

                        <Typography variant="caption1">
                          {mockData.common.walletBalance.percents >= 0
                            ? mockData.common.walletBalance.percents
                            : -1 * mockData.common.walletBalance.percents}
                          %
                        </Typography>
                      </Stack>
                    }
                  />
                  <Chip
                    active={mockData.common.walletBalance.amount >= 0}
                    label={
                      <Typography variant="caption1">
                        {mockData.common.walletBalance.amount >= 0 && '+'}
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
      <StatsTable data={tokenList} isLoading={isLoading} />
    </Stack>
  );
};

export default PortfolioWallet;
