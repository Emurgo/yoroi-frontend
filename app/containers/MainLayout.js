// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { Node } from 'react';
import TopBarContainer from './TopBarContainer';
import SidebarLayout from '../components/layout/SidebarLayout';
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
    const topbarComponent = topbar || (<TopBarContainer actions={actions} stores={stores} />);
    return (
      <SidebarLayout
        topbar={topbarComponent}
        notification={<div />}
        contentDialogs={[]}
      >
        {this.props.children}
      </SidebarLayout>
    );
  }
}
