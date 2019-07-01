// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import SettingsLayout from '../../components/settings/SettingsLayout';
import SettingsMenu from '../../components/settings/menu/SettingsMenu';
import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import TopBar from '../../components/topbar/TopBar';
import { buildRoute } from '../../utils/routing';
import type { InjectedContainerProps } from '../../types/injectedPropsType';

import MainLayout from '../MainLayout';

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

    const menu = (
      <SettingsMenu
        onItemClick={(route) => actions.router.goToRoute.trigger({ route })}
        isActiveItem={this.isActivePage}
        hasActiveWallet={stores.substores.ada.wallets.hasActiveWallet}
        currentLocale={profile.currentLocale}
        currentTheme={profile.currentTheme}
      />
    );
    const topbarTitle = (
      <StaticTopbarTitle title={this.context.intl.formatMessage(messages.title)} />
    );
    return (
      <MainLayout
        topbar={(
          <TopBar
            title={topbarTitle}
            onCategoryClicked={category => {
              actions.topbar.activateTopbarCategory.trigger({ category });
            }}
            categories={topbar.CATEGORIES}
            activeTopbarCategory={topbar.activeTopbarCategory}
          />
        )}
        classicTheme={profile.isClassicTheme}
        actions={actions}
        stores={stores}
      >
        <SettingsLayout menu={menu}>
          {children || null /* the "|| null" part keeps flow happy */}
        </SettingsLayout>
      </MainLayout>
    );
  }
}
