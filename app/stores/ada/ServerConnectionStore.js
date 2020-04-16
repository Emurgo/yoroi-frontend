// @flow

import { action, observable, computed, runInAction } from 'mobx';
import Store from '../base/Store';
import type { ServerStatusErrorType } from '../../types/serverStatusErrorType';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import environment from '../../environment';
import type { ServerStatusResponse } from '../../api/ada/lib/state-fetch/types';

export default class ServerConnectionStore extends Store {
  SERVER_STATUS_REFRESH_INTERVAL: number = environment.serverStatusRefreshInterval;

  @observable serverStatus: ServerStatusErrorType = ServerStatusErrors.Healthy;

  setup(): void {
    super.setup();
    setInterval(this._checkServerStatus, this.SERVER_STATUS_REFRESH_INTERVAL);
  }

  @computed get checkAdaServerStatus(): ServerStatusErrorType {
    return this.serverStatus;
  }

  @action _checkServerStatus: void => Promise<void> = async () => {
    const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
    const checkServerStatusFunc = stateFetcher.checkServerStatus;
    try {
      const response: ServerStatusResponse = await checkServerStatusFunc();
      runInAction('refresh server status', () => {
        this.serverStatus = response.isServerOk === true
          ? ServerStatusErrors.Healthy
          : ServerStatusErrors.Server;
      });
    } catch (err) {
      runInAction('refresh server status', () => {
        this.serverStatus = ServerStatusErrors.Network;
      });
    }
  }
}
