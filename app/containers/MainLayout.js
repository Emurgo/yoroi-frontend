// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { Node } from 'react';
import TopBarLayout from '../components/layout/TopBarLayout';
import TestnetWarningBanner from '../components/topbar/banners/TestnetWarningBanner';
import ServerErrorBanner from '../components/topbar/banners/ServerErrorBanner';
import type { InjectedContainerProps } from '../types/injectedPropsType';
import type { ServerStatusErrorType } from '../types/serverStatusErrorType';

export type MainLayoutProps = {|
  ...InjectedContainerProps,
  topbar?: Node,
  sidebar?: Node,
  connectionErrorType: ServerStatusErrorType,
|};

@observer
export default class MainLayout extends Component<MainLayoutProps> {
  static defaultProps = {
    topbar: null,
    sidebar: null,
  };


  render() {
    const displayedBanner = this.props.connectionErrorType === 'healthy' ?
      <TestnetWarningBanner /> :
      <ServerErrorBanner errorType={this.props.connectionErrorType} />;

    return (
      <TopBarLayout
        banner={displayedBanner}
        topbar={this.props.topbar}
        sidebar={this.props.sidebar}
        notification={<div />}
      >
        {this.props.children}
      </TopBarLayout>
    );
  }
}
