import { ROUTES } from '../../../routes-config';
import { buildRoute } from '../../../utils/routing';
import PortfolioMenu from '../../features/portfolio/common/components/PortfolioMenu';
import React, { ReactNode } from 'react';
import GeneralPageLayout from '../../layout/GeneralPageLayout';
import NavBarContainerRevamp from '../../../containers/NavBarContainerRevamp';
import NavBarTitle from '../../../components/topbar/NavBarTitle';

type Props = {
  stores: any;
  actions: any;
  children: ReactNode;
};

const PortfolioLayout = ({ stores, actions, children }: Props): JSX.Element => {
  const isActivePage = (route: string) => {
    const { location } = stores.router;
    if (route && location) {
      return location.pathname === buildRoute(route);
    }
    return false;
  };
  const isDetailPage = stores.router.location.pathname.startsWith(`${ROUTES.PORTFOLIO.ROOT}/details`);
  const menu = isDetailPage ? null : (
    <PortfolioMenu onItemClick={(route: string) => actions.router.goToRoute.trigger({ route })} isActiveItem={isActivePage} />
  );

  return (
    <GeneralPageLayout
      stores={stores}
      actions={actions}
      navbar={
        <NavBarContainerRevamp
          actions={actions}
          stores={stores}
          title={<NavBarTitle title={isDetailPage ? 'Token details' : 'Tokens'} />}
          menu={menu}
        />
      }
    >
      {children}
    </GeneralPageLayout>
  );
};

export default PortfolioLayout;
