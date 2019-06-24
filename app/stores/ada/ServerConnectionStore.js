// @flow

import { computed } from 'mobx';
import Store from '../base/Store';
import type { ServerStatusErrorType } from '../../types/serverStatusErrorType';
import environment from '../../environment';
import { ServerStatusError } from '../../api/ada/errors';

export default class ServerConnectionStore extends Store {
  SERVER_STATUS_REFRESH_INTERVAL = 20000;
  // TODO: set using environment.serverStatusRefreshInterval;

  setup() {
    setInterval(this._checkServerStatus, this.SERVER_STATUS_REFRESH_INTERVAL);
  }

  @computed get checkAdaServerStatus(): ServerStatusErrorType {
    return this._checkServerStatus();
  }

  async _checkServerStatus(): ServerStatusErrorType {
    const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
    const checkServerStatusFunc = stateFetcher.checkServerStatus;
    try {
      const serverStatus = await checkServerStatusFunc();
      return serverStatus.status === false ? 'server' : null;
      // I'm having an error here because flow is considering serverStatus
      // as a Promise yet and not as the object returned by the GET.
    } catch (err) {
      if (err instanceof ServerStatusError) {
        return 'network';
        // Same here as line 27.
      }
      throw new Error('Unexpected Error');
    }
  }
}
