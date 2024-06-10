// @flow
import React from 'react';
import SubMenu from '../../../../../components/topbar/SubMenu';
import { ROUTES } from '../../../../../routes-config';
import { useStrings } from '../hooks/useStrings';
import mockData from '../mockData';

interface SubMenuOption {
  label: string;
  route: string;
  className: string;
}

interface Props {
  onItemClick: (string) => void;
  isActiveItem: (string) => boolean;
}

const PortfolioMenu = ({ onItemClick, isActiveItem }: Props): JSX.Element => {
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

  return <SubMenu options={portfolioOptions} onItemClick={onItemClick} isActiveItem={isActiveItem} locationId="portfolio" />;
};

export default PortfolioMenu;
