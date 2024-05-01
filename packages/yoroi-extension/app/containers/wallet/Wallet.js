// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import TopBarLayout from '../../components/layout/TopBarLayout';
import VerticallyCenteredLayout from '../../components/layout/VerticallyCenteredLayout';
import SidebarContainer from '../SidebarContainer';
import NavBarContainer from '../NavBarContainer';
import BannerContainer from '../banners/BannerContainer';
import WalletWithNavigation from '../../components/wallet/layouts/WalletWithNavigation';
import NavBarBack from '../../components/topbar/NavBarBack';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { ROUTES } from '../../routes-config';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { allCategories, allSubcategoriesRevamp } from '../../stores/stateless/topbarCategories';
import { withLayout } from '../../styles/context/layout';
import type { LayoutComponentMap } from '../../styles/context/layout';
import NavBarContainerRevamp from '../NavBarContainerRevamp';
import globalMessages from '../../i18n/global-messages';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import SubMenu from '../../components/topbar/SubMenu';
import WalletSyncingOverlay from '../../components/wallet/syncingOverlay/WalletSyncingOverlay';
import WalletLoadingAnimation from '../../components/wallet/WalletLoadingAnimation';
import { RevampAnnouncementDialog } from './dialogs/RevampAnnouncementDialog';
import { PoolTransitionDialog } from './dialogs/pool-transition/PoolTransitionDialog';

type Props = {|
  ...StoresAndActionsProps,
  +children: Node,
|};
type InjectedLayoutProps = {| +renderLayoutComponent: LayoutComponentMap => Node |};
type AllProps = {| ...Props, ...InjectedLayoutProps |};

const messages = defineMessages({
  backButton: {
    id: 'wallet.nav.backButton',
    defaultMessage: '!!!Back to my wallets',
  },
});

@observer
class Wallet extends Component<AllProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  componentDidMount() {
    // reroute to the default path for the wallet
    const newRoute = this.checkRoute();
    if (newRoute != null) {
      this.props.actions.router.redirect.trigger({
        route: newRoute,
      });
    }

