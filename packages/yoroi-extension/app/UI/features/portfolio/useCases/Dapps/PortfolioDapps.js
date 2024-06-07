// @flow
import { Typography, Stack, Box, Input, InputAdornment, Button, styled } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Tooltip, SearchInput, Chip, Skeleton } from '../../../../components';
import { useTheme } from '@mui/material/styles';
import LiquidityTable from './LiquidityTable';
import mockData from '../../common/mockData';
import OrderTable from './OrderTable';
import LendAndBorrow from './LendAndBorrow';
import { useStrings } from '../../common/hooks/useStrings';
import { Icon } from '../../../../components/icons/index';
import PortfolioHeader from '../../common/components/PortfolioHeader';
import { LiquidityItemType, OrderItemType } from '../../common/types/index';

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

interface Props {
  data: {
    liquidityList: LiquidityItemType[],
    orderList: OrderItemType[],
  };
}

const PortfolioDapps = ({ data }: Props) => {
  const theme = useTheme();
  const strings = useStrings();
  const [keyword, setKeyword] = useState();
  const [isLoading, setIsLoading] = useState();
  const [liquidityList, setLiquidlityList] = useState(data.liquidityList);
  const [orderList, setOrderList] = useState(data.orderList);
  const [buttonProps, setButtonProps] = useState([
    {
      id: TableTabs.LIQUIDITY,
      label: `${strings.liquidityPool}`,
      active: true,
    },
    { id: TableTabs.ORDER, label: `${strings.openOrders}`, active: false },
    { id: TableTabs.LENDBORROW, label: `${strings.lendAndBorrow}`, active: false },
  ]);

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
    <Stack direction="column" spacing={theme.spacing(3)} sx={{ minHeight: 'calc(100vh - 220px)' }}>
      <PortfolioHeader
        balance={mockData.common.dappsBalance}
        setKeyword={setKeyword}
        isLoading={isLoading}
        tooltipTitle={
          <>
            <Typography display={'block'}>% {strings.balancePerformance}</Typography>
            <Typography display={'block'}>+/- {strings.balanceChange}</Typography>
            <Typography display={'block'}>
              {strings.in24hours} ({strings.dapps})
            </Typography>
          </>
        }
      />

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
  );
};

export default PortfolioDapps;
