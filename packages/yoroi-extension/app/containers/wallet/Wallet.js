// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import TopBarLayout from '../../components/layout/TopBarLayout';
import VerticallyCenteredLayout from '../../components/layout/VerticallyCenteredLayout';
import SidebarContainer from '../SidebarContainer';
import NavBarContainer from '../NavBarContainer';
import BannerContainer from '../banners/BannerContainer';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { ROUTES } from '../../routes-config';
import { allSubcategoriesRevamp } from '../../stores/stateless/topbarCategories';
import NavBarContainerRevamp from '../NavBarContainerRevamp';
import globalMessages from '../../i18n/global-messages';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import SubMenu from '../../components/topbar/SubMenu';
import WalletLoadingAnimation from '../../components/wallet/WalletLoadingAnimation';
import { RevampAnnouncementDialog } from './dialogs/RevampAnnouncementDialog';
import { PoolTransitionDialog } from './dialogs/pool-transition/PoolTransitionDialog';
import { Redirect } from 'react-router';
import type { StoresProps } from '../../stores';

type Props = {|
  +children: Node,
|};
@observer
export default class Wallet extends Component<{| ...Props, ...StoresProps |}> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  componentDidMount() {
    if (!this.props.stores.profile.isRevampAnnounced)
      this.props.stores.uiDialogs.open({ dialog: RevampAnnouncementDialog });
  }

  checkRoute(): void | string {
    const categories = allSubcategoriesRevamp;
    if (this.props.stores.app.currentRoute.startsWith(ROUTES.TRANSFER.ROOT)) {
      return ROUTES.WALLETS.TRANSACTIONS;
    }

    // void -> this route is fine for this wallet type
    // string -> what you should be redirected to
    const wallet = this.props.stores.wallets.selected;
    if (wallet == null) return;

    const spendableBalance = this.props.stores.transactions.balance;
    const walletHasAssets = !!spendableBalance?.nonDefaultEntries().length;

    const activeCategory = categories.find(category =>
      this.props.stores.app.currentRoute.startsWith(category.route)
    );

    // if we're on a page that isn't applicable for the currently selected wallet
    // ex: a cardano-only page for an Ergo wallet
    // or no category is selected yet (wallet selected for the first time)
    const visibilityContext = {
      selected: wallet.publicDeriverId,
      networkId: wallet.networkId,
      walletHasAssets
    };
    if (
      !activeCategory?.isVisible(visibilityContext) &&
      activeCategory?.isHiddenButAllowed !== true
    ) {
      const firstValidCategory = categories.find(c => c.isVisible(visibilityContext));
      if (firstValidCategory == null) {
        throw new Error(`Selected wallet has no valid category`);
      }
      return firstValidCategory.route;
    }
  }

  navigateToMyWallets: string => void = destination => {
    this.props.stores.app.goToRoute({ route: destination });
  };

  render(): Node {
    const { stores } = this.props;
    // abort rendering if the page isn't valid for this wallet
    const newRoute = this.checkRoute();
    if (newRoute != null) {
      return <Redirect to={newRoute} />;
    }
    const { intl } = this.context;
    const selectedWallet = stores.wallets.selectedOrFail;

    if (!selectedWallet) {
      return (
        <TopBarLayout
          banner={<BannerContainer stores={stores} />}
          navbar={<NavBarContainer title="" stores={stores} />}
          showInContainer
        >
          <VerticallyCenteredLayout>
            <LoadingSpinner />
          </VerticallyCenteredLayout>
        </TopBarLayout>
      );
    }
    const warning = this.getWarning(selectedWallet.publicDeriverId);

    const isInitialSyncing = stores.wallets.isInitialSyncing(selectedWallet.publicDeriverId);
    const spendableBalance = stores.transactions.balance;
    const walletHasAssets = !!(spendableBalance?.nonDefaultEntries().length);

    const publicDeriver = stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(Wallet)} no public deriver. Should never happen`);
    }
    const currentPool = stores.delegation.getDelegatedPoolId(publicDeriver.publicDeriverId);

    const visibilityContext = {
      selected: selectedWallet.publicDeriverId,
      networkId: selectedWallet.networkId,
      walletHasAssets
    };

    const menu = (
      <SubMenu
        options={allSubcategoriesRevamp
          .filter(category => category.isVisible(visibilityContext))
          .map(category => ({
            className: category.className,
            label: intl.formatMessage(category.label),
            route: category.route,
          }))}
        onItemClick={route => stores.app.goToRoute({ route })}
        isActiveItem={route => stores.app.currentRoute.startsWith(route)}
        locationId="wallet"
      />
    );

    const sidebarContainer = <SidebarContainer stores={stores} />;

    return (
      <TopBarLayout
        banner={<BannerContainer stores={stores}/>}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainerRevamp
            stores={stores}
            title={<NavBarTitle title={intl.formatMessage(globalMessages.walletLabel)}/>}
            menu={isInitialSyncing ? null : menu}
          />
        }
        showInContainer
      >
        {warning}
        {isInitialSyncing ? (
          <WalletLoadingAnimation/>
        ) : (
          <>
            {this.props.children}
            {this.getDialogs(intl, currentPool)}
          </>
        )}
      </TopBarLayout>
    );
  }

  getWarning: (number) => void | Node = publicDeriverId => {
    const warnings = this.props.stores.walletSettings.getWalletWarnings(publicDeriverId).dialogs;
    if (warnings.length === 0) {
      return undefined;
    }
    return warnings[warnings.length - 1]();
  };

  getDialogs: (any, any) => Node = (intl, currentPool) => {
    const { stores } = this.props;
    const isOpen = stores.uiDialogs.isOpen;
    const isRevampDialogOpen = isOpen(RevampAnnouncementDialog);
    const selectedWallet = stores.wallets.selected;
    const poolTransitionInfo = stores.delegation.getPoolTransitionInfo(selectedWallet);


    if (
      stores.delegation.getPoolTransitionConfig(selectedWallet).show === 'open' &&
      !isRevampDialogOpen &&
      poolTransitionInfo?.shouldShowTransitionFunnel
    )
      return (
        <PoolTransitionDialog
          intl={intl}
          onClose={() => {
            stores.delegation.setPoolTransitionConfig(selectedWallet, { show: 'idle' });
          }}
          poolTransition={poolTransitionInfo}
          currentPoolId={currentPool ?? ''}
          onUpdatePool={() => {
            stores.delegation.setPoolTransitionConfig(selectedWallet, {
              show: 'idle',
              shouldUpdatePool: true,
            });
            stores.app.goToRoute({
              route: ROUTES.STAKING,
            });
          }}
        />
      );

    if (isRevampDialogOpen)
      return (
        <RevampAnnouncementDialog
          onClose={() => {
            stores.profile.markRevampAsAnnounced();
            this.props.stores.uiDialogs.closeActiveDialog();
          }}
        />
      );

    return null;
  };
}
