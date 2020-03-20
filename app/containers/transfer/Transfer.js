// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import MainLayout from '../MainLayout';
import SidebarContainer from '../SidebarContainer';
import TransferWithNavigation from '../../components/transfer/layouts/TransferWithNavigation';
import type { TransferNavigationProps } from '../../components/transfer/layouts/TransferWithNavigation';
import { ROUTES } from '../../routes-config';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import NavBar from '../../components/topbar/NavBar';
import globalMessages from '../../i18n/global-messages';
import type { GeneratedData as SidebarContainerData } from '../SidebarContainer';

export type GeneratedData = typeof Transfer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +children?: Node,
|};

@observer
export default class Transfer extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    children: undefined,
  };

  @computed get generated(): GeneratedData {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(Transfer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        app: {
          currentRoute: stores.app.currentRoute,
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
      SidebarContainerProps: (
        { actions, stores, }: InjectedOrGenerated<SidebarContainerData>
      ),
    });
  }

  isActiveScreen : $PropertyType<TransferNavigationProps, 'isActiveNavItem'> = page => {
    const { app } = this.generated.stores;
    return app.currentRoute.endsWith(page);
  };

  handleTransferNavItemClick : $PropertyType<TransferNavigationProps, 'onNavItemClick'> = page => {
    this.generated.actions.router.goToRoute.trigger({
      route: { daedalus: ROUTES.TRANSFER.DAEDALUS, yoroi: ROUTES.TRANSFER.YOROI }[page],
    });
  }

  render() {
    const { stores } = this.generated;
    const sidebarContainer = (<SidebarContainer {...this.generated.SidebarContainerProps} />);
    const { checkAdaServerStatus } = stores.serverConnectionStore;

    const navbarTitle = (
      <NavBarTitle title={this.context.intl.formatMessage(globalMessages.sidebarTransfer)} />
    );

    return (
      <MainLayout
        navbar={<NavBar title={navbarTitle} />}
        sidebar={sidebarContainer}
        connectionErrorType={checkAdaServerStatus}
        showInContainer
        showAsCard
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
