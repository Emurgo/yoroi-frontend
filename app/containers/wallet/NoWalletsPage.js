// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import resolver from '../../utils/imports';

const Layout = resolver('containers/MainLayout');

export default
@inject('stores', 'actions') @observer
class NoWalletsPage extends Component<any> {

  render() {
    return (
      <Layout>
        <div />
      </Layout>
    );
  }

}
