// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import environment from '../../environment';

import MainLayout from '../MainLayout';

@observer
export default class NoWalletsPage extends Component<any> {

  render() {
    const { actions, stores } = this.props;
    const { profile } = stores;
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;

    return (
      <MainLayout
        classicTheme={profile.isClassicTheme}
        connectionErrorType={checkAdaServerStatus}
        actions={actions}
        stores={stores}
      >
        <div />
      </MainLayout>
    );
  }

}
