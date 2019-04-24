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
  isClassicThemeActive: boolean,
  noTopbar?: boolean,
  footer: ?Node,
};

@observer
export default class MainLayout extends Component<MainLayoutProps> {
  static defaultProps = {
    topbar: null,
    noTopbar: undefined,
    footer: null,
  };

  render() {
    const {
      actions,
      stores,
      topbar,
      isClassicThemeActive,
      noTopbar,
      footer
    } = this.props;
    const topbarComponent = topbar || (<TopBarContainer actions={actions} stores={stores} />);
    return (
      <TopBarLayout
        isClassicThemeActive={isClassicThemeActive}
        banner={<TestnetWarningBanner isClassicThemeActive={isClassicThemeActive} />}
        topbar={topbarComponent}
        noTopbar={noTopbar}
        notification={<div />}
        footer={footer}
      >
        {this.props.children}
      </TopBarLayout>
    );
  }
}
