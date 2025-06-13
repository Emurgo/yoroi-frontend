import { Stack, useTheme } from '@mui/material';
import React from 'react';
import { useStrings } from '../../common/hooks/useStrings';
import Tabs from '../../../../../components/common/tabs/Tabs';
import { Icons, IconWrapper } from '../../../../components';
import { useModal } from '../../../../components/modals/ModalContext';
import { SettingsModalContent } from '../../common/components/SettingsModalContent';

export const TopBarActions = () => {
  const [orderType, setOrderType] = React.useState('market');
  const { marketTabLabel, limitTabLabel } = useStrings();
  const { atoms }: any = useTheme();
  const { openModal } = useModal();

  const orderTypeTabs = [
    { type: 'market', label: marketTabLabel },
    { type: 'limit', label: limitTabLabel },
  ];

  const openSettingsModal = () => {
    openModal({
      title: 'Settings',
      content: <SettingsModalContent />,
      height: '540px',
      width: '612px',
    });
  };

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
        <IconWrapper icon={Icons.Settings} asButton onClick={openSettingsModal} />
      </Stack>
    </Stack>
  );
};
