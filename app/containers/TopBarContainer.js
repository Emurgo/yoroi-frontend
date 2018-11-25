// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import TopBar from '../components/layout/TopBar';
import WalletTopbarTitle from '../components/wallet/WalletTopbarTitle';
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

    const title = (<WalletTopbarTitle
      wallet={stores.substores[environment.API].wallets.active}
      currentRoute={app.currentRoute}
      formattedWalletAmount={formattedWalletAmount}
    />);
    return (
      <TopBar
        title={title}
        onCategoryClicked={category => {
          actions.sidebar.activateSidebarCategory.trigger({ category });
        }}
        categories={sidebar.CATEGORIES}
        activeSidebarCategory={sidebar.activeSidebarCategory}
      />
    );
  }
}
