// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import SettingsLayout from '../../components/settings/SettingsLayout';
import NavBarContainer from '../NavBarContainer';
import SettingsMenu from '../../components/settings/menu/SettingsMenu';
import { buildRoute } from '../../utils/routing';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import type { GeneratedData as SidebarContainerData } from '../SidebarContainer';
import type { GeneratedData as NavBarContainerData } from '../NavBarContainer';

import MainLayout from '../MainLayout';
import SidebarContainer from '../SidebarContainer';
import NavBarTitle from '../../components/topbar/NavBarTitle';

export type GeneratedData = typeof Settings.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +children?: Node,
|};

@observer
export default class Settings extends Component<Props> {

  static defaultProps = {
    children: undefined,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  isActivePage: string => boolean = (route) => {
    const { location } = this.generated.stores.router;
    if (location) {
      return location.pathname === buildRoute(route);
    }
    return false;
  };

  render() {
    const { children } = this.props;
    const { actions, stores } = this.generated;
    const { profile } = stores;
    const { checkAdaServerStatus } = stores.serverConnectionStore;
    const sidebarContainer = (<SidebarContainer {...this.generated.SidebarContainerProps} />);

    const menu = (
      <SettingsMenu
        onItemClick={(route) => actions.router.goToRoute.trigger({ route })}
        isActiveItem={this.isActivePage}
        currentLocale={profile.currentLocale}
        currentTheme={profile.currentTheme}
      />
    );

    const navbarTitle = (
      <NavBarContainer
        {...this.generated.NavBarContainerProps}
        title={<NavBarTitle
          title={this.context.intl.formatMessage(globalMessages.sidebarSettings)}
        />}
      />
    );

    return (
      <MainLayout
        sidebar={sidebarContainer}
        navbar={navbarTitle}
        connectionErrorType={checkAdaServerStatus}
        showInContainer
        showAsCard
      >
        <SettingsLayout menu={menu}>
          {children != null ? children : null}
        </SettingsLayout>
      </MainLayout>
    );
  }

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(Settings)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        profile: {
          currentLocale: stores.profile.currentLocale,
          currentTheme: stores.profile.currentTheme,
        },
        router: {
          location: stores.router.location,
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
