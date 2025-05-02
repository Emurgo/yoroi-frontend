import React, { ReactNode } from 'react';
import NavBarTitle from '../../../components/topbar/NavBarTitle';
import NavBarContainerRevamp from '../../../containers/NavBarContainerRevamp';
import { PortfolioTokenActivityProvider } from '../../features/portfolio/module/PortfolioTokenActivityProvider';
import GeneralPageLayout from '../../layout/GeneralPageLayout';
import SwapTabs from '../../features/swap-new/useCases/SwapTabs/SwapTabs';
import { useLocation } from 'react-router';

type Props = {
  stores: any;
  actions: any;
  children: ReactNode;
};

const SwapLayout = ({ stores, actions, children }: Props): JSX.Element => {
  const { isTestnet } = stores.wallets.selectedOrFail;

  const isActivePage = (route: string): boolean => {
    const location = useLocation();
    if (route && location.pathname === route) {
      return true;
    }
    return false;
  };

  const menu = isTestnet ? null : (
    <SwapTabs
      onItemClick={route => {
        stores.app.goToRoute({ route });
      }}
      isActiveItem={isActivePage}
    />
  );

  return (
    <GeneralPageLayout
      stores={stores}
      actions={actions}
      navbar={<NavBarContainerRevamp actions={actions} stores={stores} title={<NavBarTitle title={'Swap'} />} menu={menu} />}
    >
      <PortfolioTokenActivityProvider>{children}</PortfolioTokenActivityProvider>
    </GeneralPageLayout>
  );
};

export default SwapLayout;
