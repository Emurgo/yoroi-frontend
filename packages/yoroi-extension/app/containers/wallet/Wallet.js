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
import { THEMES } from '../../styles/utils';
import type { Theme } from '../../styles/utils';

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
    // reroute to the default path for the wallet
    const newRoute = this.checkRoute();
    if (newRoute != null) {
      this.generated.actions.router.redirect.trigger({
        route: newRoute,
      });
    }
  }

  checkRoute(): void | string {
    let categories;
    if (this.generated.stores.profile.currentTheme === THEMES.YOROI_REVAMP) {
      categories = allCategories.filter(c => c.route !== ROUTES.WALLETS.DELEGATION_DASHBOARD);
    } else {
      categories = allCategories;
    }
    // void -> this route is fine for this wallet type
    // string -> what you should be redirected to
    const publicDeriver = this.generated.stores.wallets.selected;
    if (publicDeriver == null) throw new Error(`${nameof(Wallet)} no public deriver`);

    const spendableBalance = this.generated.stores.transactions.balance;
    const walletHasAssets = !!(spendableBalance?.nonDefaultEntries().length);

    const activeCategory = categories.find(
      category => this.generated.stores.app.currentRoute.startsWith(category.route)
    );

    // if we're on a page that isn't applicable for the currently selected wallet
    // ex: a cardano-only page for an Ergo wallet
    // or no category is selected yet (wallet selected for the first time)
    const visibilityContext = { selected: publicDeriver, walletHasAssets };
    if (!activeCategory?.isVisible(visibilityContext)) {
      const firstValidCategory = categories
        .find(c => c.isVisible(visibilityContext));
      if (firstValidCategory == null) {
        throw new Error(`Selected wallet has no valid category`);
      }
      return firstValidCategory.route;
    }
    return undefined;
  }

  navigateToMyWallets: string => void = destination => {
    this.generated.actions.router.goToRoute.trigger({ route: destination });
  };

  renderOverlay(): null | React$Element<typeof WalletSyncingOverlay> {
    const publicDeriver = this.generated.stores.wallets.selected;
    if (publicDeriver == null) throw new Error(`${nameof(this.renderOverlay)} no public deriver`);

    if (this.generated.stores.wallets.firstSync === publicDeriver.getPublicDeriverId()) {
      return (
        <WalletSyncingOverlay
          classicTheme={this.generated.stores.profile.currentTheme === THEMES.YOROI_CLASSIC}
          onClose={() => this.navigateToMyWallets(ROUTES.MY_WALLETS)}
        />
      )
    }
    return null
  }

  render(): Node {
    // abort rendering if the page isn't valid for this wallet
    if (this.checkRoute() != null) {
      return null;
    }
    const { intl } = this.context;
    const { wallets } = this.generated.stores;
    const { actions } = this.generated;

    if (!wallets.selected) {
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
    const selectedWallet = wallets.selected;
    const warning = this.getWarning(selectedWallet);

    const spendableBalance = this.generated.stores.transactions.balance;
    const walletHasAssets = !!(spendableBalance?.nonDefaultEntries().length);
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
          categories={
            allCategories
              .filter(c => c.isVisible(visibilityContext))
              .map(category => ({
                className: category.className,
                icon: category.icon,
                label: category.label,
                isActive: this.generated.stores.app.currentRoute.startsWith(category.route),
                onClick: () => this.generated.actions.router.goToRoute.trigger({
                  route: category.route,
                }),
            }))}
        >
          {this.props.children}
          {this.renderOverlay()}
        </WalletWithNavigation>
      </TopBarLayout>
    );

    const walletRevamp = (
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
        {this.renderOverlay()}
        {this.props.children}
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
    |},
    stores: {|
      app: {| currentRoute: string |},
      walletSettings: {|
        getWalletWarnings: (PublicDeriver<>) => WarningList,
      |},
      wallets: {|
        selected: null | PublicDeriver<>,
        firstSync: ?number,
      |},
      router: {| location: any |},
      transactions: {| balance: MultiToken | null |},
      profile: {|
        currentTheme: Theme,
      |},
    |}
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
          firstSync: stores.wallets.firstSync
        },
        walletSettings: {
          getWalletWarnings: settingStore.getWalletWarnings,
        },
        router: {
          location: stores.router.location,
        },
        transactions: {
          balance: stores.transactions.balance,
        },
        profile: {
          currentTheme: stores.profile.currentTheme,
        }
      },
      actions: {
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
          redirect: { trigger: actions.router.redirect.trigger },
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
