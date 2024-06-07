// @flow
import { ReactNode } from 'react';
import SubMenu from '../../../../../components/topbar/SubMenu';
import type { SubMenuOption } from '../topbar/SubMenu';
import { ROUTES } from '../../../../../routes-config';
import { useStrings } from '../hooks/useStrings';
import mockData from '../mockData';

interface Props {
  onItemClick: string => void;
  isActiveItem: string => boolean;
}

const PortfolioMenu = ({ onItemClick, isActiveItem }: Props): ReactNode => {
  const strings = useStrings();

  const portfolioOptions: SubMenuOption[] = [
    {
      label: `${strings.headerWallet} (${mockData.wallet.tokenList.length})`,
      route: ROUTES.PORTFOLIO.ROOT,
      className: 'wallet',
    },
    {
      label: `${strings.headerDapps} (${mockData.dapps.liquidityList.length + mockData.dapps.orderList.length})`,
      route: ROUTES.PORTFOLIO.DAPPS,
      className: 'dapps',
    },
  ];

  return <SubMenu options={portfolioOptions} onItemClick={onItemClick} isActiveItem={isActiveItem} locationId="portfolio" />;
};

export default PortfolioMenu;
