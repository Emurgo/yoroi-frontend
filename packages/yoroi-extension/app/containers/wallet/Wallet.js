// @flow
import { Component } from 'react';
import type { Node, ComponentType } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { intlShape, defineMessages } from 'react-intl';
import TopBarLayout from '../../components/layout/TopBarLayout';
import VerticallyCenteredLayout from '../../components/layout/VerticallyCenteredLayout';
import SidebarContainer from '../SidebarContainer';
import NavBarContainer from '../NavBarContainer';
import type { GeneratedData as SidebarContainerData } from '../SidebarContainer';
import type { GeneratedData as NavBarContainerData } from '../NavBarContainer';
import BannerContainer from '../banners/BannerContainer';
import type { GeneratedData as BannerContainerData } from '../banners/BannerContainer';
import WalletWithNavigation from '../../components/wallet/layouts/WalletWithNavigation';
import NavBarBack from '../../components/topbar/NavBarBack';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { ROUTES } from '../../routes-config';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { WarningList } from '../../stores/toplevel/WalletSettingsStore';
import { allCategories, allSubcategoriesRevamp } from '../../stores/stateless/topbarCategories';
import { MultiToken } from '../../api/common/lib/MultiToken';
import { withLayout } from '../../styles/context/layout';
import type { LayoutComponentMap } from '../../styles/context/layout';
import NavBarContainerRevamp from '../NavBarContainerRevamp';
import globalMessages from '../../i18n/global-messages';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import SubMenu from '../../components/topbar/SubMenu';
import type { GeneratedData as NavBarContainerRevampData } from '../NavBarContainerRevamp';
import WalletSyncingOverlay from '../../components/wallet/syncingOverlay/WalletSyncingOverlay';
import WalletLoadingAnimation from '../../components/wallet/WalletLoadingAnimation';

