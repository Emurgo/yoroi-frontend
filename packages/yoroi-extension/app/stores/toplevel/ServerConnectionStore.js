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
  @observable serverStatus: Array<ServerStatus> = [];

  setup(): void {
    super.setup();

    listenForServerStatusUpdate(async (serverStatus) => {
      runInAction(() => {
        //this.serverStatus.splice(0, this.serverStatus.length, ...serverStatus);
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
    return this.serverStatus.find(s => s.networkId === networkId);
  }
}
