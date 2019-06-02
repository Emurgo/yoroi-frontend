// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { Node } from 'react';
import TopBarContainer from './TopBarContainer';
import TopBarLayout from '../components/layout/TopBarLayout';
import TestnetWarningBanner from '../components/topbar/banners/TestnetWarningBanner';
import type { InjectedContainerProps } from '../types/injectedPropsType';
import type { ActionsMap } from '../actions';
import type { StoresMap } from '../stores';

export type MainLayoutProps = InjectedContainerProps & {
  topbar?: Node,
  footer?: Node,
  classicTheme: boolean,
};

@observer
export default class MainLayout extends Component<MainLayoutProps> {
  static defaultProps = {
    topbar: null,
    footer: null,
  };

  _makeDefaultTopbar = (actions: ActionsMap, stores: StoresMap):?Node => {
    /** Note: Sometimes MainLayout is called
      * even before ActionsMap and StoresMap is fully initialized */
    if (actions && stores) {
      return <TopBarContainer actions={actions} stores={stores} />;
    }
  }

  render() {
    const {
      actions,
      stores,
      topbar,
      classicTheme,
      footer
    } = this.props;

    let topbarComponent = topbar;
    if (!topbarComponent) {
      topbarComponent = this._makeDefaultTopbar(actions, stores);
    }

    return (
      <TopBarLayout
        banner={<TestnetWarningBanner />}
        topbar={topbarComponent}
        notification={<div />}
        footer={footer}
        classicTheme={classicTheme}
      >
        {this.props.children}
      </TopBarLayout>
    );
  }
}
