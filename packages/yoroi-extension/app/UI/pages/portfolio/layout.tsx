import { ROUTES } from '../../../routes-config';
// import { buildRoute } from '../../../utils/routing';
// import PortfolioMenu from '../../features/portfolio/common/components/PortfolioMenu';
import { ReactNode } from 'react';
import NavBarTitle from '../../../components/topbar/NavBarTitle';
import NavBarContainerRevamp from '../../../containers/NavBarContainerRevamp';
import { PortfolioTokenActivityProvider } from '../../features/portfolio/module/PortfolioTokenActivityProvider';
import GeneralPageLayout from '../../layout/GeneralPageLayout';

type Props = {
  stores: any;
  children: ReactNode;
};

const PortfolioLayout = ({ stores, children }: Props): JSX.Element => {
  // const isActivePage = (route: string) => {
  //   const { location } = stores.router;
  //   if (route && location) {
  //     return location.pathname === buildRoute(route);
  //   }
  //   return false;
  // };
  const isDetailPage = stores.routing.currentRoute.startsWith(`${ROUTES.PORTFOLIO.ROOT}/details`);
  // const menu =
  //   isDetailPage || mockData.dapps.liquidityList.length + mockData.dapps.orderList.length === 0 ? null : (
  //     <PortfolioMenu onItemClick={(route: string) => actions.router.goToRoute.trigger({ route })} isActiveItem={isActivePage} />
  //   );

  return (
    <GeneralPageLayout
      stores={stores}
      navbar={
        <NavBarContainerRevamp
          stores={stores}
          title={<NavBarTitle title={isDetailPage ? 'Portfolio' : 'Portfolio'} />}
          // menu={menu}
        />
      }
    >
      <PortfolioTokenActivityProvider>{children}</PortfolioTokenActivityProvider>
    </GeneralPageLayout>
  );
};

export default PortfolioLayout;
