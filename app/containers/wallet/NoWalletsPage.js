// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import resolver from '../../utils/imports';
import { THEMES } from '../../themes';

const Layout = resolver('containers/MainLayout');

@observer
export default class NoWalletsPage extends Component<any> {

  render() {
    const { stores } = this.props;
    const { profile } = stores;
    return (
      <Layout classicTheme={profile.currentTheme === THEMES.YOROI_CLASSIC}>
        <div />
      </Layout>
    );
  }

}
