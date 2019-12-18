// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import environment from '../../environment';
import type { InjectedProps } from '../../types/injectedPropsType';

import MyWallets from '../../components/wallet/my-wallets/MyWallets';
import MainLayout from '../MainLayout';
import TopBarContainer from '../TopBarContainer';

type Props = InjectedProps

@observer
export default class MyWalletsPage extends Component<Props> {

  render() {
    const { wallets } = this.props.stores.substores.ada;
    const { actions, stores } = this.props;
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;
    const topbarContainer = (<TopBarContainer actions={actions} stores={stores} />);

    return (
      <MainLayout
        topbar={topbarContainer}
        actions={actions}
        stores={stores}
        connectionErrorType={checkAdaServerStatus}
      >
        <MyWallets wallets={wallets} />
      </MainLayout>
    );
  }
}
