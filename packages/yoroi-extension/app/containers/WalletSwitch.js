// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import type { StoresAndActionsProps } from '../types/injectedPropsType';

import TopBarLayout from '../components/layout/TopBarLayout';

import SidebarContainer from './SidebarContainer';
import BannerContainer from './banners/BannerContainer';
import NavBar from '../components/topbar/NavBar';

@observer
export default class WalletSwitch extends Component<StoresAndActionsProps> {

  componentDidMount() {
    // this is a temporary state as the wallet is switching wallets.
    // if switching to a new wallet, a blank screen is just flashed for a very brief amount of time
    // if pressing "back" after switching wallets, it will stop the user from going back
    this.props.stores.router.goForward();
  }

  render(): Node {
    const { actions, stores } = this.props;
    const sidebarContainer = (<SidebarContainer actions={actions} stores={stores} />);

    const navbarElement = (
      <NavBar title={undefined} />
    );
    return (
      <TopBarLayout
        banner={(<BannerContainer actions={actions} stores={stores} />)}
        sidebar={sidebarContainer}
        navbar={navbarElement}
        showInContainer
      />
    );
  }
}
