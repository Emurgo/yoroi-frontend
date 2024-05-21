// @flow
import { useState } from 'react';
import { Box } from '@mui/material';
import Tabs from '../../../../components/common/tabs/Tabs';
import { ReactComponent as RefreshIcon } from '../../../../assets/images/revamp/icons/refresh.inline.svg';
import { useSwap } from '@yoroi/swap';
import { useSwapForm } from '../../context/swap-form';

type TopActionsProps = {|
  orderType: string,
|};

export const TopActions = ({ orderType }: TopActionsProps): React$Node => {

  const { orderTypeChanged } = useSwap();
  const {
    sellTokenInfo = {},
    buyTokenInfo = {},
  } = useSwapForm();

  const isValidTickers = sellTokenInfo?.ticker && buyTokenInfo?.ticker;
  const isDisabled = !isValidTickers;

  const orderTypeTabs = [
    { type: 'market', label: 'Market' },
    { type: 'limit', label: 'Limit' },
  ];

  const [rotationDegrees, setRotationDegrees] = useState(0);

  const handleRefresh = () => {
    document.activeElement?.blur();
    setRotationDegrees(prevDegrees => prevDegrees + 360);
    console.log('swap refresh');
  };

  const refreshIconStyles = {
    transform: `rotate(${rotationDegrees}deg)`,
    transition: 'transform 2s ease',
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
        sx={{ cursor: 'pointer', '& path': { fill: isDisabled && '#A0A4A8' } }}
        onClick={isDisabled ? () => {} : handleRefresh}
      >
        <RefreshIcon
          style={{
            ...(!isDisabled && refreshIconStyles),
          }}
        />
      </Box>
    </Box>
  );
};
