// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { Node } from 'react';
import TopBarLayout from '../components/layout/TopBarLayout';
import TestnetWarningBanner from '../components/topbar/banners/TestnetWarningBanner';
import ServerErrorBanner from '../components/topbar/banners/ServerErrorBanner';
import type { InjectedContainerProps } from '../types/injectedPropsType';
import type { ServerStatusErrorType } from '../types/serverStatusErrorType';

export type MainLayoutProps = InjectedContainerProps & {
  topbar?: Node,
  footer?: Node,
  classicTheme: boolean,
  connectionErrorType: ?ServerStatusErrorType,
};

@observer
export default class MainLayout extends Component<MainLayoutProps> {
  static defaultProps = {
    topbar: null,
    footer: null,
    connectionErrorType: null,
  };

  displayedBanner = this.props.connectionErrorType === null ?
    <TestnetWarningBanner /> :
    <ServerErrorBanner errorType={this.props.connectionErrorType} />;

  render() {
    return (
      <TopBarLayout
        banner={this.displayedBanner}
        topbar={this.props.topbar}
        notification={<div />}
        footer={this.props.footer}
        classicTheme={this.props.classicTheme}
      >
        {this.props.children}
      </TopBarLayout>
    );
  }
}
