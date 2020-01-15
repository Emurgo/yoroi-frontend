// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import environment from '../../environment';
import SettingsLayout from '../../components/settings/SettingsLayout';
import SettingsMenu from '../../components/settings/menu/SettingsMenu';
import { buildRoute } from '../../utils/routing';
import type { InjectedContainerProps } from '../../types/injectedPropsType';

import MainLayout from '../MainLayout';
import SidebarContainer from '../SidebarContainer';
import NavBar from '../../components/topbar/NavBar';
import NavBarTitle from '../../components/topbar/NavBarTitle';

const messages = defineMessages({
  title: {
    id: 'settings.general.title',
    defaultMessage: '!!!General Settings',
  },
});

@observer
export default class Settings extends Component<InjectedContainerProps> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  isActivePage = (route: string) => {
    const { location } = this.props.stores.router;
    if (location) {
      return location.pathname === buildRoute(route);
    }
    return false;
  };

  render() {
    const { actions, stores, children } = this.props;
    const { profile, topbar } = stores;
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;
    const sidebarContainer = (<SidebarContainer actions={actions} stores={stores} />);

    const menu = (
      <SettingsMenu
        onItemClick={(route) => actions.router.goToRoute.trigger({ route })}
        isActiveItem={this.isActivePage}
        hasActiveWallet={stores.substores.ada.wallets.hasActiveWallet}
        currentLocale={profile.currentLocale}
        currentTheme={profile.currentTheme}
      />
    );

    const navbarTitle = (
      <NavBarTitle title={this.context.intl.formatMessage(messages.title)} />
    );

    return (
      <MainLayout
        navbar={<NavBar title={navbarTitle} />}
        sidebar={sidebarContainer}
        connectionErrorType={checkAdaServerStatus}
        actions={actions}
        stores={stores}
        showInContainer
      >
        <SettingsLayout menu={menu}>
          {children != null ? children : null}
        </SettingsLayout>
      </MainLayout>
    );
  }
}
