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
  oldTheme: boolean,
  isTopBarVisible?: boolean,
  isBannerVisible?: boolean,
  withFooter? : boolean
};

@observer
export default class MainLayout extends Component<MainLayoutProps> {
  static defaultProps = {
    topbar: null,
    isTopBarVisible: undefined,
    isBannerVisible: undefined,
    withFooter: undefined
  };

  render() {
    const {
      actions,
      stores,
      topbar,
      oldTheme,
      isTopBarVisible,
      isBannerVisible,
      withFooter
    } = this.props;
    const topbarComponent = topbar || (<TopBarContainer actions={actions} stores={stores} />);
    return (
      <TopBarLayout
        banner={<TestnetWarningBanner oldTheme={oldTheme} />}
        topbar={topbarComponent}
        notification={<div />}
        oldTheme={oldTheme}
        isTopBarVisible={isTopBarVisible}
        isBannerVisible={isBannerVisible}
        withFooter={withFooter}
      >
        {this.props.children}
      </TopBarLayout>
    );
  }
}
