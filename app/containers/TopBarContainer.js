// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import TopBar from '../components/layout/TopBar';
import type { InjectedProps } from '../types/injectedPropsType';
import environment from '../environment';
import resolver from '../utils/imports';

const { formattedWalletAmount } = resolver('utils/formatters');

type Props = InjectedProps;

@observer
export default class TopBarContainer extends Component<Props> {

  render() {
    const { actions, stores } = this.props;
    const { app, sidebar } = stores;

    return (
      <TopBar
        wallet={stores.substores[environment.API].wallets.active}
        currentRoute={app.currentRoute}
        showSubMenus={false}
        formattedWalletAmount={formattedWalletAmount}
        onCategoryClicked={category => {
          actions.sidebar.activateSidebarCategory.trigger({ category });
        }}
        categories={sidebar.CATEGORIES}
        activeSidebarCategory={sidebar.activeSidebarCategory}
      />
    );
  }
}
