import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import SettingsLayout from '../../components/settings/SettingsLayout';
import SettingsMenu from '../../components/settings/menu/SettingsMenu';
import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import TopBar from '../../components/topbar/TopBar';
import resolver from '../../utils/imports';
import { buildRoute } from '../../utils/routing';
import type { InjectedContainerProps } from '../../types/injectedPropsType';

const Layout = resolver('containers/MainLayout');

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
      <Layout
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
      >
        <SettingsLayout menu={menu}>
          {children}
        </SettingsLayout>
      </Layout>
    );
  }
}
