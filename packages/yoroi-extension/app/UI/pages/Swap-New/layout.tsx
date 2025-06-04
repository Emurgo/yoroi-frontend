import { ReactNode } from 'react';
import { useLocation } from 'react-router';
import NavBarTitle from '../../../components/topbar/NavBarTitle';
import NavBarContainerRevamp from '../../../containers/NavBarContainerRevamp';
import { PortfolioTokenActivityProvider } from '../../features/portfolio/module/PortfolioTokenActivityProvider';
import GeneralPageLayout from '../../layout/GeneralPageLayout';
import SwapTabs from '../../features/swap-new/useCases/SwapTabs/SwapTabs';

type Props = {
  stores: any;
  children: ReactNode;
};

const SwapLayout = ({ stores, children }: Props): JSX.Element => {
  const { isTestnet } = stores.wallets.selectedOrFail;
  const location = useLocation();

  const menu = isTestnet ? null : (
    <SwapTabs
      onItemClick={route => {
        stores.app.goToRoute({ route });
      }}
      isActiveItem={route => typeof route === 'string' && location.pathname === route}
    />
  );

  return (
    <GeneralPageLayout
      stores={stores}
      navbar={<NavBarContainerRevamp stores={stores} title={<NavBarTitle title="Swap" />} menu={menu} />}
    >
      <PortfolioTokenActivityProvider>{children}</PortfolioTokenActivityProvider>
    </GeneralPageLayout>
  );
};

export default SwapLayout;
