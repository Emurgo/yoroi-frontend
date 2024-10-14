// @flow

import { observable, computed, runInAction } from 'mobx';
import Store from '../base/Store';
import type { ServerStatusErrorType } from '../../types/serverStatusErrorType';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import { listenForServerStatusUpdate } from '../../api/thunk';
import type { ServerStatus } from '../../../chrome/extension/background/types';
import { networks } from '../../api/ada/lib/storage/database/prepackaged/networks';

export default class ServerConnectionStore extends Store<StoresMap, ActionsMap> {
  @observable serverStatusByNetworkId: {| [networkId: number]: ServerStatus |} = {};

  setup(): void {
    super.setup();

    for (const networkName of Object.keys(networks)) {
      const network = networks[networkName];
      this.serverStatusByNetworkId[network.NetworkId] = {
        networkId: network.NetworkId,
        isServerOk: true,
        isMaintenance: false,
        clockSkew: 0,
        lastUpdateTimestamp: Date.now(),
      };
    }

    listenForServerStatusUpdate(async (serverStatus) => {
      runInAction(() => {
        for (const s of serverStatus) {
          const oldStatus = this.serverStatusByNetworkId[s.networkId];
          if (oldStatus) {
            Object.assign(oldStatus, s);
          }
        }
      });
    });
  }

  get serverTime(): void | Date {
    const serverStatus = this._getServerStatus();
    if (serverStatus) {
      return new Date(serverStatus.clockSkew + Date.now());
    }
    return undefined;
  }

  get isMaintenance(): boolean {
    const serverStatus = this._getServerStatus();
    if (serverStatus) {
      return serverStatus.isMaintenance;
    }
    return false;
  }

  @computed get checkAdaServerStatus(): ServerStatusErrorType {
    const serverStatus = this._getServerStatus();
    if (serverStatus) {
      return serverStatus.isServerOk ? ServerStatusErrors.Healthy : ServerStatusErrors.Server;
    }
    // this is a temporary condition, we'll soon get an update
    return ServerStatusErrors.Healthy;
  }

  _getServerStatus(): ServerStatus | void {
    let networkId;
    const { selected } = this.stores.wallets;
    if (selected) {
      networkId = selected.networkId;
    } else {
      networkId = networks.CardanoMainnet.NetworkId;
    }
    return this.serverStatusByNetworkId[networkId];
  }
}
