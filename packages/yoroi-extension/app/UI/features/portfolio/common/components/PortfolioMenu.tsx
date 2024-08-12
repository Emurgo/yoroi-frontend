import React from 'react';
import { ROUTES } from '../../../../../routes-config';
import { useStrings } from '../hooks/useStrings';
import mockData from '../mockData';
import { SubMenuOption } from '../types';
import Menu from './Menu';

interface Props {
  onItemClick: (itemId: string) => void;
  isActiveItem: (itemId: string) => boolean;
}

const PortfolioMenu = (props: Props): JSX.Element => {
  const strings = useStrings();

  const portfolioOptions: SubMenuOption[] = [
    {
      label: `${strings.menuWallet} (${mockData.wallet.tokenList.length})`,
      route: ROUTES.PORTFOLIO.ROOT,
      className: 'wallet',
    },
    {
      label: `${strings.menuDapps} (${mockData.dapps.liquidityList.length + mockData.dapps.orderList.length})`,
      route: ROUTES.PORTFOLIO.DAPPS,
      className: 'dapps',
    },
  ];

  return <Menu options={portfolioOptions} {...props} />;
};

export default PortfolioMenu;
