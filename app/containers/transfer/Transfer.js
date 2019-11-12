// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type { InjectedContainerProps } from '../../types/injectedPropsType';
import MainLayout from '../MainLayout';
import TopBar from '../../components/topbar/TopBar';
import TopBarContainer from '../TopBarContainer';
import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import TransferWithNavigation from '../../components/transfer/layouts/TransferWithNavigation';
import type { TransferNavigationProps } from '../../components/transfer/layouts/TransferWithNavigation';
import { ROUTES } from '../../routes-config';
import environment from '../../environment';

const messages = defineMessages({
  title: {
    id: 'transfer.topbar.title',
    defaultMessage: '!!!Shelley incentivized testnet balance check',
  },
});

@observer
export default class Transfer extends Component<InjectedContainerProps> {
  static contextTypes = { intl: intlShape.isRequired };

  isActiveScreen : $PropertyType<TransferNavigationProps, 'isActiveNavItem'> = page => {
    const { app } = this.props.stores;
    return app.currentRoute.endsWith(page);
  };

  handleTransferNavItemClick : $PropertyType<TransferNavigationProps, 'onNavItemClick'> = page => {

    this.props.actions.router.goToRoute.trigger({
      route: { daedalus: ROUTES.TRANSFER.DAEDALUS, yoroi: ROUTES.TRANSFER.YOROI }[page],
    });
  }

  render() {
    const { actions, stores } = this.props;
    const { topbar } = stores;
    const topbarContainer = (<TopBarContainer actions={actions} stores={stores} />);
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;

    const topbarTitle = (
      <StaticTopbarTitle title={this.context.intl.formatMessage(messages.title)} />
    );
    const topbarWithTitle = (
      <TopBar
        title={topbarTitle}
        onCategoryClicked={category => {
          actions.topbar.activateTopbarCategory.trigger({ category });
        }}
        isActiveCategory={topbar.isActiveCategory}
        categories={topbar.categories}
      />
    );

    const topbarElement = environment.isShelley() ? topbarWithTitle : topbarContainer;

    return (
      <MainLayout
        topbar={topbarElement}
        actions={actions}
        stores={stores}
        connectionErrorType={checkAdaServerStatus}
      >
        <TransferWithNavigation
          isActiveScreen={this.isActiveScreen}
          onTransferNavItemClick={this.handleTransferNavItemClick}
        >
          {this.props.children}
        </TransferWithNavigation>
      </MainLayout>
    );
  }
}
