import { Stack } from '@mui/material';
import React from 'react';
import { useStrings } from '../../common/hooks/useStrings';
import Tabs from '../../../../../components/common/tabs/Tabs';

export const TopBarActions = () => {
  const [orderType, setOrderType] = React.useState('market');
  const { marketTabLabel, limitTabLabel } = useStrings();

  const orderTypeTabs = [
    { type: 'market', label: marketTabLabel },
    { type: 'limit', label: limitTabLabel },
  ];

  return (
    <Stack direction="row" justifyContent="space-between" width="100%">
      <Tabs
        tabs={orderTypeTabs.map(({ type, label }) => ({
          label,
          isActive: orderType === type,
          onClick: () => setOrderType(type),
        }))}
      />
    </Stack>
  );
};
