import { Box, Stack, useTheme } from '@mui/material';
import { useStrings } from '../../common/hooks/useStrings';
import Tabs from '../../../../../components/common/tabs/Tabs';
import { Icons, IconWrapper } from '../../../../components';
import { useModal } from '../../../../components/modals/ModalContext';
import { SettingsModalContent } from '../../common/components/Modals/SettingsModalContent';
import { SwapAction, useSwapRevamp } from '../../module/SwapContextProvider';
import { LIMIT_ORDER, MARKET_ORDER } from '../../common/constants';

export const TopBarActions = () => {
  const { marketTabLabel, limitTabLabel } = useStrings();
  const { atoms }: any = useTheme();
  const { openModal } = useModal();
  const { swapForm } = useSwapRevamp();

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
          isActive: swapForm?.orderType === type,
          onClick: () => {
            if (type === LIMIT_ORDER) {
              swapForm.action({ type: SwapAction.ChangeOrderType, value: LIMIT_ORDER });
            } else {
              swapForm.action({ type: SwapAction.ChangeOrderType, value: MARKET_ORDER });
            }
          },
        }))}
      />

      <Stack direction="row" alignItems="center" {...atoms.gap_sm}>
        <IconWrapper icon={Icons.Refresh} asButton />
        <Box onClick={openSettingsModal}>
          <IconWrapper icon={Icons.Settings} asButton />
        </Box>
      </Stack>
    </Stack>
  );
};
