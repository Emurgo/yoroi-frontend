// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import resolver from '../../utils/imports';

const Layout = resolver('containers/MainLayout');

@observer
export default class NoWalletsPage extends Component<any> {

  render() {
    const { stores } = this.props;
    const { theme } = stores;
    return (
      <Layout classicTheme={theme.classic}>
        <div />
      </Layout>
    );
  }

}
