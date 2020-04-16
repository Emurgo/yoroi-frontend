// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { intlShape, defineMessages } from 'react-intl';
import MainLayout from '../MainLayout';
import VerticallyCenteredLayout from '../../components/layout/VerticallyCenteredLayout';
import SidebarContainer from '../SidebarContainer';
import NavBarContainer from '../NavBarContainer';
import type { GeneratedData as SidebarContainerData } from '../SidebarContainer';
import type { GeneratedData as NavBarContainerData } from '../NavBarContainer';
import WalletWithNavigation from '../../components/wallet/layouts/WalletWithNavigation';
import NavBarBack from '../../components/topbar/NavBarBack';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { buildRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';

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

  static defaultProps = {
    children: undefined
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  navigateToWallets: string => void = (destination) => {
    this.generated.actions.router.goToRoute.trigger({ route: destination });
  }

  isActiveScreen = (route: string, matchesPrefix: ?boolean): boolean => {
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

  render() {
    const { intl } = this.context;
    const { wallets, } = this.generated.stores;
    const { stores } = this.generated;
    const { checkAdaServerStatus } = stores.serverConnectionStore;
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
        <MainLayout
          navbar={navbarContainer}
          connectionErrorType={checkAdaServerStatus}
          showInContainer
          showAsCard
        >
          <VerticallyCenteredLayout>
            <LoadingSpinner />
          </VerticallyCenteredLayout>
        </MainLayout>
      );
    }

    return (
      <MainLayout
        sidebar={sidebarContainer}
        navbar={navbarContainer}
        connectionErrorType={checkAdaServerStatus}
        showInContainer
        showAsCard
      >
        <WalletWithNavigation
          wallet={wallets.selected}
          isActiveScreen={this.isActiveScreen}
          onWalletNavItemClick={this.handleWalletNavItemClick}
        >
          {this.props.children}
        </WalletWithNavigation>
      </MainLayout>
    );
  }

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(Wallet)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        app: {
          currentRoute: stores.app.currentRoute,
        },
        wallets: {
          selected: stores.wallets.selected,
        },
        serverConnectionStore: {
          checkAdaServerStatus: stores.substores.ada.serverConnectionStore.checkAdaServerStatus,
        },
      },
      actions: {
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
      },
      SidebarContainerProps: ({ actions, stores, }: InjectedOrGenerated<SidebarContainerData>),
      NavBarContainerProps: ({ actions, stores, }: InjectedOrGenerated<NavBarContainerData>),
    });
  }
}
