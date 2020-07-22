// @flow
import { observable } from 'mobx';
import Store from '../base/Store';

import type { IFetcher } from '../../api/jormungandr/lib/state-fetch/IFetcher';
import { RemoteFetcher } from '../../api/jormungandr/lib/state-fetch/remoteFetcher';
import { BatchedFetcher } from '../../api/jormungandr/lib/state-fetch/batchedFetcher';
import environment from '../../environment';

export default class JormungandrStateFetchStore extends Store {

  @observable fetcher: IFetcher;

  setup(): void {
    super.setup();
    this.fetcher = new BatchedFetcher(new RemoteFetcher(
      () => this.stores.profile.lastLaunchVersion,
      () => this.stores.profile.currentLocale,
      () => {
        if (environment.userAgentInfo.isFirefox) {
          return 'firefox';
        }
        if (environment.userAgentInfo.isChrome) {
          return 'chrome';
        }
        return '-';
      }
    ));
  }
}
