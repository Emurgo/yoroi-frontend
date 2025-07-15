import { ReactNode } from 'react';
import NavBarTitle from '../../../components/topbar/NavBarTitle';
import NavBarContainerRevamp from '../../../containers/NavBarContainerRevamp';
import GeneralPageLayout from '../../layout/GeneralPageLayout';
import SubMenu from '../../../components/topbar/SubMenu';
import { useIntl } from 'react-intl';
import { connectorMessages } from '../../../i18n/global-messages';
import { allWalletSubcategories } from '../../../stores/stateless/topbarCategories';

type Props = {
  stores: any;
  children: ReactNode;
};

const WalletLayout = ({ stores, children }: Props): JSX.Element => {
  const intl = useIntl();
  const selectedWallet = stores.wallets.selectedOrFail;
  const isInitialSyncing = selectedWallet.lastSyncInfo.Time == null;

  const menu = (
    <SubMenu
      options={allWalletSubcategories.map(category => ({
        className: category.className,
        label: intl.formatMessage(category.label),
        route: category.route,
      }))}
      onItemClick={route => stores.routing.goToRoute({ route })}
      isActiveItem={route => stores.routing.currentRoute.startsWith(route)}
      locationId="wallet"
    />
  );

  return (
    <GeneralPageLayout
      stores={stores}
      navbar={
        <NavBarContainerRevamp
          stores={stores}
          title={<NavBarTitle title={intl.formatMessage(connectorMessages.dappConnector)} />}
          menu={isInitialSyncing ? null : menu}
        />
      }
    >
      {children}
    </GeneralPageLayout>
  );
};

export default WalletLayout;
