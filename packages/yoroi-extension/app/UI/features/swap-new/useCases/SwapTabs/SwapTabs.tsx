import React from 'react';
import { useStrings } from '../../common/hooks/useStrings';
import TabMenu, { SubMenuOption } from '../../../../components/Menus/TabMenu';
import { ROUTES } from '../../../../../routes-config';

type Props = {
  isActiveItem: (arg: string) => boolean;
  onItemClick: (arg: string) => void;
};

export default function SwapTabs({ onItemClick, isActiveItem }: Props) {
  const strings = useStrings();

  const settingOptions: SubMenuOption[] = [
    {
      label: strings.assetSwapLabel,
      route: ROUTES.SWAP_REVAMP.ASSET_SWAP,
      className: 'swap',
    },
    {
      label: strings.orderSwapLabel,
      route: ROUTES.SWAP_REVAMP.ORDERS,
      className: 'orders',
    },
  ];

  return <TabMenu options={settingOptions} onItemClick={onItemClick} isActiveItem={isActiveItem} locationId="swap" />;
}
