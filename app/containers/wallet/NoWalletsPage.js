// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import environment from '../../environment';
import resolver from '../../utils/imports';

const Layout = resolver('containers/MainLayout');

@observer
export default class NoWalletsPage extends Component<any> {

  render() {
    const { stores } = this.props;
    const { profile } = stores;
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;

    return (
      <Layout classicTheme={profile.isClassicTheme} connectionErrorType={checkAdaServerStatus}>
        <div />
      </Layout>
    );
  }

}
