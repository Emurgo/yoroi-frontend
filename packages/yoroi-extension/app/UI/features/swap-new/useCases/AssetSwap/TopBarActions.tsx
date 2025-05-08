import { Stack, useTheme } from '@mui/material';
import React from 'react';
import { useStrings } from '../../common/hooks/useStrings';
import Tabs from '../../../../../components/common/tabs/Tabs';
import { Icons, IconWrapper } from '../../../../components';

export const TopBarActions = () => {
  const [orderType, setOrderType] = React.useState('market');
  const { marketTabLabel, limitTabLabel } = useStrings();
  const { atoms }: any = useTheme();

  const orderTypeTabs = [
    { type: 'market', label: marketTabLabel },
    { type: 'limit', label: limitTabLabel },
  ];

  return (
    <Stack direction="row" justifyContent="space-between" width="100%" {...atoms.pr_sm}>
      <Tabs
        tabs={orderTypeTabs.map(({ type, label }) => ({
          label,
          isActive: orderType === type,
          onClick: () => setOrderType(type),
        }))}
      />

      <Stack direction="row" alignItems="center" {...atoms.gap_sm}>
        <IconWrapper icon={Icons.Refresh} asButton />
        <IconWrapper icon={Icons.Settings} asButton />
      </Stack>
    </Stack>
  );
};
