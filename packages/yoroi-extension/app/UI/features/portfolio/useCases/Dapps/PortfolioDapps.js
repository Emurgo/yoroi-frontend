// @flow
import { Typography, Stack, Box, Input, InputAdornment, Button, styled } from '@mui/material';
import { ReactComponent as Search } from '../../../../../assets/images/assets-page/search.inline.svg';
import React, { useEffect, useState } from 'react';
import { Tooltip, SearchInput } from '../../../../components';
import { useTheme } from '@mui/material/styles';
import { defineMessages } from 'react-intl';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import LiquidityTable from './LiquidityTable';
import mockData from '../../common/mockData';
import { Chip } from '../../../../components/chip';
import { Skeleton } from '../../../../components/Skeleton';
import OrderTable from './OrderTable';
import LendAndBorrow from './LendAndBorrow';
import { useStrings } from '../../common/useStrings';
import { Icon } from '../../../../components/icons/index';

const StyledButton = styled(Button)(({ theme }) => ({
  height: '40px',
  textTransform: 'none',
  color: theme.palette.ds.gray_cmax,
  padding: `${theme.spacing(1)} !important`,
}));

const TableTabs = {
  LIQUIDITY: 1,
  ORDER: 2,
  LENDBORROW: 3,
};

const PortfolioDapps = ({ data }) => {
  const theme = useTheme();
  const strings = useStrings();
  const { unitOfAccount, changeUnitOfAccount, settingFiatPairUnit } = usePortfolio();
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState();
  const [liquidityList, setLiquidlityList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [buttonProps, setButtonProps] = useState([
    {
      id: TableTabs.LIQUIDITY,
      label: `${strings.liquidityPool}`,
      active: true,
    },
    { id: TableTabs.ORDER, label: `${strings.openOrders}`, active: false },
    { id: TableTabs.LENDBORROW, label: `${strings.lendAndBorrow}`, active: false },
  ]);
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
      setLiquidlityList(data.liquidityList);
      setOrderList(data.orderList);
      return;
    }

    const lowercaseKeyword = keyword.toLowerCase();

    const liquidityTemp = data.liquidityList.filter(item => {
      return item.tokenPair.toLowerCase().includes(lowercaseKeyword);
    });
    const orderTemp = data.orderList.filter(item => {
      return item.pair.toLowerCase().includes(lowercaseKeyword);
    });
    if (liquidityTemp && liquidityTemp.length > 0) {
      setLiquidlityList(liquidityTemp);
    } else {
      setLiquidlityList([]);
    }
    if (orderTemp && orderTemp.length > 0) {
      setOrderList(orderTemp);
    } else {
      setOrderList([]);
    }
  }, [keyword]);

  const handleChangeTab = id => {
    const temp = buttonProps.map(prop => {
      if (prop.id === id)
        return {
          ...prop,
          active: true,
        };
      return {
        ...prop,
        active: false,
      };
    });
    setButtonProps(temp);
  };

  return (
    <Box>
      <Stack direction="column" spacing={theme.spacing(3)} sx={{ minHeight: 'calc(100vh - 220px)' }}>
        <Stack direction="row" justifyContent="space-between">
          <Stack direction="column">
            <Stack direction="row" spacing={theme.spacing(0.5)} alignItems="flex-end">
              {isLoading ? (
                <Skeleton width="146px" height="24px" />
              ) : (
                <Typography variant="h2" fontWeight="500" color="ds.gray_cmax">
                  {isAdaMainUnit ? mockData.common.dappsBalance.ada : mockData.common.dappsBalance.usd}
                </Typography>
              )}
              <Typography variant="body2" fontWeight="500" color="ds.black_static">
                {isAdaMainUnit ? settingFiatPairUnit.currency || 'USD' : 'ADA'}
                <Typography
                  component="span"
                  variant="body2"
                  fontWeight="500"
                  color="ds.gray_c400"
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
                  {isAdaMainUnit ? mockData.common.dappsBalance.usd : mockData.common.dappsBalance.ada}{' '}
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
                      <Typography display={'block'}>
                        {strings.in24hours} ({strings.dapps})
                      </Typography>
                    </>
                  }
                  placement="right"
                >
                  <Stack direction="row" alignItems="center" spacing={theme.spacing(1)} sx={{ marginLeft: theme.spacing(2) }}>
                    <Chip
                      active={mockData.common.dappsBalance.percents >= 0}
                      label={
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          {mockData.common.dappsBalance.percents >= 0 ? (
                            <Icon.ChipArrowUp fill={theme.palette.ds.secondary_c800} />
                          ) : (
                            <Icon.ChipArrowDown fill={theme.palette.ds.sys_magenta_c700} />
                          )}

                          <Typography variant="caption1">
                            {mockData.common.dappsBalance.percents >= 0
                              ? mockData.common.dappsBalance.percents
                              : -1 * mockData.common.dappsBalance.percents}
                            %
                          </Typography>
                        </Stack>
                      }
                    />
                    <Chip
                      active={mockData.common.dappsBalance.amount >= 0}
                      label={
                        <Typography variant="caption1">
                          {mockData.common.dappsBalance.amount >= 0 && '+'}
                          {mockData.common.dappsBalance.amount} USD
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

        <Stack direction="row">
          {buttonProps.map(button => (
            <StyledButton
              key={button.label}
              onClick={() => handleChangeTab(button.id)}
              sx={{ backgroundColor: button.active ? theme.palette.ds.gray_c200 : 'transparent' }}
            >
              <Typography variant="button1">
                {button.label} (
                {button.id === TableTabs.LIQUIDITY
                  ? liquidityList.length
                  : button.id === TableTabs.ORDER
                  ? orderList.length
                  : button.id === TableTabs.LENDBORROW
                  ? 0
                  : null}
                )
              </Typography>
            </StyledButton>
          ))}
        </Stack>

        {buttonProps[0].active && <LiquidityTable data={liquidityList} isLoading={isLoading} />}
        {buttonProps[1].active && <OrderTable data={orderList} isLoading={isLoading} />}
        {buttonProps[2].active && <LendAndBorrow />}
      </Stack>
    </Box>
  );
};

export default PortfolioDapps;
