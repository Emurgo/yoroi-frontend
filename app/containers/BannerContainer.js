// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import type { InjectedOrGenerated } from '../types/injectedPropsType';
import TestnetWarningBanner from '../components/topbar/banners/TestnetWarningBanner';
import NotProductionBanner from '../components/topbar/banners/NotProductionBanner';
import ServerErrorBanner from '../components/topbar/banners/ServerErrorBanner';
import environment from '../environment';
import { ServerStatusErrors } from '../types/serverStatusErrorType';

export type GeneratedData = typeof BannerContainer.prototype.generated;

@observer
export default class BannerContainer extends Component<InjectedOrGenerated<GeneratedData>> {

  render(): Node {
    const serverStatus = this.generated.stores.serverConnectionStore.checkAdaServerStatus;
    return (
      <>
        {serverStatus !== ServerStatusErrors.Healthy && (
          <ServerErrorBanner errorType={serverStatus} />
        )}
        <TestnetWarningBanner />
        {!environment.isProduction() && <NotProductionBanner />}
      </>
    );
  }

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(BannerContainer)} no way to generated props`);
    }
    const { stores, } = this.props;
    return Object.freeze({
      stores: {
        serverConnectionStore: {
          checkAdaServerStatus: stores.substores[environment.API]
            .serverConnectionStore.checkAdaServerStatus,
        },
      },
    });
  }
}
