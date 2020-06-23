// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import type { InjectedOrGenerated } from '../types/injectedPropsType';

import TopBarLayout from '../components/layout/TopBarLayout';

import SidebarContainer from './SidebarContainer';
import BannerContainer from './banners/BannerContainer';
import type { GeneratedData as BannerContainerData } from './banners/BannerContainer';
import type { GeneratedData as SidebarContainerData } from './SidebarContainer';
import NavBar from '../components/topbar/NavBar';

export type GeneratedData = typeof WalletSwitch.prototype.generated;

type Props = InjectedOrGenerated<GeneratedData>

@observer
export default class WalletSwitch extends Component<Props> {

  componentDidMount() {
    // this is a temporary state as the wallet is switching wallets.
    // if switching to a new wallet, a blank screen is just flashed for a very brief amount of time
    // if pressing "back" after switching wallets, it will stop the user from going back
    this.generated.stores.router.goForward();
  }

  render(): Node {
    const sidebarContainer = (<SidebarContainer {...this.generated.SidebarContainerProps} />);

    const navbarElement = (
      <NavBar title={undefined} />
    );
    return (
      <TopBarLayout
        banner={(<BannerContainer {...this.generated.BannerContainerProps} />)}
        sidebar={sidebarContainer}
        navbar={navbarElement}
        showInContainer
      />
    );
  }

  @computed get generated(): {|
    BannerContainerProps: InjectedOrGenerated<BannerContainerData>,
    SidebarContainerProps: InjectedOrGenerated<SidebarContainerData>,
    stores: {|
      router: {|
        goForward: void => void,
      |},
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WalletSwitch)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        router: {
          goForward: stores.router.goForward
        },
      },
      SidebarContainerProps: (
        { actions, stores }: InjectedOrGenerated<SidebarContainerData>
      ),
      BannerContainerProps: ({ actions, stores }: InjectedOrGenerated<BannerContainerData>),
    });
  }
}
