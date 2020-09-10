// @flow
import { observable } from 'mobx';
import Store from '../base/Store';

import type { IFetcher } from '../../api/ada/lib/state-fetch/IFetcher';
import { RemoteFetcher } from '../../api/ada/lib/state-fetch/remoteFetcher';
import { BatchedFetcher } from '../../api/ada/lib/state-fetch/batchedFetcher';
import environment from '../../environment';
import { isCardanoHaskell } from '../../api/ada/lib/storage/database/prepackaged/networks';

export default class AdaStateFetchStore extends Store {

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
          throw new Error(`${nameof(AdaStateFetchStore)} no selected wallet`);
        }
        const { selected } = this.stores.wallets;
        const networkInfo = selected.getParent().getNetworkInfo();
        if (!isCardanoHaskell(networkInfo)) {
          throw new Error(`${nameof(AdaStateFetchStore)} selected wallet is not a Cardano wallet`);
        }
        const backendUrl = networkInfo.Backend.BackendService;
        if (backendUrl == null) {
          throw new Error(`${nameof(AdaStateFetchStore)} no ${nameof(backendUrl)} for wallet`);
        }
        return backendUrl;
      },
    ));
  }
}
