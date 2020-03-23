// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { Node } from 'react';
import TopBarLayout from '../components/layout/TopBarLayout';
import TestnetWarningBanner from '../components/topbar/banners/TestnetWarningBanner';
import ServerErrorBanner from '../components/topbar/banners/ServerErrorBanner';
import type { ServerStatusErrorType } from '../types/serverStatusErrorType';
import { ServerStatusErrors } from '../types/serverStatusErrorType';

export type MainLayoutProps = {|
  children: Node,
  topbar?: Node,
  sidebar?: Node,
  navbar?: Node,
  connectionErrorType: ServerStatusErrorType,
  showInContainer?: boolean,
  showAsCard?: boolean,
|};

@observer
export default class MainLayout extends Component<MainLayoutProps> {
  static defaultProps = {
    topbar: null,
    showInContainer: false,
    showAsCard: false,
    sidebar: null,
    navbar: null,
  };


  render() {
    const displayedBanner = this.props.connectionErrorType === ServerStatusErrors.Healthy ?
      <TestnetWarningBanner /> :
      <ServerErrorBanner errorType={this.props.connectionErrorType} />;

    return (
      <TopBarLayout
        banner={displayedBanner}
        topbar={this.props.topbar}
        sidebar={this.props.sidebar}
        navbar={this.props.navbar}
        notification={undefined}
        showInContainer={this.props.showInContainer}
        showAsCard={this.props.showAsCard}
      >
        {this.props.children}
      </TopBarLayout>
    );
  }
}
