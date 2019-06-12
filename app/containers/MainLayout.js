// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { Node } from 'react';
import TopBarLayout from '../components/layout/TopBarLayout';
import TestnetWarningBanner from '../components/topbar/banners/TestnetWarningBanner';
import type { InjectedContainerProps } from '../types/injectedPropsType';

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

  render() {
    return (
      <TopBarLayout
        banner={<TestnetWarningBanner />}
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
