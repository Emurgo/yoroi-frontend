// @flow
import { observable } from 'mobx';
import Store from '../base/Store';

import type { IFetcher } from '../../api/common/lib/state-fetch/IFetcher';
import { RemoteFetcher } from '../../api/common/lib/state-fetch/remoteFetcher';
import { BatchedFetcher } from '../../api/common/lib/state-fetch/batchedFetcher';
import environment from '../../environment';

export default class StateFetchStore extends Store {

  @observable fetcher: IFetcher;

  setup(): void {
    super.setup();
    this.fetcher = new BatchedFetcher(new RemoteFetcher(
      () => environment.version,
      () => this.stores.profile.currentLocale,
      () => {
        if (environment.userAgentInfo.isFirefox) {
          return 'firefox';
        }
        if (environment.userAgentInfo.isChrome) {
          return 'chrome';
        }
        return '-';
      },
      () => {
        if (this.stores.wallets.selected == null) {
          throw new Error(`${nameof(StateFetchStore)} no selected wallet`);
        }
        const { selected } = this.stores.wallets;
        const networkInfo = selected.getParent().getNetworkInfo();
        const backendUrl = networkInfo.Backend.BackendService;
        if (backendUrl == null) {
          throw new Error(`${nameof(StateFetchStore)} no ${nameof(backendUrl)} for wallet`);
        }
        return backendUrl;
      },
    ));
  }
}
