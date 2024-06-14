import { Stack, Button, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import LiquidityTable from './LiquidityTable';
import mockData from '../../common/mockData';
import OrderTable from './OrderTable';
import LendAndBorrow from './LendAndBorrow';
import { useStrings } from '../../common/hooks/useStrings';
import PortfolioHeader from '../../common/components/PortfolioHeader';
import { ITabButtonProps, LiquidityItemType, OrderItemType } from '../../common/types/index';

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
          <Button
            key={button.label}
            onClick={() => handleChangeTab(button.id)}
            sx={(theme: any) => ({
              height: '40px',
              textTransform: 'none',
              color: theme.palette.ds.gray_cmax,
              padding: `${theme.spacing(1)} !important`,
              backgroundColor: button.active ? theme.palette.ds.gray_c200 : 'transparent',
            })}
          >
            {/* @ts-ignore */}
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
          </Button>
        ))}
      </Stack>

      {buttonProps[0]?.active && <LiquidityTable data={liquidityList} isLoading={isLoading} />}
      {buttonProps[1]?.active && <OrderTable data={orderList} isLoading={isLoading} />}
      {buttonProps[2]?.active && <LendAndBorrow />}
    </Stack>
  );
};

export default PortfolioDapps;
