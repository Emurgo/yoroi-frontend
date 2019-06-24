// @flow

import { action, observable, computed, runInAction } from 'mobx';
import Store from '../base/Store';
import type { ServerStatusErrorType } from '../../types/serverStatusErrorType';
import environment from '../../environment';
import type { ServerStatusResponse } from '../../api/ada/lib/state-fetch/types';

export default class ServerConnectionStore extends Store {
  SERVER_STATUS_REFRESH_INTERVAL = 20000;
  // TODO: set using environment.serverStatusRefreshInterval;
  @observable serverStatus: ?ServerStatusErrorType = null;

  setup() {
    setInterval(this._checkServerStatus, this.SERVER_STATUS_REFRESH_INTERVAL);
  }

  @computed get checkAdaServerStatus(): ?ServerStatusErrorType {
    return this.serverStatus;
  }

  @action _checkServerStatus = async (): Promise<Void> => {
    const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
    const checkServerStatusFunc = stateFetcher.checkServerStatus;
    try {
      const response: ServerStatusResponse = await checkServerStatusFunc();
      runInAction('refresh server status', () => {
        this.serverStatus = 'server'; // TODO: use response.status;
      });
    } catch (err) {
      runInAction('refresh server status', () => {
        this.serverStatus = 'network';
      });
    }
  }
}