    if (!this.props.stores.profile.isRevampAnnounced)
      this.props.actions.dialogs.open.trigger({ dialog: RevampAnnouncementDialog });
  }

  checkRoute(): void | string {
    const isRevamp = this.props.stores.profile.isRevampTheme;
    const categories = isRevamp ? allSubcategoriesRevamp : allCategories;

    if (isRevamp && this.props.stores.app.currentRoute.startsWith(ROUTES.TRANSFER.ROOT)) {
      return ROUTES.WALLETS.TRANSACTIONS;
    }

    // void -> this route is fine for this wallet type
    // string -> what you should be redirected to
    const publicDeriver = this.props.stores.wallets.selected;
    if (publicDeriver == null) return;

    const spendableBalance = this.props.stores.transactions.balance;
    const walletHasAssets = !!spendableBalance?.nonDefaultEntries().length;

    const activeCategory = categories.find(category =>
      this.props.stores.app.currentRoute.startsWith(category.route)
    );

    // if we're on a page that isn't applicable for the currently selected wallet
    // ex: a cardano-only page for an Ergo wallet
    // or no category is selected yet (wallet selected for the first time)
    const visibilityContext = { selected: publicDeriver, walletHasAssets };
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
    this.props.actions.router.goToRoute.trigger({ route: destination });
  };

  render(): Node {
    const { actions, stores } = this.props;
    // abort rendering if the page isn't valid for this wallet
    if (this.checkRoute() != null) {
      return null;
    }
    const { intl } = this.context;
    const selectedWallet = stores.wallets.selected;

    if (!selectedWallet) {
      return (
        <TopBarLayout
          banner={<BannerContainer actions={actions} stores={stores} />}
          navbar={<NavBarContainer title="" actions={actions} stores={stores} />}
          showInContainer
          showAsCard
        >
          <VerticallyCenteredLayout>
            <LoadingSpinner />
          </VerticallyCenteredLayout>
        </TopBarLayout>
      );
    }
    const warning = this.getWarning(selectedWallet);
    if (selectedWallet == null) throw new Error(`${nameof(Wallet)} no public deriver`);

    const publicDeriver = this.props.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(Wallet)} no public deriver. Should never happen`);
    }
    const currentPool = this.props.stores.delegation.getDelegatedPoolId(publicDeriver);
    console.log('this.props.actions.dialogs.open', this.props.actions.dialogs);
    const poolTransition = stores.delegation.checkPoolTransition(publicDeriver);
    const isFirstSync = stores.wallets.firstSyncWalletId === selectedWallet.getPublicDeriverId();
    const spendableBalance = this.props.stores.transactions.balance;
    const walletHasAssets = !!spendableBalance?.nonDefaultEntries().length;

    const visibilityContext = { selected: selectedWallet, walletHasAssets };

    const menu = (
      <SubMenu
        options={allSubcategoriesRevamp
          .filter(category => category.isVisible(visibilityContext))
          .map(category => ({
            className: category.className,
            label: intl.formatMessage(category.label),
            route: category.route,
          }))}
        onItemClick={route => actions.router.goToRoute.trigger({ route })}
        isActiveItem={route => this.props.stores.app.currentRoute.startsWith(route)}
        locationId="wallet"
      />
    );

    const sidebarContainer = <SidebarContainer actions={actions} stores={stores} />;
    const walletClassic = (
      <TopBarLayout
        banner={<BannerContainer actions={actions} stores={stores} />}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainer
            actions={actions}
            stores={stores}
            title={
              <NavBarBack
                route={ROUTES.MY_WALLETS}
                onBackClick={this.navigateToMyWallets}
                title={intl.formatMessage(messages.backButton)}
              />
            }
          />
        }
        showInContainer
        showAsCard
      >
        {warning}
        <WalletWithNavigation
          categories={allCategories
            .filter(c => c.isVisible(visibilityContext))
            .map(category => ({
              className: category.className,
              icon: category.icon,
              label: category.label,
              isActive: this.props.stores.app.currentRoute.startsWith(category.route),
              onClick: () =>
                this.props.actions.router.goToRoute.trigger({
                  route: category.route,
                }),
            }))}
        >
          {this.props.children}
          {isFirstSync && (
            <WalletSyncingOverlay
              classicTheme={this.props.stores.profile.isClassicTheme}
              onClose={() => this.navigateToMyWallets(ROUTES.MY_WALLETS)}
            />
          )}
        </WalletWithNavigation>
      </TopBarLayout>
    );

    const walletRevamp = !isFirstSync ? (
      <TopBarLayout
        banner={<BannerContainer actions={actions} stores={stores} />}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainerRevamp
            actions={actions}
            stores={stores}
            title={<NavBarTitle title={intl.formatMessage(globalMessages.walletLabel)} />}
            menu={menu}
          />
        }
        showInContainer
        showAsCard
      >
        {warning}
        {this.props.children}
        {this.getDialogs(intl, poolTransition, currentPool)}
        {}
      </TopBarLayout>
    ) : (
      <TopBarLayout sidebar={sidebarContainer}>
        <WalletLoadingAnimation />
      </TopBarLayout>
    );

    return this.props.renderLayoutComponent({ CLASSIC: walletClassic, REVAMP: walletRevamp });
  }

  getWarning: (PublicDeriver<>) => void | Node = publicDeriver => {
    const warnings = this.props.stores.walletSettings.getWalletWarnings(publicDeriver).dialogs;
    if (warnings.length === 0) {
      return undefined;
    }
    return warnings[warnings.length - 1]();
  };

  getDialogs: (any, any, any) => Node = (intl, poolTransition, currentPool) => {
    const isOpen = this.props.stores.uiDialogs.isOpen;
    const isRevampDialogOpen = isOpen(RevampAnnouncementDialog);

    if (this.props.stores.delegation.poolTransitionConfig.show === 'open' && !isRevampDialogOpen)
      return (
        <PoolTransitionDialog
          intl={intl}
          onClose={() => {
            this.props.stores.delegation.setPoolTransitionConfig({ show: 'idle' });
          }}
          poolTransition={poolTransition}
          currentPoolId={currentPool ?? ''}
          onUpdatePool={() => {
            this.props.stores.delegation.setPoolTransitionConfig({
              show: 'idle',
              shouldUpdatePool: true,
            });
            this.props.actions.router.goToRoute.trigger({
              route: ROUTES.STAKING,
            });
          }}
        />
      );

    if (isRevampDialogOpen)
      return (
        <RevampAnnouncementDialog
          onClose={() => {
            this.props.actions.profile.markRevampAsAnnounced.trigger();
            this.props.actions.dialogs.closeActiveDialog.trigger();
          }}
        />
      );

    return null;
  };
}
export default (withLayout(Wallet): ComponentType<Props>);
