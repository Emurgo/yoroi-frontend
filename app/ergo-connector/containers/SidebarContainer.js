// // @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';

import Sidebar from '../components/layout/Sidebar';

@observer
export default class SidebarContainer extends Component<any> {
  render(): Node {
    return <Sidebar onClickNavItems={this.props.onClickNavItems} />;
  }
}