export type GeneratedData = typeof Wallet.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +children: Node,
|};
type InjectedProps = {| +renderLayoutComponent: LayoutComponentMap => Node |};
type AllProps = {| ...Props, ...InjectedProps |};

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
    const { wallets } = this.generated.stores;
    const publicDeriver = wallets.selected;
    const publicDerivers = wallets.publicDerivers;
    const isRevamp = this.generated.stores.profile.isRevampTheme;

    if (publicDeriver == null && isRevamp && publicDerivers.length !== 0) {
      const lastSelectedWallet = wallets.getLastSelectedWallet();
      this.generated.actions.wallets.setActiveWallet.trigger({
        wallet: lastSelectedWallet ?? publicDerivers[0],
      });
    }

    // reroute to the default path for the wallet
    const newRoute = this.checkRoute();
    if (newRoute != null) {
      this.generated.actions.router.redirect.trigger({
        route: newRoute,
      });
    }
  }

  checkRoute(): void | string {
    const isRevamp = this.generated.stores.profile.isRevampTheme;
    const categories = isRevamp ? allSubcategoriesRevamp : allCategories;

    // void -> this route is fine for this wallet type
    // string -> what you should be redirected to
    const publicDeriver = this.generated.stores.wallets.selected;
    if (publicDeriver == null) return;

    const spendableBalance = this.generated.stores.transactions.getBalanceRequest.result;
    const walletHasAssets = !!spendableBalance?.nonDefaultEntries().length;

    const activeCategory = categories.find(category =>
      this.generated.stores.app.currentRoute.startsWith(category.route)
    );

    // if we're on a page that isn't applicable for the currently selected wallet
    // ex: a cardano-only page for an Ergo wallet
    // or no category is selected yet (wallet selected for the first time)
    const visibilityContext = { selected: publicDeriver, walletHasAssets };
    if (!activeCategory?.isVisible(visibilityContext)) {
      const firstValidCategory = categories.find(c => c.isVisible(visibilityContext));
      if (firstValidCategory == null) {
        throw new Error(`Selected wallet has no valid category`);
      }
      return firstValidCategory.route;
    }
  }

  navigateToMyWallets: string => void = destination => {
    this.generated.actions.router.goToRoute.trigger({ route: destination });
  };

  render(): Node {
    // abort rendering if the page isn't valid for this wallet
    if (this.checkRoute() != null) {
      return null;
    }
    const { intl } = this.context;
    const { actions, stores } = this.generated;
    const selectedWallet = stores.wallets.selected;

    if (!selectedWallet) {
      return (
        <TopBarLayout
          banner={<BannerContainer {...this.generated.BannerContainerProps} />}
          navbar={<NavBarContainer title="" {...this.generated.NavBarContainerProps} />}
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

    const isFirstSync = stores.wallets.firstSyncWalletId === selectedWallet.getPublicDeriverId();
    const spendableBalance = this.generated.stores.transactions.getBalanceRequest.result;
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
        isActiveItem={route => this.generated.stores.app.currentRoute.startsWith(route)}
      />
    );

    const sidebarContainer = <SidebarContainer {...this.generated.SidebarContainerProps} />;
    const walletClassic = (
      <TopBarLayout
        banner={<BannerContainer {...this.generated.BannerContainerProps} />}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainer
            {...this.generated.NavBarContainerProps}
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
              isActive: this.generated.stores.app.currentRoute.startsWith(category.route),
              onClick: () =>
                this.generated.actions.router.goToRoute.trigger({
                  route: category.route,
                }),
            }))}
        >
          {this.props.children}
          {isFirstSync && (
            <WalletSyncingOverlay
              classicTheme={this.generated.stores.profile.isClassicTheme}
              onClose={() => this.navigateToMyWallets(ROUTES.MY_WALLETS)}
            />
          )}
        </WalletWithNavigation>
      </TopBarLayout>
    );

    const walletRevamp = !isFirstSync ? (
      <TopBarLayout
        banner={<BannerContainer {...this.generated.BannerContainerProps} />}
        sidebar={sidebarContainer}
        navbar={
          <NavBarContainerRevamp
            {...this.generated.NavBarContainerRevampProps}
            title={<NavBarTitle title={intl.formatMessage(globalMessages.walletLabel)} />}
            menu={menu}
          />
        }
        showInContainer
        showAsCard
      >
        {warning}
        {this.props.children}
      </TopBarLayout>
    ) : (
      <TopBarLayout sidebar={sidebarContainer}>
        <WalletLoadingAnimation />
      </TopBarLayout>
    );

    return this.props.renderLayoutComponent({ CLASSIC: walletClassic, REVAMP: walletRevamp });
  }

  getWarning: (PublicDeriver<>) => void | Node = publicDeriver => {
    const warnings = this.generated.stores.walletSettings.getWalletWarnings(publicDeriver).dialogs;
    if (warnings.length === 0) {
      return undefined;
    }
    return warnings[warnings.length - 1]();
  };

  @computed get generated(): {|
    BannerContainerProps: InjectedOrGenerated<BannerContainerData>,
    NavBarContainerProps: InjectedOrGenerated<NavBarContainerData>,
    NavBarContainerRevampProps: InjectedOrGenerated<NavBarContainerRevampData>,
    SidebarContainerProps: InjectedOrGenerated<SidebarContainerData>,
    actions: {|
      router: {|
        goToRoute: {|
          trigger: (params: {|
            publicDeriver?: null | PublicDeriver<>,
            params?: ?any,
            route: string,
          |}) => void,
        |},
        redirect: {|
          trigger: (params: {|
            params?: ?any,
            route: string,
          |}) => void,
        |},
      |},
      wallets: {|
        setActiveWallet: {|
          trigger: (params: {|
            wallet: PublicDeriver<>,
          |}) => void,
        |},
      |},
    |},
    stores: {|
      app: {| currentRoute: string |},
      walletSettings: {|
        getWalletWarnings: (PublicDeriver<>) => WarningList,
      |},
      wallets: {|
        selected: null | PublicDeriver<>,
        publicDerivers: Array<PublicDeriver<>>,
        firstSyncWalletId: ?number,
        getLastSelectedWallet: void => ?PublicDeriver<>,
      |},
      router: {| location: any |},
      transactions: {|
        getBalanceRequest: {|
          result: ?MultiToken,
        |},
      |},
      profile: {|
        isRevampTheme: boolean,
        isClassicTheme: boolean,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(Wallet)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const settingStore = this.props.stores.walletSettings;
    return Object.freeze({
      stores: {
        app: {
          currentRoute: stores.app.currentRoute,
        },
        wallets: {
          selected: stores.wallets.selected,
          publicDerivers: stores.wallets.publicDerivers,
          firstSyncWalletId: stores.wallets.firstSyncWalletId,
          getLastSelectedWallet: stores.wallets.getLastSelectedWallet,
        },
        walletSettings: {
          getWalletWarnings: settingStore.getWalletWarnings,
        },
        router: {
          location: stores.router.location,
        },
        transactions: {
          getBalanceRequest: (() => {
            if (stores.wallets.selected == null)
              return {
                result: undefined,
              };
            const { requests } = stores.transactions.getTxRequests(stores.wallets.selected);

            return {
              result: requests.getBalanceRequest.result,
            };
          })(),
        },
        profile: {
          isRevampTheme: stores.profile.isRevampTheme,
          isClassicTheme: stores.profile.isClassicTheme,
        },
      },
      actions: {
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
          redirect: { trigger: actions.router.redirect.trigger },
        },
        wallets: {
          setActiveWallet: { trigger: actions.wallets.setActiveWallet.trigger },
        },
      },
      SidebarContainerProps: ({ actions, stores }: InjectedOrGenerated<SidebarContainerData>),
      NavBarContainerProps: ({ actions, stores }: InjectedOrGenerated<NavBarContainerData>),
      NavBarContainerRevampProps: ({
        actions,
        stores,
      }: InjectedOrGenerated<NavBarContainerRevampData>),
      BannerContainerProps: ({ actions, stores }: InjectedOrGenerated<BannerContainerData>),
    });
  }
}
export default (withLayout(Wallet): ComponentType<Props>);
