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
  classicTheme: boolean,
  connectionErrorType: ServerStatusErrorType,
|};

@observer
export default class MainLayout extends Component<MainLayoutProps> {
  static defaultProps = {
    topbar: null,
  };


  render() {
    const displayedBanner = this.props.connectionErrorType === 'healthy' ?
      <TestnetWarningBanner /> :
      <ServerErrorBanner errorType={this.props.connectionErrorType} />;

    return (
      <TopBarLayout
        banner={displayedBanner}
        topbar={this.props.topbar}
        notification={<div />}
        classicTheme={this.props.classicTheme}
      >
        {this.props.children}
      </TopBarLayout>
    );
  }
}
