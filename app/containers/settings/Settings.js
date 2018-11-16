import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import SettingsLayout from '../../components/settings/SettingsLayout';
import SettingsMenu from '../../components/settings/menu/SettingsMenu';
import TextOnlyTopBar from '../../components/layout/TextOnlyTopbar';
import resolver from '../../utils/imports';
import { buildRoute } from '../../utils/routing';
import type { InjectedContainerProps } from '../../types/injectedPropsType';

const Layout = resolver('containers/MainLayout');

const messages = defineMessages({
  title: {
    id: 'settings.general.title',
    defaultMessage: '!!!General Settings',
    description: 'General Settings Title.'
  },
});

@inject('stores', 'actions') @observer
export default class Settings extends Component<InjectedContainerProps> {

  static defaultProps = { actions: null, stores: null };

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
    const { sidebar } = stores;
    const menu = (
      <SettingsMenu
        onItemClick={(route) => actions.router.goToRoute.trigger({ route })}
        isActiveItem={this.isActivePage}
        hasActiveWallet={stores.ada.wallets.hasActiveWallet}
      />
    );
    return (
      <Layout
        topbar={(
          <TextOnlyTopBar
            title={this.context.intl.formatMessage(messages.title)}
            onCategoryClicked={category => {
              actions.sidebar.activateSidebarCategory.trigger({ category });
            }}
            categories={sidebar.CATEGORIES}
            activeSidebarCategory={sidebar.activeSidebarCategory}
          />
        )}
      >
        <SettingsLayout menu={menu}>
          {children}
        </SettingsLayout>
      </Layout>
    );
  }
}
