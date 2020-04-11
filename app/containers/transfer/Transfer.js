// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import MainLayout from '../MainLayout';
import SidebarContainer from '../SidebarContainer';
import BackgroundColoredLayout from '../../components/layout/BackgroundColoredLayout';
import NoWalletMessage from '../../components/wallet/settings/NoWalletMessage';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import NavBarContainer from '../NavBarContainer';
import globalMessages from '../../i18n/global-messages';
import WalletTransferPage from './WalletTransferPage';
import type { GeneratedData as WalletTransferPageData } from './WalletTransferPage';
import type { GeneratedData as SidebarContainerData } from '../SidebarContainer';
import type { GeneratedData as NavBarContainerData } from '../NavBarContainer';

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

  render() {
    const { stores } = this.generated;
    const sidebarContainer = (<SidebarContainer {...this.generated.SidebarContainerProps} />);
    const { checkAdaServerStatus } = stores.serverConnectionStore;

    const navbar = (
      <NavBarContainer
        {...this.generated.NavBarContainerProps}
        title={<NavBarTitle
          title={this.context.intl.formatMessage(globalMessages.sidebarTransfer)}
        />}
      />
    );

    return (
      <MainLayout
        navbar={navbar}
        sidebar={sidebarContainer}
        connectionErrorType={checkAdaServerStatus}
        showInContainer
      >
        {this.getContent()}
      </MainLayout>
    );
  }

  getContent: void => Node = () => {
    const wallet = this.generated.stores.wallets.selected;
    if (wallet == null) {
      return (<NoWalletMessage />);
    }
    return (
      <BackgroundColoredLayout>
        <WalletTransferPage
          {...this.generated.WalletTransferPageProps}
          publicDeriver={wallet}
        />
      </BackgroundColoredLayout>
    );
  }

  @computed get generated() {
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
        wallets: {
          selected: stores.wallets.selected,
        }
      },
      actions: {
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
      },
      SidebarContainerProps: (
        { actions, stores, }: InjectedOrGenerated<SidebarContainerData>
      ),
      NavBarContainerProps: (
        { actions, stores, }: InjectedOrGenerated<NavBarContainerData>
      ),
      WalletTransferPageProps: (
        { actions, stores, }: InjectedOrGenerated<WalletTransferPageData>
      ),
    });
  }
}
