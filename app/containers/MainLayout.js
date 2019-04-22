// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { Node } from 'react';
import TopBarContainer from './TopBarContainer';
import TopBarLayout from '../components/layout/TopBarLayout';
import TestnetWarningBanner from '../components/topbar/banners/TestnetWarningBanner';
import type { InjectedContainerProps } from '../types/injectedPropsType';

export type MainLayoutProps = InjectedContainerProps & {
  topbar: ?Node,
  classicTheme: boolean,
  noTopbarNoBanner?: boolean,
  footer: ?Node,
};

@observer
export default class MainLayout extends Component<MainLayoutProps> {
  static defaultProps = {
    topbar: null,
    noTopbarNoBanner: undefined,
    footer: null,
  };

  render() {
    const {
      actions,
      stores,
      topbar,
      classicTheme,
      noTopbarNoBanner,
      footer
    } = this.props;
    const topbarComponent = topbar || (<TopBarContainer actions={actions} stores={stores} />);
    return (
      <TopBarLayout
        banner={<TestnetWarningBanner classicTheme={classicTheme} />}
        topbar={topbarComponent}
        notification={<div />}
        classicTheme={classicTheme}
        noTopbarNoBanner={noTopbarNoBanner}
        footer={footer}
      >
        {this.props.children}
      </TopBarLayout>
    );
  }
}
