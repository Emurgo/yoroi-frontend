// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { computed, } from 'mobx';
import { intlShape, defineMessages } from 'react-intl';
import TopBarLayout from '../../components/layout/TopBarLayout';
import VerticallyCenteredLayout from '../../components/layout/VerticallyCenteredLayout';
import SidebarContainer from '../SidebarContainer';
import NavBarContainer from '../NavBarContainer';
import type { GeneratedData as SidebarContainerData } from '../SidebarContainer';
import type { GeneratedData as NavBarContainerData } from '../NavBarContainer';
import BannerContainer from '../BannerContainer';
import type { GeneratedData as BannerContainerData } from '../BannerContainer';
import WalletWithNavigation from '../../components/wallet/layouts/WalletWithNavigation';
import NavBarBack from '../../components/topbar/NavBarBack';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { buildRoute, } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { WarningList } from '../../stores/toplevel/WalletSettingsStore';

export type GeneratedData = typeof Wallet.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +children?: Node,
|};

const messages = defineMessages({
  backButton: {
    id: 'wallet.nav.backButton',
    defaultMessage: '!!!Back to my wallets',
  },
});

@observer
export default class Wallet extends Component<Props> {

  static defaultProps: {|children: void|} = {
    children: undefined
  };

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  navigateToWallets: string => void = (destination) => {
    this.generated.actions.router.goToRoute.trigger({ route: destination });
  }

  isActiveScreen: (
    route: string,
    matchesPrefix: ?boolean
  ) => boolean = (route, matchesPrefix) => {
    const { app } = this.generated.stores;
    const { selected } = this.generated.stores.wallets;
    if (selected == null) return false;
    const screenRoute = buildRoute(
      route,
      {
        id: selected.getPublicDeriverId(),
      }
    );
    // only check that the page is a prefix of the current route (to handle subpages)
    if (matchesPrefix === true) {
      return app.currentRoute.indexOf(screenRoute) !== -1;
    }
    return app.currentRoute === screenRoute;
  };

  handleWalletNavItemClick: (string) => void = (route) => {
    const { wallets } = this.generated.stores;
    const selected = wallets.selected;
    if (selected == null) return;
    this.generated.actions.router.goToRoute.trigger({
      route,
      params: { id: selected.getPublicDeriverId() },
    });
  };

  render(): Node {
    const { intl } = this.context;
    const { wallets, } = this.generated.stores;
    const sidebarContainer = (<SidebarContainer {...this.generated.SidebarContainerProps} />);
    const navbarContainer = (
      <NavBarContainer
        {...this.generated.NavBarContainerProps}
        title={
          <NavBarBack
            route={ROUTES.MY_WALLETS}
            onBackClick={this.navigateToWallets}
            title={intl.formatMessage(messages.backButton)}
          />
        }
      />
    );

    if (!wallets.selected) {
      return (
        <TopBarLayout
          banner={(<BannerContainer {...this.generated.BannerContainerProps} />)}
          navbar={navbarContainer}
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

    return (
      <TopBarLayout
        banner={(<BannerContainer {...this.generated.BannerContainerProps} />)}
        sidebar={sidebarContainer}
        navbar={navbarContainer}
        showInContainer
        showAsCard
      >
        {warning}
        <WalletWithNavigation
          wallet={selectedWallet}
          isActiveScreen={this.isActiveScreen}
          onWalletNavItemClick={this.handleWalletNavItemClick}
        >
          {this.props.children}
        </WalletWithNavigation>
      </TopBarLayout>
    );
  }

  getWarning: PublicDeriver<> => void | Node = (publicDeriver) => {
    const warnings = this.generated.stores.walletSettings.getWalletWarnings(publicDeriver).dialogs;
    if (warnings.length === 0) {
      return undefined;
    }
    return warnings[warnings.length - 1]();
  }

  @computed get generated(): {|
    BannerContainerProps: InjectedOrGenerated<BannerContainerData>,
    NavBarContainerProps: InjectedOrGenerated<NavBarContainerData>,
    SidebarContainerProps: InjectedOrGenerated<SidebarContainerData>,
    actions: {|
      router: {|
        goToRoute: {|
          trigger: (params: {|
            forceRefresh?: boolean,
            params?: ?any,
            route: string
          |}) => void
        |}
      |}
    |},
    stores: {|
      app: {| currentRoute: string |},
      walletSettings: {|
        getWalletWarnings: (PublicDeriver<>) => WarningList
      |},
      wallets: {| selected: null | PublicDeriver<> |}
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
        },
        walletSettings: {
          getWalletWarnings: settingStore.getWalletWarnings,
        },
      },
      actions: {
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
      },
      SidebarContainerProps: ({ actions, stores, }: InjectedOrGenerated<SidebarContainerData>),
      NavBarContainerProps: ({ actions, stores, }: InjectedOrGenerated<NavBarContainerData>),
      BannerContainerProps: ({ actions, stores }: InjectedOrGenerated<BannerContainerData>),
    });
  }
}
