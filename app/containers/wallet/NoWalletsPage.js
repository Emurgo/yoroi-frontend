// @flow
import React, { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';

import MainLayout from '../MainLayout';

export type GeneratedData = typeof NoWalletsPage.prototype.generated;

type Props = InjectedOrGenerated<GeneratedData>

@observer
export default class NoWalletsPage extends Component<Props> {

  render() {
    const { stores } = this.generated;
    const { checkAdaServerStatus } = stores.serverConnectionStore;

    return (
      <MainLayout
        connectionErrorType={checkAdaServerStatus}
      >
        <div />
      </MainLayout>
    );
  }

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(NoWalletsPage)} no way to generated props`);
    }
    const { stores, } = this.props;
    return Object.freeze({
      stores: {
        serverConnectionStore: {
          checkAdaServerStatus: stores.substores.ada.serverConnectionStore.checkAdaServerStatus,
        },
      },
    });
  }
}
