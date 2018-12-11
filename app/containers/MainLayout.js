// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { Node } from 'react';
import TopBarContainer from './TopBarContainer';
import TopBarLayout from '../components/layout/TopBarLayout';
import LockScreen from '../components/LockScreen';
import TestnetWarningBanner from '../components/topbar/banners/TestnetWarningBanner';
import type { InjectedContainerProps } from '../types/injectedPropsType';

export type MainLayoutProps = InjectedContainerProps & {
  topbar: ?Node
};

@observer
export default class MainLayout extends Component<MainLayoutProps> {
  static defaultProps = {
    topbar: null
  };

  render() {
    const { actions, stores, topbar } = this.props;
    const { profile = {} } = stores;
    const {
      lockScreenEnabled,
      pinCode,
      isAppLocked,
    } = profile;
    const locked = Boolean(pinCode) && lockScreenEnabled && isAppLocked;
    const topbarComponent = topbar || (<TopBarContainer actions={actions} stores={stores} />);
    if (locked) return <LockScreen pin={pinCode} unlock={actions.profile.toggleAppLocked} />;
    return (
      <TopBarLayout
        banner={<TestnetWarningBanner />}
        topbar={topbarComponent}
        notification={<div />}
      >
        {this.props.children}
      </TopBarLayout>
    );
  }
}
