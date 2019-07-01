// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';

import MainLayout from '../MainLayout';

@observer
export default class NoWalletsPage extends Component<any> {

  render() {
    const { actions, stores } = this.props;
    const { profile } = stores;
    return (
      <MainLayout
        classicTheme={profile.isClassicTheme}
        actions={actions}
        stores={stores}
      >
        <div />
      </MainLayout>
    );
  }

}
