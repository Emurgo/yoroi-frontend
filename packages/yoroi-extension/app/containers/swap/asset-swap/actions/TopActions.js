// @flow
import { useState } from 'react';
import { Box } from '@mui/material';
import Tabs from '../../../../components/common/tabs/Tabs';
import { ReactComponent as RefreshIcon } from '../../../../assets/images/revamp/icons/refresh.inline.svg';
import { useSwap, useSwapPoolsByPair } from '@yoroi/swap';
import { useSwapForm } from '../../context/swap-form';

type OrderTypeTab = {|
  type: string,
  label: string,
|};

type TopActionsProps = {|
  orderTypeTabs: OrderTypeTab[],
  orderType: string,
|};

export const TopActions = ({ orderTypeTabs, orderType }: TopActionsProps): React$Node => {
  const { orderTypeChanged, orderData, poolPairsChanged } = useSwap();
  const { buyQuantity, sellQuantity } = useSwapForm();
  const isDisabled = buyQuantity.isTouched && sellQuantity.isTouched;

  const { refetch } = useSwapPoolsByPair(
    {
      tokenA: orderData.amounts.sell.tokenId,
      tokenB: orderData.amounts.buy.tokenId,
    },
    {
      enabled: false,
      onSuccess: pools => {
        poolPairsChanged(pools);
      },
    }
  );

  const [rotationDegrees, setRotationDegrees] = useState(0);

  const handleRefresh = () => {
    document.activeElement?.blur();
    setRotationDegrees(prevDegrees => prevDegrees + 180);
    refetch();
  };

  const refreshIconStyles = {
    transform: `rotate(${rotationDegrees}deg)`,
    transition: 'transform 1s ease',
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" mb="16px">
      <Tabs
        tabs={orderTypeTabs.map(({ type, label }) => ({
          label,
          isActive: orderType === type,
          onClick: () => orderTypeChanged(type),
        }))}
      />
      <Box
        sx={{ cursor: 'pointer', '& path': { fill: !isDisabled && '#A0A4A8' } }}
        onClick={handleRefresh}
      >
        <RefreshIcon
          style={{
            ...(isDisabled && refreshIconStyles),
          }}
        />
      </Box>
    </Box>
  );
};
