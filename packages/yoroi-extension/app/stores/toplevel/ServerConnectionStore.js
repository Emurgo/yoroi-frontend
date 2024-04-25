// @flow

import { action, observable, computed, runInAction } from 'mobx';
import Store from '../base/Store';
import type { ServerStatusErrorType } from '../../types/serverStatusErrorType';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import environment from '../../environment';
import type { ServerStatusResponse } from '../../api/common/lib/state-fetch/types';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';

export default class ServerConnectionStore extends Store<StoresMap, ActionsMap> {
  SERVER_STATUS_REFRESH_INTERVAL: number = environment.getServerStatusRefreshInterval();

  @observable serverStatus: ServerStatusErrorType = ServerStatusErrors.Healthy;
  @observable isMaintenance: boolean = false;
  parallelSync: boolean = false;

  // set to undefined as a starting value
  // to detect if we've never managed to connect to the server (Yoroi running in offline mode)
  @observable serverTime: void | Date = undefined;

  setup(): void {
    super.setup();

    // do not await on purpose -- it's okay if this is async
    this._checkServerStatus();
    setInterval(this._checkServerStatus, this.SERVER_STATUS_REFRESH_INTERVAL);
  }

  @computed get checkAdaServerStatus(): ServerStatusErrorType {
    return this.serverStatus;
  }

  @action _checkServerStatus: void => Promise<void> = async () => {
    const stateFetcher = this.stores.stateFetchStore.fetcher;
    const checkServerStatusFunc = stateFetcher.checkServerStatus;
    try {
      const response: ServerStatusResponse = await checkServerStatusFunc();
      const refreshServerStatus = () => {
        this.serverStatus = response.isServerOk === true
          ? ServerStatusErrors.Healthy
          : ServerStatusErrors.Server;
        this.isMaintenance = response.isMaintenance || false;
        const parallelSync = response.parallelSync || false;
        if (parallelSync !== this.parallelSync) {
          this.parallelSync = parallelSync;
          this.actions.serverConnection.parallelSyncStateChange.trigger();
        }
        this.serverTime = new Date(response.serverTime);
      }
      runInAction(refreshServerStatus);
    } catch (err) {
      const refreshServerStatusErr = () => {
        this.serverStatus = ServerStatusErrors.Network;
      };
      runInAction(refreshServerStatusErr);
    }
  }
}
