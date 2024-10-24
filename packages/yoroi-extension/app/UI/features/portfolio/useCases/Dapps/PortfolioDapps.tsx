import { Box, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import PortfolioHeader from '../../common/components/PortfolioHeader';
import { useStrings } from '../../common/hooks/useStrings';
import { ITabButtonProps, LiquidityItemType, OrderItemType } from '../../common/types/index';
import LendAndBorrow from './LendAndBorrow';
import LiquidityTable from './LiquidityTable';
import OrderTable from './OrderTable';

const TableTabs = Object.freeze({
  LIQUIDITY: 1,
  ORDER: 2,
  LENDBORROW: 3,
});

interface Props {
  data: {
    liquidityList: LiquidityItemType[];
    orderList: OrderItemType[];
  };
}

const PortfolioDapps = ({ data }: Props) => {
  const theme: any = useTheme();
  const strings = useStrings();
  const [keyword, setKeyword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [liquidityList, setLiquidlityList] = useState<LiquidityItemType[]>(data.liquidityList);
  const [orderList, setOrderList] = useState<OrderItemType[]>(data.orderList);
  const [buttonProps, setButtonProps] = useState<ITabButtonProps[]>([
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

  const handleChangeTab = (id: number | string) => {
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
        walletBalance={{ ada: '0' }}
        setKeyword={setKeyword}
        isLoading={isLoading}
        tooltipTitle={
          <>
            <Typography variant="body2" display={'block'}>
              % {strings.balancePerformance}
            </Typography>
            <Typography variant="body2" display={'block'}>
              +/- {strings.balanceChange}
            </Typography>
            <Typography variant="body2" display={'block'}>
              {strings.in24hours} ({strings.dapps})
            </Typography>
          </>
        }
      />

      <Stack direction="row">
        {buttonProps.map(button => (
          <Box
            key={button.label}
            onClick={() => handleChangeTab(button.id)}
            sx={(theme: any) => ({
              height: '2.5rem',
              textTransform: 'none',
              color: theme.palette.ds.gray_max,
              padding: `${theme.spacing(1)} !important`,
              backgroundColor: button.active ? theme.palette.ds.gray_200 : 'transparent',
              borderRadius: `${theme.shape.borderRadius}px`,
              cursor: 'pointer',
            })}
          >
            <Typography fontWeight="500" sx={{ whiteSpace: 'nowrap' }}>
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
          </Box>
        ))}
      </Stack>

      {buttonProps[0]?.active && <LiquidityTable data={liquidityList} isLoading={isLoading} />}
      {buttonProps[1]?.active && <OrderTable data={orderList} isLoading={isLoading} />}
      {buttonProps[2]?.active && <LendAndBorrow />}
    </Stack>
  );
};

export default PortfolioDapps;
